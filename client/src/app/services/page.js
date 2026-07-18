"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/nutrition-services");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto mb-4" />
        <p className="text-black font-jost text-sm tracking-wider">Loading Services...</p>
      </div>
    </div>
  );
}
