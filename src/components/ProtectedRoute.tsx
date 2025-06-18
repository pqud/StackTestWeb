"use client"

import { useAuth  } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function ProtectedRoute({children}: {children: React.ReactNode}){
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return <div>로딩 중...</div>;
    }

    return <>{children}</>;
    
}