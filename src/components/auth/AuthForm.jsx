"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Icon } from "@/lib/iconify";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    await signIn("google", { callbackUrl });
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not create account.");
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }

      router.push(result?.url || callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-4xl border border-border-color bg-background p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div className="rounded-[28px] bg-[#0f1f17] p-8 text-white dark:text-black">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60 dark:text-black/60">
            {isSignup ? "Create account" : "Welcome back"}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
            {isSignup
              ? "Join Succulent Hut and save your details for faster checkout."
              : "Sign in to manage your profile, theme, and saved checkout info."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 dark:text-black/70 md:text-base">
            Use Google for the fastest login, or continue with your email and password.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {isSignup ? "Sign up" : "Login"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">
                {isSignup ? "Create your account" : "Sign in to continue"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-border-color bg-background px-5 text-sm font-medium text-foreground transition-all duration-300 hover:border-black dark:hover:border-white hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon icon="mdi:google" className="text-[20px]" />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
            <span className="h-px flex-1 bg-muted" />
            or
            <span className="h-px flex-1 bg-muted" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="h-14 w-full rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />
            )}

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="h-14 w-full rounded-2xl border border-border-color px-4 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="h-14 w-full rounded-2xl border border-border-color px-4 pr-14 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="text-[20px]" />
              </button>
            </div>

            {isSignup && (
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="h-14 w-full rounded-2xl border border-border-color px-4 pr-14 text-sm outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <Icon icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="text-[20px]" />
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-black dark:bg-white px-6 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-medium text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-black"
            >
              {isSignup ? "Login" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
