import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/following`,
      {
        headers: {
          'X-User-ID': user.id,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch following' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
}
