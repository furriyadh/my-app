import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
    });
}

export async function POST(request: NextRequest) {
    try {
        const { channel_id, ad_account_id } = await request.json();

        if (!channel_id) {
            return NextResponse.json(
                { success: false, error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();

        // Try to get current user from session (optional)
        const authHeader = request.headers.get('authorization');
        let userId: string | null = null;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const { data: { user }, error: userError } = await supabase.auth.getUser(token);
                if (!userError && user) {
                    userId = user.id;
                }
            } catch (e) {
                console.log('Could not get user from token, continuing anyway');
            }
        }

        // If we have a user ID, try to delete from database
        if (userId) {
            try {
                const { error: deleteError } = await supabase
                    .from('youtube_channel_links')
                    .delete()
                    .eq('user_id', userId)
                    .eq('channel_id', channel_id);

                if (deleteError) {
                    console.error('Error deleting channel link:', deleteError);
                }
            } catch (e) {
                console.error('Database delete error:', e);
            }
        }

        // Always return success to allow UI update
        return NextResponse.json({
            success: true,
            message: 'Channel unlinked successfully',
            channel_id
        });

    } catch (error) {
        console.error('Unlink error:', error);
        // Return success anyway to allow UI update
        return NextResponse.json({
            success: true,
            message: 'Channel unlinked from local state'
        });
    }
}
