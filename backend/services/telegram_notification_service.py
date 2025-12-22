"""
Telegram Bot Service for Video Campaign Notifications
Sends campaign requests to Telegram channel for manual processing
"""

import os
import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class TelegramNotificationService:
    """Service for sending notifications to Telegram channel"""
    
    @property
    def bot_token(self):
        return os.getenv('TELEGRAM_BOT_TOKEN')
    
    @property
    def channel_id(self):
        return os.getenv('TELEGRAM_CHANNEL_ID')
    
    @property
    def base_url(self):
        return f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None
    
    def is_configured(self) -> bool:
        """Check if Telegram is properly configured"""
        configured = bool(self.bot_token and self.channel_id)
        if not configured:
            logger.warning(f"⚠️ Telegram not configured. BOT_TOKEN: {bool(self.bot_token)}, CHANNEL_ID: {bool(self.channel_id)}")
        else:
            logger.info(f"✅ Telegram configured. Channel: {self.channel_id}")
        return configured
    
    def send_video_campaign_request(self, campaign_data: Dict[str, Any]) -> bool:
        """
        Send a video campaign request to Telegram channel
        
        Args:
            campaign_data: Dictionary containing all campaign details
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("❌ Telegram not configured - cannot send notification")
            return False
        
        try:
            # Format the message with all campaign details
            message = self._format_campaign_message(campaign_data)
            
            # Send to Telegram
            url = f"{self.base_url}/sendMessage"
            payload = {
                "chat_id": self.channel_id,
                "text": message,
                "parse_mode": "HTML",
                "disable_web_page_preview": False
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    logger.info(f"✅ Telegram notification sent successfully")
                    return True
                else:
                    logger.error(f"❌ Telegram API error: {result}")
                    return False
            else:
                logger.error(f"❌ Telegram request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending Telegram notification: {e}")
            return False
    
    def _format_campaign_message(self, data: Dict[str, Any]) -> str:
        """Format campaign data into a readable Telegram message"""
        
        # Extract data
        customer_id = data.get('customer_id', 'N/A')
        customer_email = data.get('customer_email', 'N/A')
        campaign_name = data.get('campaign_name', 'N/A')
        campaign_type = data.get('campaign_type', 'VIDEO')
        video_ad_type = data.get('video_ad_type', 'N/A')
        
        # Budget info
        daily_budget = data.get('daily_budget', 0)
        currency = data.get('currency', 'USD')
        
        # Targeting
        locations = data.get('target_locations', [])
        language = data.get('language', 'ar')
        
        # Video info
        youtube_video_id = data.get('youtube_video_id', 'N/A')
        youtube_url = f"https://youtube.com/watch?v={youtube_video_id}" if youtube_video_id != 'N/A' else 'N/A'
        website_url = data.get('website_url', 'N/A')
        
        # Content
        headlines = data.get('headlines', [])
        descriptions = data.get('descriptions', [])
        keywords = data.get('keywords', [])
        
        # Format locations
        locations_text = ""
        if isinstance(locations, list):
            for loc in locations:
                if isinstance(loc, dict):
                    name = loc.get('name', 'Unknown')
                    loc_type = loc.get('location_type', '')
                    country = loc.get('country_code', '')
                    radius = loc.get('radius', 10)
                    locations_text += f"• {name} ({loc_type}, {country}) - {radius}km\n"
                else:
                    locations_text += f"• {loc}\n"
        else:
            locations_text = str(locations)
        
        # Build message
        message = f"""🎬 <b>طلب حملة فيديو جديد!</b>

━━━━━━━━━━━━━━━━━━━━
📋 <b>معلومات الحساب:</b>
━━━━━━━━━━━━━━━━━━━━
🆔 معرف الحساب: <code>{customer_id}</code>
📧 الإيميل: {customer_email}

━━━━━━━━━━━━━━━━━━━━
🎬 <b>تفاصيل الحملة:</b>
━━━━━━━━━━━━━━━━━━━━
📛 اسم الحملة: {campaign_name}
🎥 نوع الإعلان: {video_ad_type}
💰 الميزانية اليومية: ${daily_budget} {currency}

━━━━━━━━━━━━━━━━━━━━
🎥 <b>الفيديو:</b>
━━━━━━━━━━━━━━━━━━━━
🔗 YouTube ID: <code>{youtube_video_id}</code>
📺 رابط الفيديو: {youtube_url}
🌐 رابط الموقع: {website_url}

━━━━━━━━━━━━━━━━━━━━
📍 <b>الاستهداف الجغرافي:</b>
━━━━━━━━━━━━━━━━━━━━
{locations_text if locations_text else 'لم يتم تحديد'}

━━━━━━━━━━━━━━━━━━━━
🗣️ <b>اللغة:</b> {language}
━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━
📝 <b>العناوين:</b>
━━━━━━━━━━━━━━━━━━━━
"""
        
        for i, headline in enumerate(headlines[:5], 1):
            message += f"{i}. {headline}\n"
        
        message += """
━━━━━━━━━━━━━━━━━━━━
📄 <b>الأوصاف:</b>
━━━━━━━━━━━━━━━━━━━━
"""
        
        for i, desc in enumerate(descriptions[:3], 1):
            message += f"{i}. {desc}\n"
        
        if keywords:
            message += """
━━━━━━━━━━━━━━━━━━━━
🔑 <b>الكلمات المفتاحية:</b>
━━━━━━━━━━━━━━━━━━━━
"""
            message += ", ".join(keywords[:10])
            if len(keywords) > 10:
                message += f"... (+{len(keywords) - 10} more)"
        
        # Additional info
        call_to_action = data.get('call_to_action', '')
        action_button = data.get('action_button_label', '')
        
        if call_to_action or action_button:
            message += f"""

━━━━━━━━━━━━━━━━━━━━
🔘 <b>CTA:</b>
━━━━━━━━━━━━━━━━━━━━
زر الدعوة: {action_button}
نص العنوان: {call_to_action}
"""
        
        message += f"""

━━━━━━━━━━━━━━━━━━━━
⏰ <b>تاريخ الطلب:</b> {data.get('created_at', 'N/A')}
━━━━━━━━━━━━━━━━━━━━

⚠️ <b>يرجى رفع الحملة يدوياً من Google Ads UI</b>
"""
        
        return message


# Singleton instance
telegram_service = TelegramNotificationService()
