#!/usr/bin/env python3
"""Create test Furriyadh account for refund testing"""
from supabase import create_client

supabase_url = 'https://mkzwqbgcfdzcqmkgzwgy.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rendxYmdjZmR6Y3Fta2d6d2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjMzMjE5OSwiZXhwIjoyMDM3OTA4MTk5fQ.jD8_o7a6iEYKgHjFuqDYwMOqUoNjD7S8iPWQiZ0oa_Y'

sb = create_client(supabase_url, supabase_key)

# Check existing
result = sb.table('furriyadh_customer_accounts').select('*').eq('user_email', 'maxon272000@gmail.com').execute()
print(f"Existing accounts: {len(result.data)}")

if result.data:
    print(f"Account exists with balance: ${result.data[0].get('current_balance', 0)}")
    # Update balance if needed
    if result.data[0].get('current_balance', 0) < 50:
        sb.table('furriyadh_customer_accounts').update({'current_balance': 100.0}).eq('user_email', 'maxon272000@gmail.com').execute()
        print("Updated balance to $100")
else:
    # Create new account
    account = {
        'user_email': 'maxon272000@gmail.com',
        'google_ads_customer_id': '1234567890',
        'locked_asset_url': 'https://test.com',
        'locked_asset_type': 'website',
        'account_name': 'Test Account - Maxon',
        'status': 'active',
        'currency': 'USD',
        'timezone': 'Asia/Riyadh',
        'current_balance': 100.0,
        'total_deposited': 100.0,
        'total_spent': 0.0,
        'total_commission': 20.0
    }
    res = sb.table('furriyadh_customer_accounts').insert(account).execute()
    print(f"Created account: {res.data}")

print("Done!")
