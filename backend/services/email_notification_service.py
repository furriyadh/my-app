"""
Professional Email Service for Campaign Notifications
Works for ALL campaign types: Search, Display, Video, Shopping, App, etc.
DARK MODE EDITION with Logo from URL
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Campaign type names in Arabic and English
CAMPAIGN_TYPE_INFO = {
    'SEARCH': {
        'ar': 'حملة البحث',
        'en': 'Search Campaign',
        'color': '#8ab4f8',
        'icon': '🔍'
    },
    'DISPLAY': {
        'ar': 'حملة الشبكة الإعلانية',
        'en': 'Display Campaign',
        'color': '#81c995',
        'icon': '🖼️'
    },
    'VIDEO': {
        'ar': 'حملة الفيديو',
        'en': 'Video Campaign',
        'color': '#f28b82',
        'icon': '🎬'
    },
    'SHOPPING': {
        'ar': 'حملة التسوق',
        'en': 'Shopping Campaign',
        'color': '#8ab4f8',
        'icon': '🛒'
    },
    'APP': {
        'ar': 'حملة التطبيقات',
        'en': 'App Campaign',
        'color': '#fdd663',
        'icon': '📱'
    },
    'PERFORMANCE_MAX': {
        'ar': 'حملة الأداء الأقصى',
        'en': 'Performance Max',
        'color': '#f28b82',
        'icon': '🚀'
    },
    'DEMAND_GEN': {
        'ar': 'حملة توليد الطلب',
        'en': 'Demand Gen',
        'color': '#c58af9',
        'icon': '✨'
    }
}

# Video ad types in Arabic
VIDEO_AD_TYPE_ARABIC = {
    'IN_FEED_VIDEO_AD': 'إعلان في الخلاصة',
    'IN_STREAM_AD': 'إعلان أثناء التشغيل',
    'BUMPER_AD': 'إعلان قصير (6 ثواني)',
    'VIDEO_RESPONSIVE_AD': 'إعلان متجاوب',
    'OUTSTREAM_AD': 'إعلان خارجي',
}


class EmailNotificationService:
    """Service for sending professional email notifications for all campaign types"""
    
    def __init__(self):
        self.smtp_server = os.getenv('EMAIL_SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('EMAIL_SMTP_PORT', '587'))
        self.sender_email = os.getenv('EMAIL_SENDER_EMAIL', 'ads@furriyadh.com')
        self.sender_password = os.getenv('EMAIL_SENDER_PASSWORD')
        self.sender_name = 'Furriyadh Ads'
        # Logo URL from production site
        self.logo_url = "https://furriyadh.com/images/logo-big.svg"
    
    def is_configured(self) -> bool:
        return bool(self.sender_email and self.sender_password)
    
    def send_campaign_confirmation(self, customer_email: str, campaign_data: Dict[str, Any]) -> bool:
        """
        Send professional confirmation email for ANY campaign type
        """
        if not self.is_configured():
            logger.warning("⚠️ Email service not configured")
            return False
        
        if not customer_email:
            logger.warning("⚠️ No customer email provided")
            return False
        
        try:
            # Extract campaign data
            campaign_name = campaign_data.get('campaign_name', 'Your Campaign')
            campaign_type = campaign_data.get('campaign_type', 'SEARCH').upper()
            daily_budget = campaign_data.get('daily_budget', 0)
            currency = campaign_data.get('currency', 'USD')
            customer_id = campaign_data.get('customer_id', 'N/A')
            website_url = campaign_data.get('website_url', '')
            youtube_video_id = campaign_data.get('youtube_video_id', '')
            video_ad_type = campaign_data.get('video_ad_type', '')
            
            # STRICT LOGIC: Only VIDEO campaigns require manual review (24-48h)
            # All other campaign types are launched immediately
            is_manual_upload = (campaign_type == 'VIDEO')
            
            # Get campaign type info
            type_info = CAMPAIGN_TYPE_INFO.get(campaign_type, CAMPAIGN_TYPE_INFO['SEARCH'])
            video_ad_type_ar = VIDEO_AD_TYPE_ARABIC.get(video_ad_type, '') if video_ad_type and campaign_type == 'VIDEO' else ''
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"✅ {type_info['icon']} {campaign_name} - {'Request Received' if is_manual_upload else 'Campaign Active'}"
            msg['From'] = f'{self.sender_name} <{self.sender_email}>'
            msg['To'] = customer_email
            
            # Plain text version
            if is_manual_upload:
                status_header = "Request Received"
                status_text = "Your campaign is under review and will be uploaded within 24-48 hours."
            else:
                status_header = "Campaign Launched!"
                status_text = "Your campaign has been successfully created and is now ACTIVE on Google Ads."

            plain_text = f"""
{type_info['en']} - {status_header}

Campaign: {campaign_name}
Type: {type_info['en']}
Daily Budget: ${daily_budget} {currency}
Account ID: {customer_id}

{status_text}

Questions? Contact us at ads@furriyadh.com

Furriyadh Ads Team
"""
            msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
            
            # HTML version
            html_content = self._generate_html_email(
                campaign_name=campaign_name,
                campaign_type=campaign_type,
                type_info=type_info,
                daily_budget=daily_budget,
                currency=currency,
                customer_id=customer_id,
                website_url=website_url,
                youtube_video_id=youtube_video_id,
                video_ad_type_ar=video_ad_type_ar,
                is_manual_upload=is_manual_upload
            )
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            logger.info(f"✅ Campaign confirmation email sent to {customer_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
            
    # Keep old method for backward compatibility
    def send_video_campaign_confirmation(self, customer_email: str, campaign_data: Dict[str, Any]) -> bool:
        campaign_data['campaign_type'] = 'VIDEO'
        return self.send_campaign_confirmation(customer_email, campaign_data)
    
    def _generate_html_email(self, **kwargs) -> str:
        campaign_name = kwargs.get('campaign_name', 'Campaign')
        campaign_type = kwargs.get('campaign_type', 'SEARCH')
        type_info = kwargs.get('type_info', CAMPAIGN_TYPE_INFO['SEARCH'])
        daily_budget = kwargs.get('daily_budget', 0)
        currency = kwargs.get('currency', 'USD')
        customer_id = kwargs.get('customer_id', 'N/A')
        website_url = kwargs.get('website_url', '')
        youtube_video_id = kwargs.get('youtube_video_id', '')
        video_ad_type_ar = kwargs.get('video_ad_type_ar', '')
        is_manual_upload = kwargs.get('is_manual_upload', False)
        
        thumbnail_url = f"https://i.ytimg.com/vi/{youtube_video_id}/mqdefault.jpg" if youtube_video_id else ""
        current_year = datetime.now().year
        accent_color = type_info.get('color', '#8ab4f8')
        campaign_icon = type_info.get('icon', '📊')
        
        # Decide status title and description
        if is_manual_upload:
            status_title = "Request Received"
            status_desc = "Your campaign is under review and will be uploaded within <strong>24-48 hours</strong>."
            status_color = "#f28b82"
            hero_icon_bg = "linear-gradient(135deg,#ef4444,#f97316)"
            check_icon = "✓"
        else:
            status_title = "Campaign Active"
            status_desc = "Your campaign has been successfully launched and is now <strong>live</strong> on Google Ads."
            status_color = "#81c995"
            hero_icon_bg = "linear-gradient(135deg,#22c55e,#16a34a)"
            check_icon = "✓"
        
        # Additional info section
        additional_info = ""
        if campaign_type == 'VIDEO' and video_ad_type_ar:
            additional_info = f"""
                <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #333333;">
                        <span style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Ad Type</span>
                        <p style="margin:6px 0 0;color:#ffffff;font-size:14px;font-weight:bold;">{video_ad_type_ar}</p>
                    </td>
                </tr>
            """
        elif website_url:
            display_url = website_url.replace('https://', '').replace('http://', '').split('/')[0]
            additional_info = f"""
                <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #333333;">
                        <span style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Website</span>
                        <p style="margin:6px 0 0;color:#ffffff;font-size:14px;font-weight:bold;">{display_url}</p>
                    </td>
                </tr>
            """
        
        # Video thumbnail section
        video_section = ""
        if campaign_type == 'VIDEO' and youtube_video_id:
            video_section = f"""
                <tr>
                    <td style="padding:0 32px 24px;">
                        <div style="border-radius:12px;overflow:hidden;border:1px solid #333333;">
                            <a href="https://youtube.com/watch?v={youtube_video_id}" style="display:block;position:relative;text-decoration:none;">
                                <img src="{thumbnail_url}" alt="Video" style="display:block;width:100%;height:auto;opacity:0.9;">
                                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:56px;background:rgba(255,0,0,0.9);border-radius:50%;text-align:center;line-height:56px;">
                                    <span style="color:white;font-size:24px;margin-left:4px;">▶</span>
                                </div>
                            </a>
                        </div>
                    </td>
                </tr>
            """
        
        # Next Steps Section
        if is_manual_upload:
            next_steps = """
                <tr>
                    <td style="padding:0 32px 32px;">
                        <table width="100%" style="background:#0a0a0a;border-radius:12px;border:1px solid #222222;">
                            <tr>
                                <td style="padding:20px;">
                                    <p style="color:#ffffff;font-size:14px;font-weight:bold;margin:0 0 16px;">
                                        <span style="display:inline-block;width:3px;height:16px;background:#ef4444;border-radius:2px;margin-right:8px;vertical-align:middle;"></span>
                                        Next Steps
                                    </p>
                                    <table width="100%">
                                        <tr><td style="color:#888888;font-size:13px;padding:6px 0;">1. Team review of campaign details</td></tr>
                                        <tr><td style="color:#888888;font-size:13px;padding:6px 0;">2. Upload to Google Ads</td></tr>
                                        <tr><td style="color:#888888;font-size:13px;padding:6px 0;">3. Email notification when live</td></tr>
                                        <tr><td style="color:#888888;font-size:13px;padding:6px 0;">4. Your ad starts showing on YouTube</td></tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            """
        else:
            next_steps = ""
        
        # PREMIUM DARK MODE HTML TEMPLATE with Logo from URL
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #333333;">
                    
                    <!-- Top Gradient Line -->
                    <tr>
                        <td style="height:4px;background:linear-gradient(90deg,#ef4444,#f97316,#ef4444);"></td>
                    </tr>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding:24px 32px;border-bottom:1px solid #222222;">
                            <table width="100%">
                                <tr>
                                    <td>
                                        <img src="{self.logo_url}" alt="Furriyadh" style="height:32px;filter:brightness(0) invert(1);">
                                    </td>
                                    <td align="right">
                                        <span style="background:#1a1a1a;color:{accent_color};padding:6px 12px;border-radius:20px;font-size:12px;border:1px solid #333;">● {type_info['en']}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding:48px 32px;text-align:center;">
                            <!-- Success Icon -->
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                                <tr>
                                    <td style="width:80px;height:80px;background:{hero_icon_bg};border-radius:50%;text-align:center;vertical-align:middle;">
                                        <span style="color:#ffffff;font-size:40px;font-weight:bold;">{check_icon}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <h1 style="color:#ffffff;font-size:32px;margin:0 0 12px;font-weight:bold;letter-spacing:-0.5px;">{status_title}</h1>
                            
                            <p style="color:#888888;font-size:15px;margin:0 0 32px;line-height:1.6;">
                                {status_desc}
                            </p>
                            
                            <!-- Info Card -->
                            <table width="100%" style="background:#1a1a1a;border-radius:12px;border:1px solid #333333;margin-bottom:32px;text-align:left;">
                                <tr>
                                    <td style="padding:16px 24px;border-bottom:1px solid #333333;">
                                        <span style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Campaign Name</span>
                                        <p style="margin:6px 0 0;color:#ffffff;font-size:16px;font-weight:bold;">{campaign_name}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 24px;border-bottom:1px solid #333333;">
                                        <table width="100%">
                                            <tr>
                                                <td width="50%">
                                                    <span style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Customer ID</span>
                                                    <p style="margin:6px 0 0;color:#ffffff;font-size:14px;font-weight:bold;font-family:monospace;">{customer_id}</p>
                                                </td>
                                                <td width="50%">
                                                    <span style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Daily Budget</span>
                                                    <p style="margin:6px 0 0;color:#ffffff;font-size:14px;font-weight:bold;">${daily_budget} {currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                {additional_info}
                            </table>
                            
                            <!-- CTA Button -->
                            <a href="https://furriyadh.com/dashboard" style="display:inline-block;padding:16px 48px;background:#ffffff;color:#000000;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;">Go to Dashboard →</a>
                        </td>
                    </tr>
                    
                    {video_section}
                    
                    {next_steps}
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 32px;background:#050505;border-top:1px solid #222222;">
                            <table width="100%">
                                <tr>
                                    <td style="color:#666666;font-size:12px;">© {current_year} Furriyadh Inc.</td>
                                    <td align="right">
                                        <a href="mailto:ads@furriyadh.com" style="color:#666666;font-size:12px;text-decoration:none;margin-right:16px;">Support</a>
                                        <a href="https://furriyadh.com" style="color:#666666;font-size:12px;text-decoration:none;">Privacy</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return html


email_service = EmailNotificationService()
