"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSession();
  const router = useRouter();
  
  const { data, status } = session || { data: null, status: "loading" };

  useEffect(() => {
    if (status === "loading") return;
    
    if (data) {
      router.push("/designer");
    } else {
      router.push("/signin");
    }
  }, [data, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
