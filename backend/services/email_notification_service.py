"""
Professional Email Service for Campaign Notifications
Works for ALL campaign types: Search, Display, Video, Shopping, App, etc.
Embeds local logo image for perfect display in all email clients.
DARK MODE EDITION 🌑
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from typing import Dict, Any
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

# Campaign type names in Arabic and English
CAMPAIGN_TYPE_INFO = {
    'SEARCH': {
        'ar': 'حملة البحث',
        'en': 'Search Campaign',
        'color': '#8ab4f8',  # Lighter Blue for Dark Mode
        'icon': '🔍'
    },
    'DISPLAY': {
        'ar': 'حملة الشبكة الإعلانية',
        'en': 'Display Campaign',
        'color': '#81c995',  # Lighter Green for Dark Mode
        'icon': '🖼️'
    },
    'VIDEO': {
        'ar': 'حملة الفيديو',
        'en': 'Video Campaign',
        'color': '#f28b82',  # Lighter Red for Dark Mode
        'icon': '🎬'
    },
    'SHOPPING': {
        'ar': 'حملة التسوق',
        'en': 'Shopping Campaign',
        'color': '#8ab4f8',  # Blue
        'icon': '🛒'
    },
    'APP': {
        'ar': 'حملة التطبيقات',
        'en': 'App Campaign',
        'color': '#fdd663',  # Lighter Yellow for Dark Mode
        'icon': '📱'
    },
    'PERFORMANCE_MAX': {
        'ar': 'حملة الأداء الأقصى',
        'en': 'Performance Max',
        'color': '#f28b82',  # Red
        'icon': '🚀'
    },
    'DEMAND_GEN': {
        'ar': 'حملة توليد الطلب',
        'en': 'Demand Gen',
        'color': '#c58af9',  # Lighter Purple for Dark Mode
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
        
        # Path to logo image - adjusted relative to backend/ directory
        # Assuming backend is running from C:\Users\DELL\my-site\backend
        self.logo_image_name = 'furriyadh-logo.png' 
        self.logo_path = Path(__file__).parent.parent.parent / 'public' / 'images' / self.logo_image_name
    
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
            # Enforce Logic: Only VIDEO is manual (24-48h delay), others are immediate
            is_manual_upload = (campaign_type == 'VIDEO')
            
            # Get campaign type info
            type_info = CAMPAIGN_TYPE_INFO.get(campaign_type, CAMPAIGN_TYPE_INFO['SEARCH'])
            video_ad_type_ar = VIDEO_AD_TYPE_ARABIC.get(video_ad_type, '') if video_ad_type and campaign_type == 'VIDEO' else ''
            
            # Create MIMEMultipart message with 'related' type to support embedded images
            msg = MIMEMultipart('related')
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
            msg_alternative = MIMEMultipart('alternative')
            msg.attach(msg_alternative)
            
            msg_alternative.attach(MIMEText(plain_text, 'plain', 'utf-8'))
            
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
            msg_alternative.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # Embed logo image
            if self.logo_path.exists():
                try:
                    with open(self.logo_path, 'rb') as f:
                        logo_data = f.read()
                    
                    logo_image = MIMEImage(logo_data)
                    logo_image.add_header('Content-ID', '<logo_image>')
                    logo_image.add_header('Content-Disposition', 'inline', filename='furriyadh-logo.png')
                    msg.attach(logo_image)
                    logger.info(f"Using local logo from: {self.logo_path}")
                except Exception as e:
                    logger.warning(f"Failed to attach logo: {e}")
            else:
                 logger.warning(f"Logo file not found at: {self.logo_path}")

            
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
        
        # Decide status title and description based on STRICT logic
        if is_manual_upload:
            status_title = "Request Received"
            status_desc = "Your campaign is under review and will be uploaded within 24-48 hours."
            status_color = "#f28b82" # Soft Red
            hero_icon_bg = "rgba(242, 139, 130, 0.1)"
            hero_icon_color = "#f28b82"
            check_icon = "⏳"
        else:
            status_title = "Campaign Active"
            status_desc = "Your campaign has been successfully launched and is now live on Google Ads."
            status_color = "#81c995" # Soft Green
            hero_icon_bg = "rgba(129, 201, 149, 0.1)"
            hero_icon_color = "#81c995"
            check_icon = "✅"
            
        # Logo Source: CID if attached, fallback to URL
        logo_src = "cid:logo_image"
        
        # Additional info section
        additional_info = ""
        if campaign_type == 'VIDEO' and video_ad_type_ar:
            additional_info = f"""
                <tr>
                    <td style="padding: 16px 24px; border-bottom: 1px solid #333333;">
                        <span style="color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Ad Type</span>
                        <p style="margin: 6px 0 0; color: #ffffff; font-size: 15px;">{video_ad_type_ar}</p>
                    </td>
                </tr>
            """
        elif website_url:
            display_url = website_url.replace('https://', '').replace('http://', '').split('/')[0]
            additional_info = f"""
                <tr>
                    <td style="padding: 16px 24px; border-bottom: 1px solid #333333;">
                        <span style="color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Website</span>
                        <p style="margin: 6px 0 0; color: #ffffff; font-size: 15px;">{display_url}</p>
                    </td>
                </tr>
            """
        
        # Video thumbnail section
        video_section = ""
        if campaign_type == 'VIDEO' and youtube_video_id:
            video_section = f"""
                <tr>
                    <td style="padding: 0 40px 30px;">
                        <div style="border-radius: 12px; overflow: hidden; border: 1px solid #333333; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <a href="https://youtube.com/watch?v={youtube_video_id}" style="display: block; position: relative; text_decoration: none;">
                                <img src="{thumbnail_url}" alt="Video" style="display: block; width: 100%; height: auto; opacity: 0.9;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: rgba(255,0,0,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: white; font-size: 24px;">▶</span>
                                </div>
                            </a>
                        </div>
                    </td>
                </tr>
            """
        
        # PREMIUM DARK MODE HTML TEMPLATE
        # Using #000000 background, #111111 cards, refined borders and spacing
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e0e0e0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                
                <!-- Main Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #111111; border-radius: 16px; overflow: hidden; border: 1px solid #222222; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #222222;">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <img src="{logo_src}" alt="Furriyadh" width="130" style="display: block; max-width: 130px; height: auto;">
                                    </td>
                                    <td align="right">
                                        <span style="color: #666666; font-size: 12px; font-family: monospace;">ID: {customer_id}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Title Area -->
                    <tr>
                        <td style="padding: 50px 40px 30px; text-align: center;">
                            <!-- Animated-ish Icon -->
                            <div style="display: inline-block; width: 64px; height: 64px; border-radius: 50%; background-color: {hero_icon_bg}; text-align: center; line-height: 64px; font-size: 32px; margin-bottom: 24px; border: 1px solid {hero_icon_color}; box-shadow: 0 0 20px {hero_icon_bg};">
                                {check_icon}
                            </div>
                            
                            <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                                {campaign_name}
                            </h1>
                            
                            <p style="margin: 0 0 8px; font-size: 18px; color: {status_color}; font-weight: 500;">
                                {status_title}
                            </p>
                            
                            <p style="margin: 0; font-size: 15px; color: #888888; line-height: 1.6; max-width: 400px; display: inline-block;">
                                {status_desc}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td align="center" style="padding: 0 40px 40px;">
                            <a href="https://furriyadh.com/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, {accent_color} 0%, {status_color} 100%); color: #000000; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 15px {hero_icon_bg};">
                                Go to Dashboard
                            </a>
                        </td>
                    </tr>
                    
                    {video_section}
                    
                    <!-- Info Card -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333333;">
                                <tr>
                                    <td style="padding: 16px 24px; border-bottom: 1px solid #333333;">
                                        <table width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="50%">
                                                    <span style="color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Campaign Type</span>
                                                    <p style="margin: 6px 0 0; color: {accent_color}; font-size: 15px; font-weight: 500;">
                                                        {type_info['icon']} {type_info['en']}
                                                    </p>
                                                </td>
                                                <td width="50%">
                                                    <span style="color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Daily Budget</span>
                                                    <p style="margin: 6px 0 0; color: #ffffff; font-size: 15px; font-weight: 600;">${daily_budget} {currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                {additional_info}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Steps / Footer Info -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0d0d0d; border-top: 1px solid #222222;">
                             <p style="margin: 0 0 20px; color: #666666; font-size: 13px; text-align: center;">
                                Need help? Reply to this email or visit our <a href="https://furriyadh.com/support" style="color: {accent_color}; text-decoration: none;">Help Center</a>.
                             </p>
                             
                            <table width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1a1a1a; padding-top: 20px;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; color: #444444; font-size: 11px;">
                                            © {current_year} Furriyadh Ads. All rights reserved.<br>
                                            Riyadh, Saudi Arabia.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Spacing -->
                <div style="height: 40px;"></div>
                
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return html


email_service = EmailNotificationService()
