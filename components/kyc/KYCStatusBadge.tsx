"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Check, X, Clock } from "lucide-react";

interface KYCStatusBadgeProps {
    status: "not_started" | "pending" | "verified" | "rejected" | "expired";
    variant?: "default" | "compact";
}

export function KYCStatusBadge({ status, variant = "default" }: KYCStatusBadgeProps) {
    const statusConfig = {
        not_started: {
            label: "Not Verified",
            icon: Shield,
            className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        },
        pending: {
            label: "Verification Pending",
            icon: Clock,
            className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        },
        verified: {
            label: "KYC Verified",
            icon: Check,
            className: "bg-green-100 text-green-700 hover:bg-green-100",
        },
        rejected: {
            label: "Verification Rejected",
            icon: X,
            className: "bg-red-100 text-red-700 hover:bg-red-100",
        },
        expired: {
            label: "Verification Expired",
            icon: X,
            className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    if (variant === "compact") {
        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3" />
            </Badge>
        );
    }

    return (
        <Badge className={`${config.className} gap-1.5`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
}
