"""Test email sending for DISPLAY Campaign"""
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

# Test DISPLAY Campaign Data
test_data = {
    'campaign_name': 'Summer Display Retargeting',
    'campaign_type': 'DISPLAY',
    'daily_budget': 35,
    'currency': 'USD',
    'customer_id': '904-840-9219',
    'website_url': 'https://furriyadh.com/summer-sale',
    'manual_upload': False
}

# Send test email
target_email = 'maxon272000@gmail.com'
print(f'📤 Sending DISPLAY campaign test email to {target_email}...')
result = email_service.send_campaign_confirmation(target_email, test_data)

if result:
    print(f'✅ Email sent successfully!')
else:
    print(f'❌ Failed to send email.')
