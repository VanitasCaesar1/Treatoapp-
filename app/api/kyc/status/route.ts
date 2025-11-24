import { withAuth } from "@workos-inc/authkit-nextjs";

export const GET = withAuth(async ({ req }) => {
    try {
        const authID = req.headers.get("X-Auth-ID");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/kyc/status`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Patient-ID": authID || "",
                },
            }
        );

        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error("Failed to get KYC status:", error);
        return Response.json(
            { error: "Failed to get KYC status" },
            { status: 500 }
        );
    }
});
