import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, accountName } = body;

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }

    // Store in localStorage (this will be handled on the client side)
    // For now, just return success
    console.log('Linking account:', { customerId, accountName });

    return NextResponse.json({
      success: true,
      message: 'Account linked successfully',
      data: {
        customerId,
        accountName
      }
    });

  } catch (error) {
    console.error('Error linking account:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}
