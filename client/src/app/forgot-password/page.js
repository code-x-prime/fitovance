"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Mail, ArrowLeft, Loader2, Check } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: "var(--font-roboto)" }}>
      <Toaster position="top-center" richColors />

      {/* ─── Left Panel: Brand Showcase ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-white flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-block" aria-label="FITOVANCE Home">
            <Image
              src="/logo.png"
              alt="FITOVANCE"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h2
            className="text-4xl xl:text-[44px] font-bold text-[#111111] leading-[1.15] mb-5"
            style={{ fontFamily: "var(--font-jost)" }}
          >
            Forgot Your <br /> Password?
          </h2>
          <p
            className="text-[15px] leading-relaxed text-[#666666] mb-10"
            style={{ fontFamily: "var(--font-roboto)" }}
          >
            No worries. Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Secure password reset process",
              "Quick email delivery",
              "Back to training in minutes",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#111111] flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span
                  className="text-sm text-[#111111] font-medium"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Image */}
        <div className="relative w-full h-[180px] rounded-[12px] overflow-hidden bg-[#F5F5F5] mt-8">
          <Image
            src="/auth.png"
            alt="Premium Nutrition Products"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ─── Right Panel: Forgot Password Form ──────────────────────────────── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[460px]">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-block" aria-label="FITOVANCE Home">
              <Image
                src="/logo.png"
                alt="FITOVANCE"
                width={140}
                height={36}
                className="h-9 w-auto mx-auto"
                priority
              />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[32px] font-bold text-[#111111] leading-tight mb-2"
              style={{ fontFamily: "var(--font-jost)" }}
            >
              Reset Password
            </h1>
            <p
              className="text-[15px] text-[#666666]"
              style={{ fontFamily: "var(--font-roboto)" }}
            >
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            /* ─── Success State ──────────────────────────────────────────── */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-[#16A34A]" />
              </div>
              <h2
                className="text-xl font-bold text-[#111111] mb-2"
                style={{ fontFamily: "var(--font-jost)" }}
              >
                Check your inbox
              </h2>
              <p
                className="text-[15px] text-[#666666] mb-8"
                style={{ fontFamily: "var(--font-roboto)" }}
              >
                Reset link sent to <span className="font-semibold text-[#111111]">{email}</span>
              </p>

              <Link
                href="/auth?tab=login"
                className="inline-flex items-center justify-center w-full h-[52px] bg-[#111111] text-white rounded-[8px] text-[15px] font-semibold hover:bg-[#222222] transition-all duration-200 active:scale-[0.98]"
                style={{ fontFamily: "var(--font-jost)" }}
              >
                Back to Sign In
              </Link>

              <p
                className="text-[13px] text-[#666666] mt-6"
                style={{ fontFamily: "var(--font-roboto)" }}
              >
                Didn&apos;t receive the email?{" "}
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-[#111111] font-semibold hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            /* ─── Forgot Password Form ───────────────────────────────────── */
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-medium text-[#111111]"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999999] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full h-[52px] pl-12 pr-4 bg-white text-[#111111] placeholder:text-[#BBBBBB] outline-none transition-all duration-200 text-[15px] border border-[#E5E5E5] focus:border-[#111111] rounded-[8px]"
                    style={{ fontFamily: "var(--font-roboto)" }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full h-[52px] rounded-[8px] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#111111] text-white hover:bg-[#222222] active:bg-[#000000]"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  {submitting || loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4">
                <ArrowLeft className="h-4 w-4 text-[#666666]" />
                <Link
                  href="/auth?tab=login"
                  className="text-[14px] text-[#666666] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "var(--font-roboto)" }}
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Terms */}
          <div className="mt-10 pt-6 border-t border-[#ECECEC] text-center">
            <p className="text-[12px] text-[#999999] leading-relaxed" style={{ fontFamily: "var(--font-roboto)" }}>
              By continuing, you agree to The Fitovance Co.&apos;s{" "}
              <Link href="/terms-conditions" className="text-[#111111] font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-[#111111] font-medium hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
