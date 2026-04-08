import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthWorkspace } from "@/components/auth/auth-workspace";

export const metadata: Metadata = {
  title: "Sign In | Pet Care",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthWorkspace />
    </Suspense>
  );
}
