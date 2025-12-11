import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/roles`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      console.error('Failed to fetch roles:', response.status);
      return NextResponse.json({ roles: ['patient'] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json({ roles: ['patient'] }, { status: 200 });
  }
}
