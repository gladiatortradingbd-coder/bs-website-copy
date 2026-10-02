"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Icon } from "@/lib/iconify";

async function updateTheme(theme) {
  await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
  localStorage.setItem("succulent-hut-theme", theme);
}

export default function UserMenu({ menuPosition = "down", compact = false }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="h-11 w-11 rounded-full border border-border-color bg-muted" />
    );
  }

  if (!user) {
    return null;
  }

  const initials = (user.fullName || user.name || user.email || "U")
    .slice(0, 1)
    .toUpperCase();

  const handleLogout = async () => {
    const confirmed = window.confirm("Log out from your account?");

    if (!confirmed) {
      return;
    }

    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/profile", { method: "DELETE" });

    if (!response.ok) {
      window.alert("Could not delete the account.");
      return;
    }

    setOpen(false);
    window.alert("Account deleted successfully.");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center justify-center overflow-hidden rounded-full border border-border-color bg-background text-sm font-semibold text-foreground transition-all duration-300 hover:border-black dark:hover:border-white hover:shadow-md ${compact ? "h-9 w-9" : "h-11 w-11"}`}
        aria-label="User profile icon"
        aria-expanded={open}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.fullName || user.name || "User"}
            width={compact ? 36 : 44}
            height={compact ? 36 : 44}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className={`z-50 rounded-3xl border border-border-color bg-background p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] ${menuPosition === "mobile" ? "fixed left-1/2 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] w-[min(88vw,300px)] -translate-x-1/2" : `absolute right-0 w-[320px] ${menuPosition === "up" ? "bottom-14" : "top-14"}`}`}
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-foreground">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.fullName || user.name || "User"}
                  width={compact ? 28 : 35}
                  height={compact ? 28 : 35}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.fullName || user.name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-border-color px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-muted"
            >
              Profile settings
              <Icon icon="mdi:chevron-right" className="text-[18px] text-neutral-400" />
            </Link>

            <div className="rounded-2xl border border-border-color p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Theme
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateTheme("white")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${user.theme === "white" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-muted text-foreground hover:bg-muted"}`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => updateTheme("black")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${user.theme === "black" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-muted text-foreground hover:bg-muted"}`}
                >
                  Black
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl border border-border-color px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-muted"
            >
              Logout
              <Icon icon="mdi:logout" className="text-[18px] text-neutral-400" />
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Delete account
              <Icon icon="mdi:trash-can-outline" className="text-[18px] text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
