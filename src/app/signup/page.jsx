import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
