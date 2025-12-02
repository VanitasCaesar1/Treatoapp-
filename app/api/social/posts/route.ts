import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await withAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Forward to social service
    const response = await fetch(
      `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/v1/posts`,
      {
        method: 'POST',
        headers: {
          'X-User-ID': user.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: error.error || 'Failed to create post' 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ 
      error: 'Failed to create post' 
    }, { status: 500 });
  }
}
