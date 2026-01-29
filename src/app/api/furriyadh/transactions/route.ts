/**
 * 🏦 Furriyadh Balance History API
 * Fetches transaction history: deposits, campaign spending, refunds
 * Supports: pagination, type filtering, date filtering, CSV export
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type'); // 'deposit' | 'campaign' | 'refund' | null (all)
        const startDate = searchParams.get('startDate'); // YYYY-MM-DD
        const endDate = searchParams.get('endDate'); // YYYY-MM-DD
        const exportFormat = searchParams.get('export'); // 'csv' | null

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Get user's customer account
        const { data: account, error: accountError } = await supabase
            .from('furriyadh_customer_accounts')
            .select('id, user_email, current_balance')
            .eq('user_email', email)
            .maybeSingle();

        if (accountError || !account) {
            return NextResponse.json({
                success: true,
                transactions: [],
                balance: 0,
                totalCount: 0,
                page: 1,
                totalPages: 0,
                message: 'No account found'
            });
        }

        // Build transactions list
        let allTransactions: any[] = [];

        // 2. Fetch deposits and refunds (if type allows)
        if (!type || type === 'deposit' || type === 'refund') {
            let depositsQuery = supabase
                .from('furriyadh_deposits')
                .select('id, gross_amount, net_amount, payment_method, status, notes, created_at')
                .eq('customer_account_id', account.id)
                .order('created_at', { ascending: false });

            // Date filters
            if (startDate) depositsQuery = depositsQuery.gte('created_at', startDate);
            if (endDate) depositsQuery = depositsQuery.lte('created_at', `${endDate}T23:59:59`);

            const { data: deposits, error: depositsError } = await depositsQuery;

            if (deposits && !depositsError) {
                deposits.forEach(d => {
                    const isRefund = d.payment_method === 'refund' || d.net_amount < 0;
                    const txType = isRefund ? 'refund' : 'deposit';

                    // Apply type filter
                    if (type && type !== txType) return;

                    allTransactions.push({
                        id: d.id,
                        type: txType,
                        method: isRefund ? 'Refund' : formatPaymentMethod(d.payment_method),
                        description: isRefund
                            ? `Refund${d.notes ? `: ${d.notes}` : ''}`
                            : `Deposit via ${formatPaymentMethod(d.payment_method)}`,
                        amount: d.net_amount || d.gross_amount,
                        date: d.created_at,
                        status: d.status
                    });
                });
            }
        }

        // 3. Fetch campaign spending (if type is null or 'campaign')
        if (!type || type === 'campaign') {
            let campaignsQuery = supabase
                .from('furriyadh_campaigns')
                .select('id, campaign_name, total_spent, status, created_at')
                .eq('customer_account_id', account.id)
                .gt('total_spent', 0)
                .order('created_at', { ascending: false });

            // Date filters
            if (startDate) campaignsQuery = campaignsQuery.gte('created_at', startDate);
            if (endDate) campaignsQuery = campaignsQuery.lte('created_at', `${endDate}T23:59:59`);

            const { data: campaigns, error: campaignsError } = await campaignsQuery;

            if (campaigns && !campaignsError) {
                campaigns.forEach(c => {
                    if (c.total_spent > 0) {
                        allTransactions.push({
                            id: c.id,
                            type: 'campaign',
                            description: `Campaign: ${c.campaign_name}`,
                            amount: -c.total_spent,
                            date: c.created_at,
                            status: 'completed'
                        });
                    }
                });
            }
        }

        // Sort by date (newest first)
        allTransactions.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const totalCount = allTransactions.length;
        const totalPages = Math.ceil(totalCount / limit);

        // Handle CSV export
        if (exportFormat === 'csv') {
            const csv = generateCSV(allTransactions);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedTransactions = allTransactions.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            success: true,
            transactions: paginatedTransactions,
            balance: account.current_balance || 0,
            totalCount,
            page,
            totalPages,
            hasMore: page < totalPages
        });

    } catch (error) {
        console.error('❌ Balance history API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

function formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
        'paypal': 'PayPal',
        'stripe': 'Visa / MasterCard',
        'bank_transfer': 'Bank Transfer',
        'manual': 'Manual Transfer',
        'usdt': 'USDT (TRC20)',
        'binance': 'Binance Pay'
    };
    return methods[method?.toLowerCase()] || method || 'Unknown';
}

function generateCSV(transactions: any[]): string {
    const headers = ['Date', 'Type', 'Description', 'Amount ($)', 'Status'];
    const rows = transactions.map(tx => [
        new Date(tx.date).toLocaleString('en-US'),
        tx.type,
        tx.description || tx.method || '',
        tx.amount.toFixed(2),
        tx.status
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}
