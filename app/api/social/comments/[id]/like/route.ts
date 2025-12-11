import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

// POST /api/social/comments/[id]/like - Like a comment
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commentId = params.id;

    const response = await fetch(
      `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/comments/${commentId}/like`,
      {
        method: 'POST',
        headers: {
          'X-User-ID': user.id,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to like comment' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error liking comment:', error);
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
  }
}

// DELETE /api/social/comments/[id]/like - Unlike a comment
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commentId = params.id;

    const response = await fetch(
      `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/comments/${commentId}/like`,
      {
        method: 'DELETE',
        headers: {
          'X-User-ID': user.id,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to unlike comment' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error unliking comment:', error);
    return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 });
  }
}
