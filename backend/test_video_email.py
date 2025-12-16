"""Test email sending for VIDEO Campaign"""
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

# Test VIDEO Campaign Data
test_data = {
    'campaign_name': 'New Product Launch Video',
    'campaign_type': 'VIDEO',
    'daily_budget': 100,
    'currency': 'USD',
    'customer_id': '904-840-9219',
    'youtube_video_id': 'dQw4w9WgXcQ',  # Rick Roll ID for testing thumbnail :D
    'video_ad_type': 'IN_STREAM_AD',
    'manual_upload': True
}

# Send test email
target_email = 'hossam675r4e3@gmail.com'
print(f'📤 Sending VIDEO campaign test email to {target_email}...')
result = email_service.send_campaign_confirmation(target_email, test_data)

if result:
    print(f'✅ Email sent successfully!')
else:
    print(f'❌ Failed to send email.')
