import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/config/site';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = SITE_CONFIG.admin.username;
    const validPassword = SITE_CONFIG.admin.password;

    if (username === validUsername && password === validPassword) {
      // Return simple session token or success response
      return NextResponse.json({
        success: true,
        token: `token-${Date.now()}-admin-auth-valid`,
        user: { username: validUsername }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid Admin ID or Password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('API Error POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication request failed' },
      { status: 500 }
    );
  }
}
