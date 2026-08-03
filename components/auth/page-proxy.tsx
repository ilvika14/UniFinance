"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PageProxy({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          setAuthorized(true);
        } else {
          const currentPath = window.location.pathname;
          router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
        }
      })
      .catch(() => {
        const currentPath = window.location.pathname;
        router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
      });
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="text-[#6b6860] text-sm">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
