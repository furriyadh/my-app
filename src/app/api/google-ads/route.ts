// src/app/api/google-ads/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تهيئة عميل Supabase (تأكد من أن هذه المتغيرات متاحة في بيئة Next.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // استخدام ! لتأكيد أنها لن تكون null

export async function POST(request: Request) {
  try {
    const { loginCustomerId } = await request.json();

    if (!loginCustomerId) {
      return NextResponse.json({ error: 'Missing loginCustomerId in request body' }, { status: 400 });
    }

    // استدعاء وظيفة Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('google-ads-data', {
      body: { loginCustomerId },
    });

    if (error) {
      console.error('Error invoking Supabase function:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
