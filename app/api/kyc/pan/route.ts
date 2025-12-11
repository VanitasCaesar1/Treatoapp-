import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/kyc/pan/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Patient-ID': user.id,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to upload PAN:', error);
    return NextResponse.json({ error: 'Failed to upload PAN' }, { status: 500 });
  }
}
