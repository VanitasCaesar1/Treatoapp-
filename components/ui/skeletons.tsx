export function PostGridSkeleton({ count = 9 }: { count?: number }) {
    return (
        <div className="grid grid-cols-3 gap-1">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className="aspect-square bg-gray-200 animate-pulse"
                />
            ))}
        </div>
    );
}

export function FeedPostSkeleton() {
    return (
        <div className="bg-white border-b border-gray-200 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
            </div>

            {/* Media */}
            <div className="w-full aspect-square bg-gray-200" />

            {/* Actions */}
            <div className="px-4 py-3">
                <div className="flex gap-4 mb-3">
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
        </div>
    );
}

export function ChatListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="divide-y">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-48 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function UserListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="divide-y">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-9 w-20 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}

export function DoctorProfileSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header */}
            <div className="bg-white border-b p-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-20 w-20 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                        <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="text-center">
                            <div className="h-5 w-12 bg-gray-200 rounded mb-1 mx-auto" />
                            <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Card */}
            <div className="bg-white p-4 border-b">
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
            </div>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="flex gap-8 px-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 w-20 bg-gray-200 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AnalyticsCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
    );
}
