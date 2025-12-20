
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bucketName = 'chat-images';

        // 1. Ensure bucket exists (Try to create, ignore if exists)
        // With Service Role, we can try to create. 
        // Note: createBucket returns error if exists, which we can ignore.
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
        });

        if (createError && !createError.message.includes('already exists')) {
            console.log("Bucket creation warning (might exist):", createError.message);
        }

        // 2. Upload File
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        // arrayBuffer to Buffer required for Node environment uploads sometimes, 
        // but Supabase JS client handles File objects nicely in standard envs. 
        // In Next.js App Router API routes, we might need to convert.
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase Upload Error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return NextResponse.json({ publicUrl });

    } catch (error: any) {
        console.error('Server Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
