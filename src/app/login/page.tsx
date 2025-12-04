"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/common/auth-form";
import { signIn } from "@/lib/auth-client";
import { message } from "@/lib/constraint";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/profile",
      });

      if (result.error) {
        setError(result.error.message || message.login.error);
        setIsLoading(false);
        return;
      }

      // Success - redirect will be handled by Better Auth
      router.push("/profile");
    } catch (err: any) {
      setError(err?.message || message.login.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}
