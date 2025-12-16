"""Test email sending for SEARCH Campaign"""
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

# Test SEARCH Campaign Data
test_data = {
    'campaign_name': 'Test Search Campaign Spring Sale',
    'campaign_type': 'SEARCH',
    'daily_budget': 50,
    'currency': 'USD',
    'customer_id': '904-840-9219',
    'website_url': 'https://furriyadh.com',
    'manual_upload': False  # Search campaigns are automated
}

# Send test email
target_email = 'hossam675r4e3@gmail.com'
print(f'📤 Sending SEARCH campaign test email to {target_email}...')
result = email_service.send_campaign_confirmation(target_email, test_data)

if result:
    print(f'✅ Email sent successfully!')
else:
    print(f'❌ Failed to send email.')
