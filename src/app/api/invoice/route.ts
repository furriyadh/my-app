/**
 * 🧾 Invoice PDF Generator API
 * Premium PDF invoices for Furriyadh deposits
 * Uses puppeteer for high-quality HTML-to-PDF conversion
 */

import { NextRequest, NextResponse } from 'next/server';

// Generate professional HTML invoice template
function generateInvoiceHTML(data: {
    invoiceNumber: string;
    date: string;
    customerEmail: string;
    customerName?: string;
    transactionId: string;
    paymentMethod: string;
    grossAmount: number;
    commission: number;
    commissionRate: number;
    netAmount: number;
    status: string;
}): string {
    return `
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invoice ${data.invoiceNumber}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 40px;
                min-height: 100vh;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .invoice-header {
                background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                padding: 40px;
                color: white;
            }
            
            .logo-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
            }
            
            .company-name {
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            
            .invoice-badge {
                background: rgba(255,255,255,0.2);
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .invoice-title {
                font-size: 42px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .invoice-number {
                font-size: 18px;
                opacity: 0.9;
            }
            
            .invoice-body {
                padding: 40px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
            }
            
            .info-section h4 {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #94a3b8;
                margin-bottom: 12px;
            }
            
            .info-section p {
                font-size: 15px;
                color: #1e293b;
                line-height: 1.6;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            
            .items-table th {
                background: #f8fafc;
                padding: 16px 20px;
                text-align: left;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #64748b;
                font-weight: 600;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .items-table td {
                padding: 20px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
            }
            
            .items-table .description {
                font-weight: 500;
            }
            
            .items-table .amount {
                text-align: right;
                font-family: 'SF Mono', 'Monaco', monospace;
            }
            
            .totals-section {
                background: #f8fafc;
                border-radius: 12px;
                padding: 24px;
                margin-top: 20px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .total-row:last-child {
                border-bottom: none;
                padding-top: 16px;
                margin-top: 8px;
                border-top: 2px solid #cbd5e1;
            }
            
            .total-row .label {
                color: #64748b;
            }
            
            .total-row .value {
                font-weight: 600;
                color: #1e293b;
                font-family: 'SF Mono', 'Monaco', monospace;
            }
            
            .total-row.grand-total .label {
                font-weight: 700;
                color: #1e293b;
                font-size: 18px;
            }
            
            .total-row.grand-total .value {
                font-size: 24px;
                color: #059669;
                font-weight: 700;
            }
            
            .commission-row .value {
                color: #ef4444;
            }
            
            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
            }
            
            .status-completed {
                background: #d1fae5;
                color: #059669;
            }
            
            .status-pending {
                background: #fef3c7;
                color: #d97706;
            }
            
            .invoice-footer {
                background: #1e293b;
                padding: 30px 40px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .footer-info {
                font-size: 13px;
                opacity: 0.8;
            }
            
            .footer-contact {
                font-size: 14px;
            }
            
            .footer-contact a {
                color: #a78bfa;
                text-decoration: none;
            }
            
            .watermark {
                position: fixed;
                bottom: 40px;
                right: 40px;
                font-size: 11px;
                color: #94a3b8;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .invoice-container {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
                <div class="logo-section">
                    <div class="company-name">Furriyadh</div>
                    <div class="invoice-badge">
                        <span class="status-badge ${data.status === 'completed' ? 'status-completed' : 'status-pending'}">
                            ● ${data.status === 'completed' ? 'PAID' : 'PENDING'}
                        </span>
                    </div>
                </div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${data.invoiceNumber}</div>
            </div>
            
            <!-- Body -->
            <div class="invoice-body">
                <div class="info-grid">
                    <div class="info-section">
                        <h4>Bill To</h4>
                        <p>
                            <strong>${data.customerName || 'Valued Customer'}</strong><br>
                            ${data.customerEmail}
                        </p>
                    </div>
                    <div class="info-section" style="text-align: right;">
                        <h4>Invoice Details</h4>
                        <p>
                            <strong>Date:</strong> ${data.date}<br>
                            <strong>Transaction ID:</strong> ${data.transactionId}<br>
                            <strong>Payment Method:</strong> ${data.paymentMethod}
                        </p>
                    </div>
                </div>
                
                <!-- Items Table -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="description">
                                Furriyadh Account Credit<br>
                                <small style="color: #94a3b8;">Google Ads Campaign Management Service</small>
                            </td>
                            <td class="amount">$${data.grossAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Totals -->
                <div class="totals-section">
                    <div class="total-row">
                        <span class="label">Subtotal</span>
                        <span class="value">$${data.grossAmount.toFixed(2)}</span>
                    </div>
                    <div class="total-row commission-row">
                        <span class="label">Service Fee (${data.commissionRate}%)</span>
                        <span class="value">-$${data.commission.toFixed(2)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span class="label">Credit Added</span>
                        <span class="value">$${data.netAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="invoice-footer">
                <div class="footer-info">
                    Thank you for your business!<br>
                    © 2025 Furriyadh. All rights reserved.
                </div>
                <div class="footer-contact">
                    <a href="mailto:ads@furriyadh.com">ads@furriyadh.com</a>
                </div>
            </div>
        </div>
        
        <div class="watermark">
            Generated by Furriyadh Payment System
        </div>
    </body>
    </html>
    `;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transactionId');
        const format = searchParams.get('format') || 'html'; // html or pdf

        // Get invoice data from query params or fetch from DB
        const invoiceData = {
            invoiceNumber: searchParams.get('invoiceNumber') || `INV-${Date.now()}`,
            date: searchParams.get('date') || new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
            customerEmail: searchParams.get('email') || 'customer@example.com',
            customerName: searchParams.get('name') || undefined,
            transactionId: transactionId || 'N/A',
            paymentMethod: searchParams.get('method') || 'PayPal',
            grossAmount: parseFloat(searchParams.get('gross') || '0'),
            commission: parseFloat(searchParams.get('commission') || '0'),
            commissionRate: parseFloat(searchParams.get('rate') || '20'),
            netAmount: parseFloat(searchParams.get('net') || '0'),
            status: searchParams.get('status') || 'completed'
        };

        const html = generateInvoiceHTML(invoiceData);

        if (format === 'html') {
            // Return HTML for preview/print
            return new NextResponse(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                }
            });
        }

        // For PDF, we'll use a client-side approach (window.print or html2pdf)
        // Return HTML with auto-print script
        const printableHTML = html.replace('</body>', `
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>`);

        return new NextResponse(printableHTML, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            }
        });

    } catch (error: any) {
        console.error('❌ Invoice generation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to generate invoice'
        }, { status: 500 });
    }
}
