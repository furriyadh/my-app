import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const userInfoCookie = cookieStore.get('oauth_user_info')?.value;

    if (accessToken && userInfoCookie) {
      let userInfo = null;
      try {
        userInfo = JSON.parse(userInfoCookie);
      } catch (e) {
        console.error('Error parsing user info cookie:', e);
        // If user info is corrupted, consider them unauthenticated
        return NextResponse.json({ authenticated: false, message: 'Invalid user info', user: null }, { status: 200 });
      }

      // Optionally, you could add a call to the backend to validate the access token
      // For now, we assume if cookies are present, the user is authenticated
      return NextResponse.json({
        authenticated: true,
        message: 'User is authenticated',
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({ authenticated: false, message: 'No authentication tokens found', user: null }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json({ authenticated: false, message: 'Internal server error', user: null }, { status: 500 });
  }
}
