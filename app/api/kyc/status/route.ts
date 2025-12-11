import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/kyc/status`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Patient-ID': user.id,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to get KYC status:', error);
    return NextResponse.json({ error: 'Failed to get KYC status' }, { status: 500 });
  }
}
