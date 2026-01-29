#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏢 Furriyadh Customer Account Service
خدمة إدارة حسابات عملاء نظام العمولة 20%

This service handles:
- Creating Google Ads sub-accounts under MCC
- Managing customer accounts in database
- Balance tracking and auto-pause on low balance
- Commission calculations
"""

import os
import logging
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)

# Supabase client
from supabase import create_client

# Google Ads API
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    GOOGLE_ADS_AVAILABLE = True
except ImportError:
    GOOGLE_ADS_AVAILABLE = False
    logger.warning("Google Ads API not available")


class FurriyadhCustomerAccountService:
    """
    Service for managing Furriyadh Commission System (20%) customer accounts.
    
    Key Features:
    - Create Google Ads sub-accounts under MCC
    - Lock customer to one asset (website/youtube/app)
    - Track balance and auto-pause campaigns when out of balance
    - Calculate 20% commission on deposits
    """
    
    # Commission rate (20%)
    COMMISSION_RATE = 0.20
    
    # Minimum daily budget (USD)
    MIN_DAILY_BUDGET = 5.0
    
    # Low balance threshold for warning (USD)
    LOW_BALANCE_THRESHOLD = 20.0
    
    def __init__(self):
        """Initialize the service with Supabase and Google Ads clients."""
        self.supabase = None
        self.google_ads_client = None
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID', '9252466178')
        
        self._init_supabase()
        self._init_google_ads()
    
    def _init_supabase(self):
        """Initialize Supabase client."""
        try:
            supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            
            if supabase_url and supabase_key:
                self.supabase = create_client(supabase_url, supabase_key)
                logger.info("✅ Supabase client initialized for Furriyadh Account Service")
            else:
                logger.warning("⚠️ Supabase credentials not found")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase: {e}")
    
    def _init_google_ads(self):
        """Initialize Google Ads client."""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.warning("⚠️ Google Ads API not available")
                return
                
            from utils.google_ads_helper import get_google_ads_client
            self.google_ads_client = get_google_ads_client()
            logger.info("✅ Google Ads client initialized for Furriyadh Account Service")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Google Ads client: {e}")
    
    # =========================================================================
    # ACCOUNT MANAGEMENT
    # =========================================================================
    
    def get_customer_account(self, user_email: str) -> Optional[Dict[str, Any]]:
        """
        Get customer account by email.
        
        Args:
            user_email: User's email address
            
        Returns:
            Customer account data or None if not found
        """
        try:
            if not self.supabase:
                logger.error("Supabase not initialized")
                return None
            
            result = self.supabase.table('furriyadh_customer_accounts') \
                .select('*') \
                .eq('user_email', user_email.lower()) \
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"❌ Error getting customer account: {e}")
            return None
    
    def get_or_create_customer_account(
        self,
        user_email: str,
        user_id: Optional[str],
        asset_url: str,
        asset_type: str = 'website'
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Get existing customer account or create a new one.
        
        This is the main entry point for the commission system.
        
        Args:
            user_email: User's email address
            user_id: User's Supabase ID (optional)
            asset_url: Website URL or YouTube channel
            asset_type: 'website', 'youtube', 'app', 'store'
            
        Returns:
            Tuple of (account_data, error_message)
        """
        try:
            # Normalize inputs
            user_email = user_email.lower().strip()
            asset_url = self._normalize_url(asset_url)
            
            # Check if account exists
            existing_account = self.get_customer_account(user_email)
            
            if existing_account:
                # Account exists - validate asset URL
                locked_asset = existing_account.get('locked_asset_url', '')
                
                if not self._urls_match(locked_asset, asset_url):
                    error_msg = f"هذا الحساب مقفل على: {locked_asset}. لا يمكنك إنشاء حملات لموقع آخر."
                    logger.warning(f"⚠️ Asset mismatch for {user_email}: {asset_url} != {locked_asset}")
                    return None, error_msg
                
                logger.info(f"✅ Found existing account for {user_email}")
                return existing_account, None
            
            # Create new account
            logger.info(f"🆕 Creating new Furriyadh account for {user_email}")
            
            # Create Google Ads sub-account
            google_ads_customer_id = self._create_google_ads_customer(
                customer_name=f"Furriyadh - {user_email.split('@')[0]}",
                asset_url=asset_url
            )
            
            if not google_ads_customer_id:
                return None, "فشل في إنشاء حساب Google Ads. يرجى المحاولة مرة أخرى."
            
            # Create account in database
            account_data = {
                'user_email': user_email,
                'user_id': user_id,
                'google_ads_customer_id': google_ads_customer_id,
                'locked_asset_url': asset_url,
                'locked_asset_type': asset_type,
                'account_name': f"Furriyadh - {user_email.split('@')[0]}",
                'status': 'active',
                'currency': 'USD',
                'timezone': 'Asia/Riyadh'
            }
            
            result = self.supabase.table('furriyadh_customer_accounts') \
                .insert(account_data) \
                .execute()
            
            if result.data and len(result.data) > 0:
                new_account = result.data[0]
                logger.info(f"✅ Created new Furriyadh account: {google_ads_customer_id}")
                
                # Create welcome notification
                self._create_notification(
                    account_id=new_account['id'],
                    notification_type='system',
                    title='مرحباً بك في Furriyadh Account',
                    message=f'تم إنشاء حسابك الإعلاني بنجاح. موقعك المقفل: {asset_url}'
                )
                
                return new_account, None
            else:
                return None, "فشل في حفظ بيانات الحساب"
                
        except Exception as e:
            logger.error(f"❌ Error in get_or_create_customer_account: {e}")
            return None, f"حدث خطأ: {str(e)}"
    
    def _create_google_ads_customer(
        self,
        customer_name: str,
        asset_url: str,
        currency: str = 'USD',
        timezone: str = 'Asia/Riyadh'
    ) -> Optional[str]:
        """
        Create a new Google Ads customer account under MCC.
        
        Based on: google-ads-official/examples/account_management/create_customer.py
        
        Args:
            customer_name: Descriptive name for the account
            asset_url: Customer's website URL (for tracking template)
            currency: Currency code (default: USD)
            timezone: Timezone (default: Asia/Riyadh)
            
        Returns:
            Google Ads customer ID (e.g., '1234567890') or None on failure
        """
        try:
            if not self.google_ads_client:
                logger.error("Google Ads client not initialized")
                # Return mock ID for development
                import uuid
                mock_id = str(uuid.uuid4().int)[:10]
                logger.warning(f"⚠️ Using mock customer ID: {mock_id}")
                return mock_id
            
            customer_service = self.google_ads_client.get_service("CustomerService")
            
            # Create new customer object
            customer = self.google_ads_client.get_type("Customer")
            customer.descriptive_name = customer_name
            customer.currency_code = currency
            customer.time_zone = timezone
            
            # Set tracking URL template (optional but useful)
            customer.tracking_url_template = (
                "{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaignid}"
            )
            
            # Create the customer under MCC
            response = customer_service.create_customer_client(
                customer_id=self.mcc_customer_id,
                customer_client=customer
            )
            
            # Extract customer ID from resource name
            # Format: customers/1234567890
            resource_name = response.resource_name
            new_customer_id = resource_name.split('/')[-1]
            
            logger.info(f"✅ Created Google Ads customer: {new_customer_id} ({customer_name})")
            return new_customer_id
            
        except GoogleAdsException as ex:
            logger.error(f"❌ Google Ads API error creating customer:")
            for error in ex.failure.errors:
                logger.error(f"   - {error.message}")
            return None
        except Exception as e:
            logger.error(f"❌ Error creating Google Ads customer: {e}")
            return None
    
    # =========================================================================
    # BALANCE MANAGEMENT
    # =========================================================================
    
    def get_balance(self, user_email: str) -> Dict[str, Any]:
        """
        Get customer balance and spending summary.
        
        Returns:
            Dictionary with balance information
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return {
                    'success': False,
                    'error': 'Account not found'
                }
            
            current_balance = float(account.get('current_balance', 0))
            total_deposited = float(account.get('total_deposited', 0))
            total_spent = float(account.get('total_spent', 0))
            
            return {
                'success': True,
                'current_balance': current_balance,
                'total_deposited': total_deposited,
                'total_spent': total_spent,
                'total_commission': float(account.get('total_commission', 0)),
                'status': account.get('status'),
                'locked_asset_url': account.get('locked_asset_url'),
                'is_low_balance': current_balance <= self.LOW_BALANCE_THRESHOLD,
                'is_out_of_balance': current_balance <= 0,
                'balance_percentage': (current_balance / total_deposited * 100) if total_deposited > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting balance: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_sufficient_balance(
        self,
        user_email: str,
        daily_budget: float,
        days: int = 1
    ) -> Tuple[bool, str]:
        """
        Check if customer has sufficient balance for a campaign.
        
        Args:
            user_email: User's email
            daily_budget: Daily budget in USD
            days: Number of days to check (default: 1)
            
        Returns:
            Tuple of (is_sufficient, message)
        """
        try:
            balance_info = self.get_balance(user_email)
            
            if not balance_info.get('success'):
                return False, "لم يتم العثور على الحساب"
            
            required_amount = daily_budget * days
            current_balance = balance_info.get('current_balance', 0)
            
            if current_balance < required_amount:
                return False, f"رصيدك غير كافٍ. المطلوب: ${required_amount:.2f}، المتاح: ${current_balance:.2f}"
            
            if balance_info.get('is_low_balance'):
                return True, f"تحذير: رصيدك منخفض (${current_balance:.2f}). يُنصح بإضافة رصيد."
            
            return True, "OK"
            
        except Exception as e:
            logger.error(f"❌ Error checking balance: {e}")
            return False, f"خطأ في التحقق من الرصيد: {str(e)}"
    
    def add_deposit(
        self,
        user_email: str,
        gross_amount: float,
        payment_method: str = 'paypal',
        payment_reference: Optional[str] = None,
        payment_email: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Add a deposit to customer account.
        
        Calculates 20% commission and adds net amount to balance.
        
        Args:
            user_email: User's email
            gross_amount: Total amount paid
            payment_method: 'paypal', 'stripe', 'bank_transfer', 'manual'
            payment_reference: Transaction ID from payment provider
            payment_email: Email used for payment (e.g., PayPal email)
            
        Returns:
            Tuple of (success, message, deposit_data)
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return False, "لم يتم العثور على الحساب", None
            
            # Calculate commission (20%)
            commission_amount = gross_amount * self.COMMISSION_RATE
            net_amount = gross_amount - commission_amount
            
            # Create deposit record
            deposit_data = {
                'customer_account_id': account['id'],
                'gross_amount': gross_amount,
                'commission_amount': commission_amount,
                'net_amount': net_amount,
                'payment_method': payment_method,
                'payment_reference': payment_reference,
                'payment_email': payment_email,
                'status': 'completed',
                'currency': 'USD',
                'completed_at': datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table('furriyadh_deposits') \
                .insert(deposit_data) \
                .execute()
            
            if not result.data:
                return False, "فشل في حفظ الإيداع", None
            
            # Update account balance
            new_balance = float(account.get('current_balance', 0)) + net_amount
            new_total_deposited = float(account.get('total_deposited', 0)) + net_amount
            new_total_commission = float(account.get('total_commission', 0)) + commission_amount
            
            self.supabase.table('furriyadh_customer_accounts') \
                .update({
                    'current_balance': new_balance,
                    'total_deposited': new_total_deposited,
                    'total_commission': new_total_commission,
                    'status': 'active' if new_balance > 0 else 'out_of_balance'
                }) \
                .eq('id', account['id']) \
                .execute()
            
            # Create notification
            self._create_notification(
                account_id=account['id'],
                notification_type='deposit_received',
                title='تم استلام إيداعك',
                message=f'تم إضافة ${net_amount:.2f} إلى رصيدك (المبلغ الإجمالي: ${gross_amount:.2f}، العمولة: ${commission_amount:.2f})'
            )
            
            # Check if we should resume paused campaigns
            if account.get('status') == 'out_of_balance' and new_balance > 0:
                self._resume_paused_campaigns(account['id'])
            
            logger.info(f"✅ Deposit added for {user_email}: ${gross_amount} (net: ${net_amount})")
            
            return True, f"تم إضافة ${net_amount:.2f} إلى رصيدك", result.data[0]
            
        except Exception as e:
            logger.error(f"❌ Error adding deposit: {e}")
            return False, f"حدث خطأ: {str(e)}", None
    
    def process_refund(
        self,
        user_email: str,
        refund_amount: float,
        reason: str = '',
        original_deposit_id: Optional[str] = None,
        admin_email: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Process a refund for a customer.
        
        Deducts amount from balance and records refund transaction.
        
        Args:
            user_email: User's email
            refund_amount: Amount to refund (positive number)
            reason: Reason for refund
            original_deposit_id: ID of original deposit (optional)
            admin_email: Email of admin processing refund
            
        Returns:
            Tuple of (success, message, refund_data)
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return False, "لم يتم العثور على الحساب", None
            
            current_balance = float(account.get('current_balance', 0))
            
            # Validate refund amount
            if refund_amount <= 0:
                return False, "مبلغ الاسترداد يجب أن يكون أكبر من صفر", None
            
            if refund_amount > current_balance:
                return False, f"مبلغ الاسترداد (${refund_amount:.2f}) أكبر من الرصيد الحالي (${current_balance:.2f})", None
            
            # Create refund record (negative amounts in deposits table)
            # Using 'manual' payment_method to work with database constraint
            refund_data = {
                'customer_account_id': account['id'],
                'gross_amount': -refund_amount,  # Negative for refund
                'commission_amount': 0,  # No commission on refunds
                'net_amount': -refund_amount,  # Negative for refund
                'payment_method': 'manual',  # Use 'manual' - constraint doesn't allow 'refund'
                'payment_reference': f"REFUND-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                'payment_email': admin_email,
                'status': 'completed',
                'currency': 'USD',
                'notes': f"[REFUND] {reason}" if reason else "[REFUND]",
                'completed_at': datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table('furriyadh_deposits') \
                .insert(refund_data) \
                .execute()
            
            if not result.data:
                return False, "فشل في حفظ الاسترداد", None
            
            # Update account balance
            new_balance = current_balance - refund_amount
            
            self.supabase.table('furriyadh_customer_accounts') \
                .update({
                    'current_balance': new_balance,
                    'status': 'active' if new_balance > 0 else 'out_of_balance'
                }) \
                .eq('id', account['id']) \
                .execute()
            
            # Create notification
            self._create_notification(
                account_id=account['id'],
                notification_type='system',  # Use 'system' - constraint doesn't allow 'refund_processed'
                title='تم معالجة الاسترداد',
                message=f'تم استرداد ${refund_amount:.2f} من رصيدك. السبب: {reason or "غير محدد"}'
            )
            
            # Check if campaigns should be paused
            if new_balance <= 0:
                self.check_and_pause_campaigns_if_needed(user_email)
            
            logger.info(f"💸 Refund processed for {user_email}: ${refund_amount} (reason: {reason})")
            
            return True, f"تم استرداد ${refund_amount:.2f} بنجاح", result.data[0]
            
        except Exception as e:
            logger.error(f"❌ Error processing refund: {e}")
            return False, f"حدث خطأ: {str(e)}", None
    
    def get_refunds(self, user_email: str) -> List[Dict[str, Any]]:
        """
        Get all refunds for a customer.
        
        Args:
            user_email: User's email
            
        Returns:
            List of refund records
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return []
            
            result = self.supabase.table('furriyadh_deposits') \
                .select('*') \
                .eq('customer_account_id', account['id']) \
                .eq('payment_method', 'refund') \
                .order('created_at', desc=True) \
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Error getting refunds: {e}")
            return []
    
    
    def register_campaign(
        self,
        user_email: str,
        google_campaign_id: str,
        campaign_name: str,
        campaign_type: str,
        daily_budget: float,
        target_url: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Register a new campaign in the Furriyadh system.
        
        Called after successfully creating a campaign in Google Ads.
        
        Args:
            user_email: User's email
            google_campaign_id: Campaign ID from Google Ads
            campaign_name: Campaign name
            campaign_type: SEARCH, VIDEO, DISPLAY, etc.
            daily_budget: Daily budget in USD
            target_url: Target URL for the campaign
            
        Returns:
            Tuple of (success, message)
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return False, "لم يتم العثور على الحساب"
            
            # Register campaign
            campaign_data = {
                'customer_account_id': account['id'],
                'google_campaign_id': google_campaign_id,
                'campaign_name': campaign_name,
                'campaign_type': campaign_type.upper(),
                'daily_budget': daily_budget,
                'daily_budget_micros': int(daily_budget * 1_000_000),
                'target_url': target_url or account.get('locked_asset_url'),
                'status': 'active',
                'google_status': 'ENABLED'
            }
            
            result = self.supabase.table('furriyadh_campaigns') \
                .insert(campaign_data) \
                .execute()
            
            if not result.data:
                return False, "فشل في تسجيل الحملة"
            
            logger.info(f"✅ Registered campaign {google_campaign_id} for {user_email}")
            return True, "تم تسجيل الحملة بنجاح"
            
        except Exception as e:
            logger.error(f"❌ Error registering campaign: {e}")
            return False, f"حدث خطأ: {str(e)}"
    
    def get_customer_campaigns(self, user_email: str) -> List[Dict[str, Any]]:
        """
        Get all campaigns for a customer.
        
        Args:
            user_email: User's email
            
        Returns:
            List of campaign records
        """
        try:
            account = self.get_customer_account(user_email)
            
            if not account:
                return []
            
            result = self.supabase.table('furriyadh_campaigns') \
                .select('*') \
                .eq('customer_account_id', account['id']) \
                .order('created_at', desc=True) \
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"❌ Error getting campaigns: {e}")
            return []
    
    def check_and_pause_campaigns_if_needed(self, user_email: str) -> List[str]:
        """
        Check balance and pause campaigns if out of balance.
        
        This should be called periodically or after spending is synced.
        
        Returns:
            List of paused campaign IDs
        """
        try:
            balance_info = self.get_balance(user_email)
            
            if not balance_info.get('success'):
                return []
            
            if not balance_info.get('is_out_of_balance'):
                return []
            
            # Get active campaigns
            account = self.get_customer_account(user_email)
            if not account:
                return []
            
            campaigns = self.supabase.table('furriyadh_campaigns') \
                .select('id, google_campaign_id') \
                .eq('customer_account_id', account['id']) \
                .eq('status', 'active') \
                .execute()
            
            paused_campaigns = []
            
            for campaign in (campaigns.data or []):
                # Pause in Google Ads API
                google_id = campaign.get('google_campaign_id')
                self._pause_google_ads_campaign(
                    account.get('google_ads_customer_id'),
                    google_id
                )
                
                # Update in database
                self.supabase.table('furriyadh_campaigns') \
                    .update({
                        'status': 'stopped_no_balance',
                        'google_status': 'PAUSED',
                        'paused_at': datetime.utcnow().isoformat()
                    }) \
                    .eq('id', campaign['id']) \
                    .execute()
                
                paused_campaigns.append(google_id)
            
            # Update account status
            if paused_campaigns:
                self.supabase.table('furriyadh_customer_accounts') \
                    .update({'status': 'out_of_balance'}) \
                    .eq('id', account['id']) \
                    .execute()
                
                # Notify user
                self._create_notification(
                    account_id=account['id'],
                    notification_type='no_balance',
                    title='تم إيقاف حملاتك',
                    message=f'تم إيقاف {len(paused_campaigns)} حملة بسبب نفاد الرصيد. أضف رصيداً لاستئناف الحملات.'
                )
            
            logger.info(f"⏸️ Paused {len(paused_campaigns)} campaigns for {user_email} (out of balance)")
            return paused_campaigns
            
        except Exception as e:
            logger.error(f"❌ Error pausing campaigns: {e}")
            return []
    
    def _pause_google_ads_campaign(self, customer_id: str, campaign_id: str) -> bool:
        """Pause a campaign in Google Ads."""
        try:
            if not self.google_ads_client:
                logger.warning("Google Ads client not available")
                return True  # Return True for development
            
            campaign_service = self.google_ads_client.get_service("CampaignService")
            
            campaign_operation = self.google_ads_client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            campaign.resource_name = campaign_service.campaign_path(customer_id, campaign_id)
            campaign.status = self.google_ads_client.enums.CampaignStatusEnum.PAUSED
            
            self.google_ads_client.get_type("FieldMask")
            campaign_operation.update_mask.paths.append("status")
            
            campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error pausing campaign {campaign_id}: {e}")
            return False
    
    def _resume_paused_campaigns(self, account_id: str):
        """Resume campaigns that were paused due to low balance."""
        try:
            # Get paused campaigns
            campaigns = self.supabase.table('furriyadh_campaigns') \
                .select('id, google_campaign_id') \
                .eq('customer_account_id', account_id) \
                .eq('status', 'stopped_no_balance') \
                .execute()
            
            account = self.supabase.table('furriyadh_customer_accounts') \
                .select('google_ads_customer_id') \
                .eq('id', account_id) \
                .single() \
                .execute()
            
            if not account.data:
                return
            
            customer_id = account.data.get('google_ads_customer_id')
            
            for campaign in (campaigns.data or []):
                google_id = campaign.get('google_campaign_id')
                
                # Resume in Google Ads
                self._enable_google_ads_campaign(customer_id, google_id)
                
                # Update in database
                self.supabase.table('furriyadh_campaigns') \
                    .update({
                        'status': 'active',
                        'google_status': 'ENABLED'
                    }) \
                    .eq('id', campaign['id']) \
                    .execute()
            
            logger.info(f"▶️ Resumed {len(campaigns.data or [])} campaigns for account {account_id}")
            
        except Exception as e:
            logger.error(f"❌ Error resuming campaigns: {e}")
    
    def _enable_google_ads_campaign(self, customer_id: str, campaign_id: str) -> bool:
        """Enable a campaign in Google Ads."""
        try:
            if not self.google_ads_client:
                return True  # Return True for development
            
            campaign_service = self.google_ads_client.get_service("CampaignService")
            
            campaign_operation = self.google_ads_client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            campaign.resource_name = campaign_service.campaign_path(customer_id, campaign_id)
            campaign.status = self.google_ads_client.enums.CampaignStatusEnum.ENABLED
            
            campaign_operation.update_mask.paths.append("status")
            
            campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enabling campaign {campaign_id}: {e}")
            return False
    
    # =========================================================================
    # HELPERS
    # =========================================================================
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL for comparison."""
        if not url:
            return ''
        
        url = url.lower().strip()
        
        # Remove protocol
        url = url.replace('https://', '').replace('http://', '')
        
        # Remove www.
        url = url.replace('www.', '')
        
        # Remove trailing slash
        url = url.rstrip('/')
        
        return url
    
    def _urls_match(self, url1: str, url2: str) -> bool:
        """Check if two URLs match (after normalization)."""
        return self._normalize_url(url1) == self._normalize_url(url2)
    
    def _create_notification(
        self,
        account_id: str,
        notification_type: str,
        title: str,
        message: str
    ):
        """Create a notification for the customer."""
        try:
            self.supabase.table('furriyadh_notifications') \
                .insert({
                    'customer_account_id': account_id,
                    'type': notification_type,
                    'title': title,
                    'message': message
                }) \
                .execute()
        except Exception as e:
            logger.error(f"❌ Error creating notification: {e}")


    def update_subscription(
        self,
        user_email: str,
        plan_id: str,
        billing_cycle: str = 'monthly',
        stripe_subscription_id: Optional[str] = None,
        stripe_customer_id: Optional[str] = None,
        user_id: Optional[str] = None # ✅ New arg
    ) -> Tuple[bool, str]:
        """
        Update user's subscription plan via upsert to user_billing_subscriptions.
        """
        try:
            # Calculate subscription period dates
            from datetime import timedelta
            now = datetime.utcnow()
            cycle_days = 365 if billing_cycle == 'yearly' else 30
            period_end = now + timedelta(days=cycle_days)
            
            # Prepare update data
            update_data = {
                'plan_id': plan_id,
                'status': 'active',
                'billing_cycle': billing_cycle,
                'current_period_start': now.isoformat(),
                'current_period_end': period_end.isoformat(),
                'updated_at': now.isoformat(),
                'user_email': user_email
            }
            
            if stripe_subscription_id:
                update_data['stripe_subscription_id'] = stripe_subscription_id
            if stripe_customer_id:
                update_data['stripe_customer_id'] = stripe_customer_id

            # Upsert logic
            logger.info(f"🔄 Upserting subscription for {user_email}: {plan_id}")

            # Try to find existing record by email
            result = self.supabase.table('user_billing_subscriptions') \
                .select('id, plan_id, user_id') \
                .eq('user_email', user_email) \
                .execute()
            
            old_plan_id = 'free'
            existing_user_id = None
            
            if result.data and len(result.data) > 0:
                # Update
                existing_record = result.data[0]
                old_plan_id = existing_record.get('plan_id', 'free')
                existing_user_id = existing_record.get('user_id')
                
                self.supabase.table('user_billing_subscriptions') \
                    .update(update_data) \
                    .eq('user_email', user_email) \
                    .execute()
                action = "Updated"
            else:
                # Create new
                if not user_id:
                    # Try to fetch user_id via email from public.users as a fallback
                    try:
                         users_query = self.supabase.table('users').select('id').eq('email', user_email).single().execute()
                         if users_query.data:
                             user_id = users_query.data['id']
                    except Exception:
                        pass
                
                if user_id:
                    update_data['user_id'] = user_id
                    update_data['created_at'] = datetime.utcnow().isoformat()
                    
                    self.supabase.table('user_billing_subscriptions').insert(update_data).execute()
                    action = "Created"
                    existing_user_id = user_id
                else:
                    msg = f"User ID missing for new subscription for {user_email}"
                    logger.error(f"❌ {msg}")
                    return False, msg

            # Log history
            if existing_user_id:
                try:
                    change_type = self._get_change_type(old_plan_id, plan_id)
                    self.supabase.table('billing_plan_history').insert({
                        'user_id': existing_user_id,
                        'old_plan_id': old_plan_id,
                        'new_plan_id': plan_id,
                        'change_type': change_type,
                        'created_at': datetime.utcnow().isoformat()
                    }).execute()
                except Exception as hist_e:
                    logger.error(f"⚠️ Failed to log plan history: {hist_e}")

            logger.info(f"✅ Subscription {action} for {user_email}: {plan_id} ({action})")
            return True, f"Subscription {action} successfully"
    
        except Exception as e:
            logger.error(f"❌ Error updating subscription: {e}")
            return False, f"Error: {str(e)}"

    def _get_change_type(self, old_plan: str, new_plan: str) -> str:
        """Determine change type: upgrade, downgrade, or new."""
        # Order of plans low to high
        plan_order = ['free', 'basic', 'pro', 'agency', 'enterprise']
        
        try:
            old_idx = plan_order.index(old_plan) if old_plan in plan_order else -1
            new_idx = plan_order.index(new_plan) if new_plan in plan_order else -1
            
            if old_idx == -1 or new_idx == -1:
                return 'change'
                
            if new_idx > old_idx:
                return 'upgrade'
            elif new_idx < old_idx:
                return 'downgrade'
            else:
                return 'same'
        except Exception:
            return 'change'

# Singleton instance
_service_instance = None

def get_furriyadh_account_service() -> FurriyadhCustomerAccountService:
    """Get singleton instance of the service."""
    global _service_instance
    if _service_instance is None:
        _service_instance = FurriyadhCustomerAccountService()
    return _service_instance
