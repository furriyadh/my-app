#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏢 Furriyadh Account API Routes
API endpoints for Furriyadh Commission System (20%)
"""

from flask import Blueprint, request, jsonify
import logging
from services.furriyadh_customer_account_service import get_furriyadh_account_service

logger = logging.getLogger(__name__)

# Create Blueprint
furriyadh_bp = Blueprint('furriyadh', __name__, url_prefix='/api/furriyadh')


@furriyadh_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'Furriyadh Commission System',
        'version': '1.0.0'
    })


@furriyadh_bp.route('/account', methods=['GET'])
def get_account():
    """
    Get customer account information.
    
    Query params:
    - email: Customer email address
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        account = service.get_customer_account(email)
        
        if not account:
            return jsonify({
                'success': False,
                'error': 'Account not found',
                'message': 'لم يتم العثور على الحساب'
            }), 404
        
        return jsonify({
            'success': True,
            'account': {
                'id': account.get('id'),
                'google_ads_customer_id': account.get('google_ads_customer_id'),
                'locked_asset_url': account.get('locked_asset_url'),
                'locked_asset_type': account.get('locked_asset_type'),
                'current_balance': float(account.get('current_balance', 0)),
                'total_deposited': float(account.get('total_deposited', 0)),
                'total_spent': float(account.get('total_spent', 0)),
                'total_commission': float(account.get('total_commission', 0)),
                'status': account.get('status'),
                'currency': account.get('currency'),
                'created_at': account.get('created_at')
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting account: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/balance', methods=['GET'])
def get_balance():
    """
    Get customer balance and spending summary.
    
    Query params:
    - email: Customer email address
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        balance_info = service.get_balance(email)
        
        return jsonify(balance_info)
        
    except Exception as e:
        logger.error(f"❌ Error getting balance: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/deposit', methods=['POST'])
def add_deposit():
    """
    Add a deposit to customer account.
    
    Request body:
    - email: Customer email address
    - amount: Total amount paid
    - payment_method: 'paypal', 'stripe', 'bank_transfer', 'manual'
    - payment_reference: Transaction ID from payment provider
    - payment_email: Email used for payment (e.g., PayPal email)
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        amount = data.get('amount')
        payment_method = data.get('payment_method', 'paypal')
        payment_reference = data.get('payment_reference')
        payment_email = data.get('payment_email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        if not amount or float(amount) <= 0:
            return jsonify({
                'success': False,
                'error': 'Valid amount is required'
            }), 400
        
        service = get_furriyadh_account_service()
        success, message, deposit_data = service.add_deposit(
            user_email=email,
            gross_amount=float(amount),
            payment_method=payment_method,
            payment_reference=payment_reference,
            payment_email=payment_email
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'deposit': deposit_data,
                'balance': service.get_balance(email)
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 400
        
    except Exception as e:
        logger.error(f"❌ Error adding deposit: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/campaigns', methods=['GET'])
def get_campaigns():
    """
    Get all campaigns for a customer.
    
    Query params:
    - email: Customer email address
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        campaigns = service.get_customer_campaigns(email)
        
        return jsonify({
            'success': True,
            'campaigns': campaigns,
            'count': len(campaigns)
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting campaigns: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/check-balance', methods=['POST'])
def check_balance():
    """
    Check if customer has sufficient balance for a campaign.
    
    Request body:
    - email: Customer email address
    - daily_budget: Daily budget in USD
    - days: Number of days to check (optional, default: 1)
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        daily_budget = data.get('daily_budget')
        days = data.get('days', 1)
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        if not daily_budget or float(daily_budget) <= 0:
            return jsonify({
                'success': False,
                'error': 'Valid daily_budget is required'
            }), 400
        
        service = get_furriyadh_account_service()
        is_sufficient, message = service.check_sufficient_balance(
            user_email=email,
            daily_budget=float(daily_budget),
            days=int(days)
        )
        
        return jsonify({
            'success': True,
            'is_sufficient': is_sufficient,
            'message': message,
            'balance': service.get_balance(email)
        })
        
    except Exception as e:
        logger.error(f"❌ Error checking balance: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/pause-check', methods=['POST'])
def pause_check():
    """
    Check balance and pause campaigns if out of balance.
    Called by cron job or after syncing spending from Google Ads.
    
    Request body:
    - email: Customer email address
    """
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        paused_campaigns = service.check_and_pause_campaigns_if_needed(email)
        
        return jsonify({
            'success': True,
            'paused_campaigns': paused_campaigns,
            'paused_count': len(paused_campaigns),
            'balance': service.get_balance(email)
        })
        
    except Exception as e:
        logger.error(f"❌ Error in pause check: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """
    Get notifications for a customer.
    
    Query params:
    - email: Customer email address
    - unread_only: If true, only return unread notifications
    """
    try:
        email = request.args.get('email')
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        account = service.get_customer_account(email)
        
        if not account:
            return jsonify({
                'success': False,
                'error': 'Account not found'
            }), 404
        
        # Get notifications from database
        query = service.supabase.table('furriyadh_notifications') \
            .select('*') \
            .eq('customer_account_id', account['id']) \
            .order('created_at', desc=True)
        
        if unread_only:
            query = query.eq('is_read', False)
        
        result = query.limit(50).execute()
        
        return jsonify({
            'success': True,
            'notifications': result.data if result.data else [],
            'count': len(result.data) if result.data else 0
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting notifications: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/notifications/read', methods=['POST'])
def mark_notification_read():
    """
    Mark notification(s) as read.
    
    Request body:
    - notification_id: ID of notification to mark as read
    OR
    - notification_ids: List of notification IDs to mark as read
    """
    try:
        data = request.get_json()
        
        notification_id = data.get('notification_id')
        notification_ids = data.get('notification_ids', [])
        
        if notification_id:
            notification_ids = [notification_id]
        
        if not notification_ids:
            return jsonify({
                'success': False,
                'error': 'notification_id or notification_ids is required'
            }), 400
        
        service = get_furriyadh_account_service()
        
        from datetime import datetime
        
        for nid in notification_ids:
            service.supabase.table('furriyadh_notifications') \
                .update({
                    'is_read': True,
                    'read_at': datetime.utcnow().isoformat()
                }) \
                .eq('id', nid) \
                .execute()
        
        return jsonify({
            'success': True,
            'marked_count': len(notification_ids)
        })
        
    except Exception as e:
        logger.error(f"❌ Error marking notification read: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =====================================================
# REFUND ENDPOINTS
# =====================================================

@furriyadh_bp.route('/refund', methods=['POST'])
def process_refund():
    """
    Process a refund for a customer.
    
    Request body:
    - email: Customer email address
    - amount: Refund amount (positive number)
    - reason: Reason for refund (optional)
    - admin_email: Admin processing the refund (optional)
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        amount = data.get('amount')
        reason = data.get('reason', '')
        admin_email = data.get('admin_email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        if not amount or float(amount) <= 0:
            return jsonify({
                'success': False,
                'error': 'Valid positive amount is required'
            }), 400
        
        service = get_furriyadh_account_service()
        success, message, refund_data = service.process_refund(
            user_email=email,
            refund_amount=float(amount),
            reason=reason,
            admin_email=admin_email
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'refund': refund_data,
                'balance': service.get_balance(email)
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 400
        
    except Exception as e:
        logger.error(f"❌ Error processing refund: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/refunds', methods=['GET'])
def get_refunds():
    """
    Get refund history for a customer.
    
    Query params:
    - email: Customer email address
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        service = get_furriyadh_account_service()
        refunds = service.get_refunds(email)
        
        # Calculate totals
        total_refunded = sum(abs(float(r.get('net_amount', 0))) for r in refunds)
        
        return jsonify({
            'success': True,
            'refunds': refunds,
            'count': len(refunds),
            'total_refunded': total_refunded
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting refunds: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =====================================================
# PAYPAL WEBHOOK ENDPOINTS
# =====================================================

@furriyadh_bp.route('/paypal/webhook', methods=['POST'])
def paypal_webhook():
    """
    PayPal webhook for payment notifications.
    Called by PayPal when payment is completed.
    """
    try:
        data = request.get_json()
        event_type = data.get('event_type')
        
        logger.info(f"📥 PayPal webhook received: {event_type}")
        
        if event_type == 'PAYMENT.CAPTURE.COMPLETED':
            # Payment completed - add deposit
            resource = data.get('resource', {})
            amount_data = resource.get('amount', {})
            
            gross_amount = float(amount_data.get('value', 0))
            currency = amount_data.get('currency_code', 'USD')
            payment_reference = resource.get('id')
            
            # Get payer email from custom_id or payer info
            custom_id = resource.get('custom_id', '')  # We'll store customer email here
            payer_email = resource.get('payer', {}).get('email_address', '')
            
            if not custom_id:
                logger.error("❌ No custom_id (customer email) in PayPal webhook")
                return jsonify({'status': 'error', 'message': 'Missing customer email'}), 400
            
            service = get_furriyadh_account_service()
            success, message, deposit_data = service.add_deposit(
                user_email=custom_id,  # Use custom_id as customer email
                gross_amount=gross_amount,
                payment_method='paypal',
                payment_reference=payment_reference,
                payment_email=payer_email
            )
            
            if success:
                logger.info(f"✅ PayPal payment processed: ${gross_amount} for {custom_id}")
                return jsonify({'status': 'success'}), 200
            else:
                logger.error(f"❌ PayPal payment processing failed: {message}")
                return jsonify({'status': 'error', 'message': message}), 400
        
        elif event_type == 'PAYMENT.CAPTURE.REFUNDED':
            # Handle refund
            logger.info("🔄 PayPal refund received - handling...")
            # TODO: Implement refund handling
            return jsonify({'status': 'acknowledged'}), 200
        
        else:
            # Unknown event type - acknowledge but don't process
            logger.info(f"ℹ️ Unhandled PayPal event type: {event_type}")
            return jsonify({'status': 'acknowledged'}), 200
        
    except Exception as e:
        logger.error(f"❌ PayPal webhook error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'status': 'error', 'message': str(e)}), 500


@furriyadh_bp.route('/paypal/create-order', methods=['POST'])
def create_paypal_order():
    """
    Create PayPal order for deposit.
    Called by frontend when user wants to add credit.
    
    Request body:
    - email: Customer email
    - amount: Amount in USD
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        amount = data.get('amount')
        
        if not email or not amount:
            return jsonify({
                'success': False,
                'error': 'Email and amount are required'
            }), 400
        
        amount = float(amount)
        if amount < 10:  # Minimum deposit
            return jsonify({
                'success': False,
                'error': 'Minimum deposit is $10',
                'message': 'الحد الأدنى للإيداع هو 10$'
            }), 400
        
        # Calculate commission preview
        commission = amount * 0.20
        net_amount = amount - commission
        
        # TODO: Integrate with PayPal SDK to create actual order
        # For now, return order details for frontend to create order
        
        return jsonify({
            'success': True,
            'order_details': {
                'gross_amount': amount,
                'commission': commission,
                'net_amount': net_amount,
                'currency': 'USD',
                'customer_email': email,  # This will be passed as custom_id to PayPal
                'description': f'Furriyadh Account Credit - ${net_amount:.2f} (after 20% commission)'
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error creating PayPal order: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =====================================================
# ADMIN ENDPOINTS
# =====================================================

@furriyadh_bp.route('/admin/accounts', methods=['GET'])
def admin_get_all_accounts():
    """
    Admin endpoint to get all Furriyadh accounts.
    Requires admin authentication.
    """
    try:
        # TODO: Add admin authentication check
        
        service = get_furriyadh_account_service()
        
        result = service.supabase.table('furriyadh_customer_accounts') \
            .select('*') \
            .order('created_at', desc=True) \
            .execute()
        
        accounts = result.data if result.data else []
        
        # Calculate totals
        total_balance = sum(float(a.get('current_balance', 0)) for a in accounts)
        total_commission = sum(float(a.get('total_commission', 0)) for a in accounts)
        total_spent = sum(float(a.get('total_spent', 0)) for a in accounts)
        
        return jsonify({
            'success': True,
            'accounts': accounts,
            'count': len(accounts),
            'totals': {
                'total_balance': total_balance,
                'total_commission': total_commission,
                'total_spent': total_spent
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting accounts: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/admin/deposits', methods=['GET'])
def admin_get_all_deposits():
    """
    Admin endpoint to get all deposits.
    Requires admin authentication.
    """
    try:
        # TODO: Add admin authentication check
        
        service = get_furriyadh_account_service()
        
        result = service.supabase.table('furriyadh_deposits') \
            .select('*, furriyadh_customer_accounts(user_email, account_name)') \
            .order('created_at', desc=True) \
            .execute()
        
        deposits = result.data if result.data else []
        
        # Calculate totals
        total_gross = sum(float(d.get('gross_amount', 0)) for d in deposits)
        total_commission = sum(float(d.get('commission_amount', 0)) for d in deposits)
        total_net = sum(float(d.get('net_amount', 0)) for d in deposits)
        
        return jsonify({
            'success': True,
            'deposits': deposits,
            'count': len(deposits),
            'totals': {
                'total_gross': total_gross,
                'total_commission': total_commission,
                'total_net': total_net
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error getting deposits: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@furriyadh_bp.route('/admin/manual-deposit', methods=['POST'])
def admin_manual_deposit():
    """
    Admin endpoint to add manual deposit.
    Used when customer pays via bank transfer or other manual methods.
    
    Request body:
    - email: Customer email
    - amount: Gross amount
    - notes: Admin notes
    """
    try:
        # TODO: Add admin authentication check
        
        data = request.get_json()
        
        email = data.get('email')
        amount = data.get('amount')
        notes = data.get('notes', 'Manual deposit by admin')
        
        if not email or not amount:
            return jsonify({
                'success': False,
                'error': 'Email and amount are required'
            }), 400
        
        service = get_furriyadh_account_service()
        success, message, deposit_data = service.add_deposit(
            user_email=email,
            gross_amount=float(amount),
            payment_method='manual',
            payment_reference=f'MANUAL-{datetime.now().strftime("%Y%m%d%H%M%S")}'
        )
        
        # Add notes to deposit
        if success and deposit_data:
            from datetime import datetime
            service.supabase.table('furriyadh_deposits') \
                .update({'notes': notes}) \
                .eq('id', deposit_data['id']) \
                .execute()
        
        return jsonify({
            'success': success,
            'message': message,
            'deposit': deposit_data
        })
        
    except Exception as e:
        logger.error(f"❌ Error adding manual deposit: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Import datetime for manual deposit
from datetime import datetime
