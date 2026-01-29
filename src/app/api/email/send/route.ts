/**
 * 📧 Professional Email Service API
 * Premium email templates for Furriyadh Payment Gateway
 * Supports: Deposit Confirmation, Low Balance Alert
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email Types
type EmailType = 'deposit_confirmation' | 'low_balance_alert' | 'payment_failed' | 'refund_processed' | 'subscription_confirmation' | 'subscription_cancelled' | 'subscription_renewal_reminder';

// Email configuration from environment
const EMAIL_CONFIG = {
    host: process.env.EMAIL_SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_SENDER_EMAIL || '',
        pass: process.env.EMAIL_SENDER_PASSWORD || ''
    }
};

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport(EMAIL_CONFIG);
};

// Premium HTML Email Templates
const getEmailTemplate = (type: EmailType, data: any): { subject: string; html: string } => {
    const baseStyles = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        </style>
    `;

    switch (type) {
        case 'deposit_confirmation':
            return {
                subject: `✅ Payment Confirmed - $${data.amount} Added to Your Account`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">✅</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Payment Successful!</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your funds have been added to your account</p>
                            </div>
                            
                            <!-- Amount Card -->
                            <div style="padding: 32px;">
                                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                    <p style="color: #166534; font-size: 14px; margin-bottom: 8px;">Amount Added</p>
                                    <p style="color: #15803d; font-size: 36px; font-weight: 700;">$${data.netAmount}</p>
                                    <p style="color: #166534; font-size: 12px; margin-top: 8px;">After ${data.commissionRate}% commission</p>
                                </div>
                                
                                <!-- Transaction Details -->
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Transaction Details</h3>
                                
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Transaction ID</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; font-family: monospace;">${data.transactionId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Payment Method</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.paymentMethod}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Date & Time</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.date}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Gross Amount</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">$${data.amount}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Commission (${data.commissionRate}%)</td>
                                        <td style="padding: 12px 0; color: #ef4444; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">-$${data.commission}</td>
                                    </tr>
                                    <tr style="background: #f9fafb;">
                                        <td style="padding: 16px 12px; color: #1f2937; font-size: 16px; font-weight: 600; border-top: 2px solid #e5e7eb;">New Balance</td>
                                        <td style="padding: 16px 12px; color: #059669; font-size: 16px; font-weight: 700; text-align: right; border-top: 2px solid #e5e7eb;">$${data.newBalance}</td>
                                    </tr>
                                </table>
                                
                                <!-- CTA Button -->
                                <a href="${data.dashboardUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin-top: 24px;">
                                    View Dashboard →
                                </a>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
                                    This is an automated message from Furriyadh Payment System
                                </p>
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'low_balance_alert':
            return {
                subject: `⚠️ Low Balance Alert - Your Account Balance is $${data.currentBalance}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">⚠️</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Low Balance Alert</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your campaigns may pause soon</p>
                            </div>
                            
                            <!-- Alert Card -->
                            <div style="padding: 32px;">
                                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                    <p style="color: #92400e; font-size: 14px; margin-bottom: 8px;">Current Balance</p>
                                    <p style="color: #b45309; font-size: 36px; font-weight: 700;">$${data.currentBalance}</p>
                                    <p style="color: #92400e; font-size: 12px; margin-top: 8px;">Threshold: $${data.threshold}</p>
                                </div>
                                
                                <!-- Warning Message -->
                                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                                    <p style="color: #991b1b; font-size: 14px; line-height: 1.6;">
                                        <strong>⚠️ Important:</strong> Your account balance is running low. 
                                        When your balance reaches $0, your active campaigns will be automatically paused 
                                        until you add more funds.
                                    </p>
                                </div>
                                
                                <!-- Active Campaigns -->
                                ${data.activeCampaigns > 0 ? `
                                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                                    <p style="color: #0369a1; font-size: 14px;">
                                        📊 You have <strong>${data.activeCampaigns} active campaign(s)</strong> that may be affected.
                                    </p>
                                </div>
                                ` : ''}
                                
                                <!-- CTA Button -->
                                <a href="${data.addFundsUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                    Add Funds Now →
                                </a>
                                
                                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
                                    Recommended: Add at least $50 to keep your campaigns running smoothly
                                </p>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
                                    You're receiving this because your balance dropped below $${data.threshold}
                                </p>
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'payment_failed':
            return {
                subject: `❌ Payment Failed - Action Required`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">❌</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Payment Failed</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your payment could not be processed</p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 32px;">
                                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                    <p style="color: #991b1b; font-size: 14px; line-height: 1.6;">
                                        <strong>Error:</strong> ${data.errorMessage || 'Payment was declined by your payment provider.'}
                                    </p>
                                </div>
                                
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px;">What to do next:</h3>
                                <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                                    <li>Check your payment method details</li>
                                    <li>Ensure sufficient funds are available</li>
                                    <li>Try a different payment method</li>
                                    <li>Contact your bank if the issue persists</li>
                                </ul>
                                
                                <a href="${data.retryUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin-top: 24px;">
                                    Try Again →
                                </a>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 12px;">
                                    Need help? Contact support at ads@furriyadh.com
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'refund_processed':
            return {
                subject: `💸 Refund Processed - $${data.amount} Has Been Refunded`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">💸</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Refund Processed</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your refund has been successfully processed</p>
                            </div>
                            
                            <!-- Amount Card -->
                            <div style="padding: 32px;">
                                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #93c5fd; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                    <p style="color: #1e40af; font-size: 14px; margin-bottom: 8px;">Amount Refunded</p>
                                    <p style="color: #1d4ed8; font-size: 36px; font-weight: 700;">$${data.amount}</p>
                                </div>
                                
                                <!-- Refund Details -->
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Refund Details</h3>
                                
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Reference</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; font-family: monospace;">${data.reference}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Date</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.date}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Reason</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.reason || 'Not specified'}</td>
                                    </tr>
                                    <tr style="background: #f9fafb;">
                                        <td style="padding: 16px 12px; color: #1f2937; font-size: 16px; font-weight: 600; border-top: 2px solid #e5e7eb;">New Balance</td>
                                        <td style="padding: 16px 12px; color: #059669; font-size: 16px; font-weight: 700; text-align: right; border-top: 2px solid #e5e7eb;">$${data.newBalance}</td>
                                    </tr>
                                </table>
                                
                                <!-- CTA Button -->
                                <a href="${data.dashboardUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin-top: 24px;">
                                    View Balance →
                                </a>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
                                    If you did not request this refund, please contact support immediately.
                                </p>
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'subscription_confirmation':
            return {
                subject: `🎉 Subscription Activated - ${data.planName} Plan`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">🎉</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Subscription Activated!</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Welcome to ${data.planName} Plan</p>
                            </div>
                            
                            <!-- Plan Card -->
                            <div style="padding: 32px;">
                                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                    <p style="color: #166534; font-size: 14px; margin-bottom: 8px;">Your Plan</p>
                                    <p style="color: #15803d; font-size: 28px; font-weight: 700;">${data.planName}</p>
                                    <p style="color: #166534; font-size: 16px; margin-top: 8px;">$${data.amount}/${data.billingCycle === 'monthly' ? 'month' : 'year'}</p>
                                </div>
                                
                                <!-- Subscription Details -->
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Subscription Details</h3>
                                
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Transaction ID</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; font-family: monospace;">${data.transactionId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Billing Cycle</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Next Billing Date</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">${data.nextBillingDate || 'Auto-renewal'}</td>
                                    </tr>
                                </table>
                                
                                <!-- CTA Button -->
                                <a href="${data.dashboardUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin-top: 24px;">
                                    Go to Dashboard →
                                </a>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
                                    Thank you for subscribing to Furriyadh!
                                </p>
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'subscription_cancelled':
            return {
                subject: `😢 Subscription Cancelled - We're Sorry to See You Go`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #6b7280 0%, #374151 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">😢</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Subscription Cancelled</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">We're sorry to see you go</p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 32px;">
                                <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                    <p style="color: #92400e; font-size: 14px; line-height: 1.6;">
                                        <strong>📅 Access Until:</strong> ${data.endDate}<br>
                                        You'll continue to have access until your current billing period ends.
                                    </p>
                                </div>
                                
                                <h3 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 16px;">What happens next?</h3>
                                <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
                                    <li>Your account will revert to the Free plan</li>
                                    <li>Premium features will be disabled</li>
                                    <li>Your data will be preserved</li>
                                    <li>You can resubscribe anytime</li>
                                </ul>
                                
                                <a href="${data.resubscribeUrl || data.dashboardUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                    Resubscribe →
                                </a>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 8px;">
                                    We'd love to hear your feedback. Reply to this email to let us know how we can improve.
                                </p>
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        case 'subscription_renewal_reminder':
            return {
                subject: `⏰ Subscription Renewal Reminder - ${data.daysUntilRenewal} Days Left`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${baseStyles}
                    </head>
                    <body style="background-color: #f3f4f6; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 32px;">⏰</span>
                                </div>
                                <h1 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Renewal Reminder</h1>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">Your subscription renews soon</p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 32px;">
                                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                    <p style="color: #92400e; font-size: 14px; margin-bottom: 8px;">Renews In</p>
                                    <p style="color: #b45309; font-size: 36px; font-weight: 700;">${data.daysUntilRenewal} Days</p>
                                    <p style="color: #92400e; font-size: 14px; margin-top: 8px;">on ${data.renewalDate}</p>
                                </div>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Plan</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${data.planName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6;">Amount</td>
                                        <td style="padding: 12px 0; color: #1f2937; font-size: 14px; text-align: right; border-top: 1px solid #f3f4f6;">$${data.amount}</td>
                                    </tr>
                                </table>
                                
                                <a href="${data.dashboardUrl}" style="display: block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                    Manage Subscription →
                                </a>
                                
                                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
                                    To cancel, visit your billing settings before ${data.renewalDate}
                                </p>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 12px;">
                                    © 2025 Furriyadh. All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </body>
                    </html>
                `
            };

        default:
            return {
                subject: 'Furriyadh Notification',
                html: `<p>${data.message || 'You have a new notification.'}</p>`
            };
    }
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, type, data } = body;

        if (!to || !type) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: to, type'
            }, { status: 400 });
        }

        // Get email template
        const { subject, html } = getEmailTemplate(type as EmailType, data);

        // Create transporter and send
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Furriyadh" <${EMAIL_CONFIG.auth.user}>`,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent:', info.messageId);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        });

    } catch (error: any) {
        console.error('❌ Email send error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to send email'
        }, { status: 500 });
    }
}
