"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomRugsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/custom-plan");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-jost text-black">
      <div className="text-center">
        <p className="text-lg">Redirecting to Custom Fitness Plans...</p>
      </div>
    </div>
  );
}
