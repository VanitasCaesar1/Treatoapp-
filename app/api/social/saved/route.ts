import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const specialty = url.searchParams.get("specialty");

    const params = new URLSearchParams();
    if (specialty) params.append('specialty', specialty);

    const response = await fetch(
      `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/saved?${params.toString()}`,
      {
        headers: {
          'X-User-ID': user.id,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
  }
}
