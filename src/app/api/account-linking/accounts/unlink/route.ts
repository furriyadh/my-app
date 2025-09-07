import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }

    // Remove from localStorage (this will be handled on the client side)
    // For now, just return success
    console.log('Unlinking account:', { customerId });

    return NextResponse.json({
      success: true,
      message: 'Account unlinked successfully',
      data: {
        customerId
      }
    });

  } catch (error) {
    console.error('Error unlinking account:', error);
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
