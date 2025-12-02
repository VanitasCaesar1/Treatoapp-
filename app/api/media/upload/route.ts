import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await withAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const contentType = file.type;
    if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) {
      return NextResponse.json({ 
        error: 'Only images and videos are allowed' 
      }, { status: 400 });
    }

    // Check file size (50MB max for videos, 10MB for images)
    const maxSize = contentType.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Forward to gateway media upload endpoint
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/media/upload`,
      {
        method: 'POST',
        headers: {
          'X-User-ID': user.id,
        },
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: error.error || 'Failed to upload media' 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ 
      error: 'Failed to upload media' 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
