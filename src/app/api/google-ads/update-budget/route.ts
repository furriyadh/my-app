import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

/**
 * POST /api/google-ads/update-budget
 * Updates campaign daily budget via Python backend
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            campaignId,
            customerId,
            newBudget
        } = body;

        if (!campaignId || !customerId || !newBudget) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: campaignId, customerId, newBudget' },
                { status: 400 }
            );
        }

        console.log('💰 Updating campaign budget:', {
            campaignId,
            customerId: customerId.replace(/-/g, ''),
            newBudget
        });

        // Call Python backend to update budget
        const backendUrl = getApiUrl('/api/google-ads/update-campaign-budget');

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: customerId.replace(/-/g, ''),
                campaign_id: campaignId,
                new_daily_budget: newBudget
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('❌ Backend error:', result);
            return NextResponse.json(
                { success: false, error: result.error || result.message || 'Failed to update budget' },
                { status: response.status }
            );
        }

        console.log('✅ Budget updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Budget updated successfully',
            newBudget: newBudget
        });

    } catch (error: any) {
        console.error('❌ Error updating budget:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
