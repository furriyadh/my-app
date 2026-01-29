
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
💳 Stripe Payment Routes
Handles Checkout Sessions and Webhooks for Subscriptions & One-time Payments
"""

import os
import logging
import stripe
from flask import Blueprint, request, jsonify, redirect
from services.furriyadh_customer_account_service import get_furriyadh_account_service

logger = logging.getLogger(__name__)

stripe_bp = Blueprint('stripe', __name__, url_prefix='/api/stripe')

# Helper to get keys based on environment (Live vs Test)
# User can toggle this by just changing keys in .env, but we can also force it here
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

stripe.api_key = STRIPE_SECRET_KEY

@stripe_bp.route('/config', methods=['GET'])
def get_config():
    """Return Publishable Key to frontend"""
    return jsonify({'publishableKey': STRIPE_PUBLISHABLE_KEY})

@stripe_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """
    Create a Stripe Checkout Session.
    Supports:
    1. 'subscription' (Monthly/Yearly plans)
    2. 'payment' (One-time commission/deposit)
    """
    try:
        data = request.get_json()
        
        # Required fields
        customer_email = data.get('email')
        user_id = data.get('userId') # ✅ Get User ID
        mode = data.get('mode', 'payment') # 'subscription' or 'payment'
        
        # Optional fields depending on mode
        price_id = data.get('priceId') # For subscriptions
        amount = data.get('amount') # For custom payments (in cents? No, let's expect dollars and convert)
        plan_name = data.get('planName', 'Furriyadh Service')
        plan_id = data.get('planId') # ✅ Get Plan ID from request
        billing_cycle = data.get('billingCycle', 'monthly') # ✅ Get Billing Cycle
        success_url = data.get('successUrl')
        cancel_url = data.get('cancelUrl')
        
        if not STRIPE_SECRET_KEY:
             return jsonify({'error': 'Stripe keys not configured'}), 500

        # Base Checkout Session Params
        checkout_params = {
            'payment_method_types': ['card'],
            'customer_email': customer_email,
            'mode': mode,
            'success_url': success_url or f"{request.host_url}dashboard/google-ads/billing?session_id={{CHECKOUT_SESSION_ID}}&payment=success&plan={plan_id}",
            'cancel_url': cancel_url or f"{request.host_url}dashboard/google-ads/billing?payment=cancelled",
            # Store metadata to identify the user/plan later in webhook
            'metadata': {
                'customer_email': customer_email,
                'user_id': user_id, # ✅ Store User ID in metadata
                'plan_name': plan_name,
                'plan_id': plan_id,
                'billing_cycle': billing_cycle,
                'type': mode
            }
        }

        # 1. Handle Subscription (Fixed Plans)
        if mode == 'subscription':
            if not price_id:
                return jsonify({'error': 'priceId is required for subscriptions'}), 400
                
            checkout_params['line_items'] = [{
                'price': price_id,
                'quantity': 1,
            }]
            
        # 2. Handle One-Time Payment (Managed Account Commission)
        elif mode == 'payment':
            if not amount:
                 return jsonify({'error': 'amount is required for one-time payments'}), 400
            
            # Convert dollars to cents
            amount_cents = int(float(amount) * 100)
            
            checkout_params['line_items'] = [{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan_name,
                        'description': 'Furriyadh Managed Account Service (20% Commission)',
                        'images': ['https://furriyadh.com/images/logo-icon.png'], # Optional
                    },
                    'unit_amount': amount_cents,
                },
                'quantity': 1,
            }]

        # Create Session
        session = stripe.checkout.Session.create(**checkout_params)
        
        return jsonify({
            'sessionId': session.id,
            'url': session.url
        })

    except Exception as e:
        logger.error(f"❌ Error creating checkout session: {e}")
        return jsonify({'error': str(e)}), 400

@stripe_bp.route('/verify-checkout-session', methods=['POST'])
def verify_checkout_session():
    """
    Manually verify a checkout session state.
    Useful for localhost where webhooks might not fire.
    """
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
             return jsonify({'error': 'Session ID is required'}), 400
             
        # Retrieve session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            logger.info(f"✅ Manual Verification: Payment Success for session {session_id}")
            # Re-use the existing handler logic
            handle_checkout_session(session)
            return jsonify({'success': True, 'status': 'paid'})
            
        return jsonify({'success': False, 'status': session.payment_status})
        
    except Exception as e:
        logger.error(f"❌ Error verifying checkout session: {e}")
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/webhook', methods=['POST'])
def webhook_received():
    """
    Handle Stripe Webhooks
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session(session)
    
    elif event['type'] == 'invoice.payment_succeeded':
        # Used for recurring subscription renewals
        invoice = event['data']['object']
        handle_invoice_payment(invoice)

    return jsonify({'status': 'success'}), 200

def handle_checkout_session(session):
    """
    Fulfill the purchase...
    """
    customer_email = session.get('customer_email') or session.get('metadata', {}).get('customer_email')
    user_id = session.get('metadata', {}).get('user_id') # ✅ Get User ID
    mode = session.get('mode')
    amount_total = session.get('amount_total') # in cents
    
    logger.info(f"✅ Payment Success for {customer_email} - Mode: {mode}")

    service = get_furriyadh_account_service()

    if mode == 'payment' and amount_total:
        # One-time payment (Deposit/Commission)
        amount_usd = amount_total / 100.0
        
        # Add deposit/commission to DB
        service.add_deposit(
            user_email=customer_email,
            gross_amount=amount_usd,
            payment_method='stripe',
            payment_reference=session.get('id'),
            payment_email=customer_email
        )
        
    elif mode == 'subscription':
        # Handle new subscription activation in DB
        logger.info(f"🆕 New Subscription for {customer_email}")
        
        # Extract plan_id from metadata
        plan_id = session.get('metadata', {}).get('plan_id')
        billing_cycle = session.get('metadata', {}).get('billing_cycle', 'monthly') # ✅ Get Billing Cycle
        
        if plan_id:
            try:
                # Update user subscription status in DB
                subscription_id = session.get('subscription')
                customer_id = session.get('customer')
                
                success, msg = service.update_subscription(
                    user_email=customer_email,
                    plan_id=plan_id,
                    billing_cycle=billing_cycle, # ✅ Use dynamic cycle
                    stripe_subscription_id=subscription_id,
                    stripe_customer_id=customer_id,
                    user_id=user_id # ✅ Pass User ID to service
                )
                if not success:
                    logger.error(f"❌ Failed to update subscription: {msg}")
            except Exception as e:
                logger.error(f"❌ Error in subscription handler: {e}")
        else:
            logger.warning(f"⚠️ Plan ID missing in metadata for {customer_email}")

def handle_invoice_payment(invoice):
    """
    Handle recurring payment success
    """
    customer_email = invoice.get('customer_email')
    amount_paid = invoice.get('amount_paid') # in cents
    
    logger.info(f"🔄 Recurring Payment Success for {customer_email}: ${amount_paid/100}")
    # Extend subscription validity, etc.


@stripe_bp.route('/products', methods=['GET'])
def get_products():
    """
    Get active products and prices from Stripe.
    Allows dynamic plan management from Stripe Dashboard.
    """
    try:
        # List active products
        products = stripe.Product.list(active=True, limit=100)
        
        # List active prices
        prices = stripe.Price.list(active=True, limit=100)
        
        formatted_plans = {}
        
        for p in products.data:
            # We use metadata 'plan_id' to identify our known plans (basic, pro, agency)
            plan_id = p.metadata.get('plan_id')
            if not plan_id:
                continue
                
            if plan_id not in formatted_plans:
                formatted_plans[plan_id] = {
                    'id': plan_id,
                    'name': p.name,
                    'description': p.description,
                    'prices': {'monthly': None, 'yearly': None}
                }
        
        # Match prices to plans
        for price in prices.data:
            product_id = price.product
             # Find which plan this price belongs to
            related_product = next((p for p in products.data if p.id == product_id), None)
            
            if related_product:
                plan_id = related_product.metadata.get('plan_id')
                if plan_id and plan_id in formatted_plans:
                    # Identify interval
                    if price.recurring:
                        interval = price.recurring.interval # month or year
                        if interval == 'month':
                            formatted_plans[plan_id]['prices']['monthly'] = {
                                'id': price.id,
                                'amount': price.unit_amount / 100, # Convert to dollars
                            }
                        elif interval == 'year':
                            formatted_plans[plan_id]['prices']['yearly'] = {
                                'id': price.id,
                                'amount': price.unit_amount / 100,
                            }
                            
        return jsonify({
            'success': True, 
            'plans': formatted_plans
        })

    except Exception as e:
        logger.error(f"❌ Error fetching Stripe products: {e}")
        return jsonify({'error': str(e)}), 500
