import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Commission rate (20%)
const COMMISSION_RATE = 0.20;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const month = searchParams.get('month'); // Format: YYYY-MM

        // If userId provided, get commission for specific user
        if (userId) {
            const { data: invoices, error } = await supabase
                .from('commission_invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, invoices });
        }

        // Get all commission records (admin)
        let query = supabase
            .from('commission_invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (month) {
            query = query.eq('invoice_month', month);
        }

        const { data: invoices, error } = await query.limit(100);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate totals
        const totalCommission = invoices?.reduce((sum, inv) => sum + (inv.commission_amount || 0), 0) || 0;
        const totalAdSpend = invoices?.reduce((sum, inv) => sum + (inv.total_ad_spend || 0), 0) || 0;
        const paidCommission = invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.commission_amount || 0), 0) || 0;
        const pendingCommission = invoices?.filter(i => i.status === 'pending').reduce((sum, inv) => sum + (inv.commission_amount || 0), 0) || 0;

        return NextResponse.json({
            success: true,
            invoices,
            summary: {
                totalCommission,
                totalAdSpend,
                paidCommission,
                pendingCommission,
                commissionRate: COMMISSION_RATE
            }
        });

    } catch (error) {
        console.error('Error fetching commissions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, adSpend, month, description } = body;

        if (!userId || adSpend === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, adSpend' },
                { status: 400 }
            );
        }

        // Calculate commission (20% of ad spend)
        const commissionAmount = adSpend * COMMISSION_RATE;

        // Get current month if not provided
        const invoiceMonth = month || new Date().toISOString().slice(0, 7);

        // Check if invoice already exists for this user/month
        const { data: existing } = await supabase
            .from('commission_invoices')
            .select('*')
            .eq('user_id', userId)
            .eq('invoice_month', invoiceMonth)
            .single();

        if (existing) {
            // Update existing invoice
            const newAdSpend = (existing.total_ad_spend || 0) + adSpend;
            const newCommission = newAdSpend * COMMISSION_RATE;

            const { data: updated, error } = await supabase
                .from('commission_invoices')
                .update({
                    total_ad_spend: newAdSpend,
                    commission_amount: newCommission,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: 'Commission invoice updated',
                invoice: updated,
                addedAdSpend: adSpend,
                addedCommission: adSpend * COMMISSION_RATE
            });
        }

        // Create new invoice
        const { data: invoice, error } = await supabase
            .from('commission_invoices')
            .insert({
                user_id: userId,
                invoice_month: invoiceMonth,
                total_ad_spend: adSpend,
                commission_amount: commissionAmount,
                commission_rate: COMMISSION_RATE,
                status: 'pending',
                description: description || null
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also log to daily_ad_spend for detailed tracking
        await supabase
            .from('daily_ad_spend')
            .insert({
                user_id: userId,
                spend_date: new Date().toISOString().slice(0, 10),
                ad_spend_amount: adSpend,
                commission_amount: commissionAmount,
                currency: 'USD'
            });

        return NextResponse.json({
            success: true,
            message: 'Commission invoice created',
            invoice,
            commissionRate: COMMISSION_RATE,
            calculatedCommission: commissionAmount
        });

    } catch (error) {
        console.error('Error creating commission:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Mark invoice as paid
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { invoiceId, status, paidAt } = body;

        if (!invoiceId) {
            return NextResponse.json(
                { error: 'Missing required field: invoiceId' },
                { status: 400 }
            );
        }

        const updateData: any = {
            status: status || 'paid',
            updated_at: new Date().toISOString()
        };

        if (status === 'paid') {
            updateData.paid_at = paidAt || new Date().toISOString();
        }

        const { data: invoice, error } = await supabase
            .from('commission_invoices')
            .update(updateData)
            .eq('id', invoiceId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Invoice marked as ${status || 'paid'}`,
            invoice
        });

    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
