"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RugServicesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/nutrition-services");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-jost text-black">
      <div className="text-center">
        <p className="text-lg">Redirecting to Fitness Coaching & Consultations...</p>
      </div>
    </div>
  );
}
