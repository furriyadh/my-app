"""Test email sending for APP Campaign"""
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

# Test APP Campaign Data
test_data = {
    'campaign_name': 'New Game Launch - Install',
    'campaign_type': 'APP',
    'daily_budget': 150,
    'currency': 'USD',
    'customer_id': '904-840-9219',
    'website_url': 'https://play.google.com/store/apps/details?id=com.furriyadh.app',
    'manual_upload': False
}

# Send test email
target_email = 'hossam675r4e3@gmail.com'
print(f'📤 Sending APP campaign test email to {target_email}...')
result = email_service.send_campaign_confirmation(target_email, test_data)

if result:
    print(f'✅ Email sent successfully!')
else:
    print(f'❌ Failed to send email.')
