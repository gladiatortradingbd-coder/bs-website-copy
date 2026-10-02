"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User, Mail, Phone, Map, MapPin, Building, Hash,
  Settings, LogOut, Trash2, Save, Lock, Sun, Moon, Palette
} from "lucide-react";

const themeOptions = [
  { label: "Light Mode", value: "white", icon: Sun },
  { label: "Dark Mode", value: "black", icon: Moon },
];

const regionOptions = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet"
];

export default function ProfileSettingsForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: user.fullName || user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    region: user.region || "",
    address: user.address || "",
    city: user.city || "",
    postalCode: user.postalCode || "",
    theme: user.theme || "white",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const persistTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "black" ? "dark" : "light";
    localStorage.setItem("succulent-hut-theme", theme);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save the profile.");
      }

      persistTheme(form.theme);
      setMessage("Profile saved successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
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

    window.alert("Account deleted successfully.");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <form onSubmit={handleSave} className="w-full space-y-6 overflow-hidden rounded-[32px] border border-border-color/75 bg-background p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-7 md:p-9 font-body">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-[24px] bg-muted text-lg font-semibold text-foreground border-2 border-white dark:border-black shadow-md">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.fullName || user.name || "User"}
              width={80}
              height={80}
              className="h-full w-full object-cover animate-fade-in"
            />
          ) : (
            <User className="h-8 w-8 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl font-display">Profile Settings</h1>
            {user?.role === "admin" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 sm:px-3 sm:text-xs">
                <Settings className="h-3 w-3 animate-spin-[20s_linear_infinite]" />
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Save your details once and checkout faster later.</p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <div className="space-y-4 rounded-[24px] border border-neutral-100 bg-muted/50 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-4 w-4" />
            Account Information
          </h2>
          
          <div className="space-y-3.5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <User className="h-5 w-5" />
              </span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
                className="h-14 w-full rounded-2xl border border-border-color bg-background pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                name="email"
                value={form.email}
                disabled
                className="h-14 w-full rounded-2xl border border-border-color bg-muted pl-12 pr-10 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="h-4 w-4" />
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="h-14 w-full rounded-2xl border border-border-color bg-background pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="space-y-4 rounded-[24px] border border-neutral-100 bg-muted/50 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Default Shipping Address
          </h2>

          <div className="space-y-3.5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Map className="h-5 w-5" />
              </span>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="h-14 w-full appearance-none rounded-2xl border border-border-color bg-background pl-12 pr-10 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              >
                <option value="">Select Region</option>
                {regionOptions.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-500" />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Building className="h-5 w-5" />
                </span>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="h-14 w-full rounded-2xl border border-border-color bg-background pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Hash className="h-5 w-5" />
                </span>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                  className="h-14 w-full rounded-2xl border border-border-color bg-background pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-4 text-neutral-400">
                <MapPin className="h-5 w-5" />
              </span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Full address (House, street, road, area)"
                rows={3}
                className="w-full rounded-2xl border border-border-color bg-background py-3 pl-12 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preference section */}
      <div className="rounded-[24px] border border-neutral-100 bg-muted/50 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Palette className="h-4 w-4" />
          Preferences
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = form.theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm((current) => ({ ...current, theme: option.value }))}
                className={`flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all duration-200 ${isSelected ? "border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/10" : "border-border-color bg-background text-foreground hover:border-black dark:hover:border-white hover:bg-muted"}`}
              >
                <OptionIcon className={`h-5 w-5 ${isSelected ? "text-emerald-600" : "text-muted-foreground"}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${message.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          <div className="flex-1 font-medium">
            {message}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between border-t border-neutral-100">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white dark:text-black shadow-md shadow-emerald-500/10 transition-all duration-300 hover:bg-emerald-700 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4.5 w-4.5" />
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border-color bg-background px-6 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-neutral-800 hover:bg-muted sm:w-auto"
            >
              <Settings className="h-4.5 w-4.5" />
              Admin Panel
            </Link>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border-color bg-background px-6 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-neutral-800 hover:bg-muted sm:w-auto"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-6 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-50 hover:border-red-200 sm:w-auto"
        >
          <Trash2 className="h-4.5 w-4.5" />
          Delete Account
        </button>
      </div>
    </form>
  );
}
