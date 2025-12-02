import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
    try {
        const { accessToken } = await withAuth({ ensureSignedIn: true });

        if (!accessToken) {
            console.error('No access token available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const url = new URL(req.url);
        const query = url.searchParams.get("q");
        const location = url.searchParams.get("location");
        const lat = url.searchParams.get("lat");
        const lng = url.searchParams.get("lng");
        const radius = url.searchParams.get("radius") || "10"; // km
        const limit = url.searchParams.get("limit") || "20";
        const offset = url.searchParams.get("offset") || "0";

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (query) queryParams.append("q", query);
        if (location) queryParams.append("location", location);
        if (lat && lng) {
            queryParams.append("lat", lat);
            queryParams.append("lng", lng);
            queryParams.append("radius", radius);
        }
        queryParams.append("limit", limit);
        queryParams.append("offset", offset);

        // Forward the request to the backend
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hospitals/search?${queryParams.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('Hospital search failed:', response.status, response.statusText);
            return NextResponse.json({
                error: 'Failed to search hospitals',
                hospitals: [], // Return empty array on error
                total: 0,
                count: 0
            }, { status: response.status });
        }

        const data = await response.json();

        // Log the raw response for debugging
        console.log('=== HOSPITAL SEARCH API RESPONSE ===');
        console.log('Full response:', JSON.stringify(data, null, 2));
        if (data.hospitals && Array.isArray(data.hospitals)) {
            console.log('Number of hospitals:', data.hospitals.length);
        }
        console.log('===================================');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error searching hospitals:', error);
        return NextResponse.json(
            {
                error: 'Failed to search hospitals',
                hospitals: [],
                total: 0,
                count: 0
            },
            { status: 500 }
        );
    }
}
