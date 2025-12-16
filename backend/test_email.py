"""Test email sending"""
import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path('.env.development')
if env_path.exists():
    load_dotenv(env_path)
    print('✅ Environment loaded')

# Import and test email service
from services.email_notification_service import email_service

# Check if configured
print(f'📧 Email configured: {email_service.is_configured()}')
print(f'📧 Sender: {email_service.sender_email}')
print(f'📧 SMTP: {email_service.smtp_server}:{email_service.smtp_port}')

# Test data
test_data = {
    'campaign_name': 'Test Video Campaign',
    'daily_budget': 15,
    'currency': 'USD',
    'youtube_video_id': 'SpxF571pRXk',
    'video_ad_type': 'IN_FEED_VIDEO_AD',
    'customer_id': '9048409219'
}

# Send test email
print('📤 Sending test email to hossam675r4e3@gmail.com...')
result = email_service.send_video_campaign_confirmation('hossam675r4e3@gmail.com', test_data)
print(f'✅ Result: {result}')
