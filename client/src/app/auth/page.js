"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { AuthRedirect } from "@/components/auth-redirect";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Check } from "lucide-react";
import Image from "next/image";

const TABS = ["login", "register", "verify-otp"];
const NAV_TABS = ["login", "register"];

/* ─── Reusable Components ─────────────────────────────────────────────────── */

function AuthInput({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  required = false,
  error,
  label,
  rightElement,
  "aria-label": ariaLabel,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#111111]" style={{ fontFamily: "var(--font-jost)" }}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999999] pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          aria-label={ariaLabel || (typeof label === "string" ? label : "")}
          className={`w-full h-[52px] bg-white text-[#111111] placeholder:text-[#BBBBBB] outline-none transition-all duration-200 text-[15px]
            ${Icon ? "pl-12" : "pl-4"} ${rightElement ? "pr-12" : "pr-4"}
            border border-[#E5E5E5] focus:border-[#111111]
            ${readOnly ? "bg-[#F9F9F9] cursor-not-allowed text-[#666666]" : ""}
            ${error ? "border-[#DC2626]" : ""}
            rounded-[8px]`}
          style={{ fontFamily: "var(--font-roboto)" }}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#DC2626] mt-1" style={{ fontFamily: "var(--font-roboto)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function AuthButton({ children, loading, disabled, variant = "primary", type = "submit", onClick, className = "" }) {
  const base = "w-full h-[52px] rounded-[8px] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#111111] text-white hover:bg-[#222222] active:bg-[#000000]",
    secondary: "bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F5F5F5]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ fontFamily: "var(--font-jost)" }}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
    </button>
  );
}

function PasswordToggle({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 text-[#999999] hover:text-[#111111] transition-colors"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}

/* ─── Main Auth Page ──────────────────────────────────────────────────────── */

export default function AuthPage() {
  const searchParams = useSearchParams();
  const { login, register, verifyOtp, resendVerification } = useAuth();

  const queryTab = (searchParams.get("tab") || "login").toLowerCase();
  const initialTab = TABS.includes(queryTab) ? queryTab : "login";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [enabledOAuthProviders, setEnabledOAuthProviders] = useState([]);

  useEffect(() => {
    const fetchOAuthProviders = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${base}/public/oauth-providers`, { credentials: "include" });
        const data = await res.json();
        if (data?.success && Array.isArray(data?.data?.providers)) {
          setEnabledOAuthProviders(data.data.providers);
        }
      } catch (_) {
        setEnabledOAuthProviders([]);
      }
    };
    fetchOAuthProviders();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    const email = searchParams.get("email");
    if (email) params.set("email", email);
    const href = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", href);
  }, [activeTab, searchParams]);

  const emailFromQuery = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [pendingEmail, setPendingEmail] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem("pendingEmail") || localStorage.getItem("registeredEmail") || "";
    const chosen = emailFromQuery || stored;
    if (chosen) setPendingEmail(chosen);
  }, [emailFromQuery]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((x) => x - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Email and password are required");
      return;
    }
    setLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      sessionStorage.setItem("justLoggedIn", "true");
      const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");
      setTimeout(() => {
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : "/";
      }, 300);
    } catch (err) {
      const msg = err.message || "Login failed";
      if (msg.toLowerCase().includes("verify")) {
        toast.error("Please verify with OTP first");
        setActiveTab("verify-otp");
        if (loginEmail) {
          localStorage.setItem("pendingEmail", loginEmail);
          setPendingEmail(loginEmail);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  const isPasswordValid = () =>
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /\d/.test(form.password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(form.password) &&
    form.password === form.confirmPassword &&
    form.name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const validateRegister = () => {
    if (form.name.trim().length < 3) return toast.error("Name should be at least 3 characters"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Enter a valid email"), false;
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters long"), false;
    if (!/[A-Z]/.test(form.password)) return toast.error("Password must contain at least one uppercase letter"), false;
    if (!/[a-z]/.test(form.password)) return toast.error("Password must contain at least one lowercase letter"), false;
    if (!/\d/.test(form.password)) return toast.error("Password must contain at least one number"), false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) return toast.error("Password must contain at least one special character"), false;
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match"), false;
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setRegisterSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        referralCode: form.referralCode?.trim() || undefined,
      });
      localStorage.setItem("pendingEmail", form.email);
      toast.success("Account created. Enter the OTP sent to your email.");
      setActiveTab("verify-otp");
      setPendingEmail(form.email);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const otpString = otp.join("");
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pendingEmail) return toast.error("Email required");
    if (!/^\d{6}$/.test(otpString)) return toast.error("Enter 6-digit OTP");
    setVerifySubmitting(true);
    try {
      await verifyOtp(pendingEmail, otpString);
      toast.success("Email verified and logged in successfully!");
      const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");
      setTimeout(() => {
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : "/";
      }, 500);
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return toast.error("Enter your email to resend OTP");
    try {
      await resendVerification(pendingEmail);
      toast.success("OTP sent to your email");
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    otpInputRefs.current[focusIndex]?.focus();
  };

  const handleOAuthLogin = (provider) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
    const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/";
    window.location.href = `${base}/auth/${provider}?redirect=${encodeURIComponent(returnUrl)}`;
  };

  const passwordChecks = [
    [form.password.length >= 8, "8+ characters"],
    [/[A-Z]/.test(form.password), "One uppercase"],
    [/[a-z]/.test(form.password), "One lowercase"],
    [/\d/.test(form.password), "One number"],
    [/[!@#$%^&*(),.?":{}|<>]/.test(form.password), "One special char"],
  ];

  return (
    <AuthRedirect>
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
              Fuel Your <br /> Performance.
            </h2>
            <p
              className="text-[15px] leading-relaxed text-[#666666] mb-10"
              style={{ fontFamily: "var(--font-roboto)" }}
            >
              Premium Sports Nutrition designed for athletes, fitness enthusiasts, and everyday champions.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                "High Quality Ingredients",
                "Lab Tested Formulas",
                "Fast Nationwide Delivery",
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

        {/* ─── Right Panel: Auth Form ────────────────────────────────────────── */}
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
                {activeTab === "login" && "Welcome Back"}
                {activeTab === "register" && "Create an Account"}
                {activeTab === "verify-otp" && "Verify Your Email"}
              </h1>
              <p
                className="text-[15px] text-[#666666]"
                style={{ fontFamily: "var(--font-roboto)" }}
              >
                {activeTab === "login" && "Enter your details below to sign in to your account."}
                {activeTab === "register" && "Join us to save your favorite products and track your orders."}
                {activeTab === "verify-otp" && "We've sent a 6-digit code to your email."}
              </p>
            </div>

            {/* Tab Switcher */}
            {activeTab !== "verify-otp" && (
              <div className="flex border border-[#E5E5E5] p-1 rounded-[8px] mb-8 bg-[#F9F9F9]">
                {NAV_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 h-[42px] rounded-[6px] text-[14px] font-semibold transition-all duration-200
                      ${activeTab === tab
                        ? "bg-[#111111] text-white shadow-sm"
                        : "text-[#666666] hover:text-[#111111]"
                      }`}
                    style={{ fontFamily: "var(--font-jost)" }}
                  >
                    {tab === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            {/* OAuth */}
            {enabledOAuthProviders.length > 0 && activeTab !== "verify-otp" && (
              <div className="mb-8 space-y-3">
                {enabledOAuthProviders.map((p) => (
                  <AuthButton
                    key={p}
                    type="button"
                    variant="secondary"
                    onClick={() => handleOAuthLogin(p)}
                  >
                    {p === "google" && (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </>
                    )}
                    {p === "facebook" && (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                      </>
                    )}
                    {p === "twitter" && (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Continue with Twitter
                      </>
                    )}
                  </AuthButton>
                ))}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E5]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span
                      className="bg-white px-4 text-[12px] uppercase tracking-[0.15em] text-[#999999]"
                      style={{ fontFamily: "var(--font-jost)" }}
                    >
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Login Form ──────────────────────────────────────────────── */}
            {activeTab === "login" && (
              <form className="space-y-5" onSubmit={handleLogin}>
                <AuthInput
                  icon={Mail}
                  type="email"
                  label="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-[#111111]" style={{ fontFamily: "var(--font-jost)" }}>
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[13px] text-[#666666] hover:text-[#111111] transition-colors"
                      style={{ fontFamily: "var(--font-roboto)" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <AuthInput
                    icon={Lock}
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    rightElement={
                      <PasswordToggle
                        show={showLoginPassword}
                        onClick={() => setShowLoginPassword((s) => !s)}
                      />
                    }
                  />
                </div>

                <div className="pt-2">
                  <AuthButton loading={loginSubmitting}>
                    Sign In
                  </AuthButton>
                </div>

                <p
                  className="text-center text-[14px] text-[#666666] pt-2"
                  style={{ fontFamily: "var(--font-roboto)" }}
                >
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-[#111111] font-semibold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}

            {/* ─── Register Form ───────────────────────────────────────────── */}
            {activeTab === "register" && (
              <form className="space-y-4" onSubmit={handleRegister}>
                <AuthInput
                  icon={User}
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />

                <AuthInput
                  icon={Mail}
                  type="email"
                  label="Email Address"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />

                <AuthInput
                  icon={Phone}
                  type="tel"
                  label={<>Phone <span className="text-[#999999] font-normal">(Optional)</span></>}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />

                <div>
                  <AuthInput
                    icon={Lock}
                    type={showRegisterPassword ? "text" : "password"}
                    label="Password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Create a password"
                    required
                    rightElement={
                      <PasswordToggle
                        show={showRegisterPassword}
                        onClick={() => setShowRegisterPassword((s) => !s)}
                      />
                    }
                  />

                  {form.password.length > 0 && (
                    <div className="mt-3 p-3 bg-[#F9F9F9] rounded-[8px] border border-[#ECECEC]">
                      <p
                        className="text-[11px] font-semibold text-[#666666] mb-2 uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-jost)" }}
                      >
                        Password must contain:
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {passwordChecks.map(([ok, label], i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-[12px] ${ok ? "text-[#16A34A]" : "text-[#999999]"}`}
                            style={{ fontFamily: "var(--font-roboto)" }}
                          >
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${ok ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#E5E5E5] text-[#999999]"}`}>
                              {ok ? "✓" : ""}
                            </div>
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <AuthInput
                    icon={Lock}
                    type={showRegisterPassword ? "text" : "password"}
                    label="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    required
                  />
                  {form.confirmPassword && (
                    <p
                      className={`mt-1.5 text-[12px] font-medium flex items-center gap-1 ${form.password === form.confirmPassword ? "text-[#16A34A]" : "text-[#DC2626]"}`}
                      style={{ fontFamily: "var(--font-roboto)" }}
                    >
                      {form.password === form.confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <AuthButton loading={registerSubmitting} disabled={!isPasswordValid()}>
                    Create Account
                  </AuthButton>
                </div>

                <p
                  className="text-center text-[14px] text-[#666666] pt-2"
                  style={{ fontFamily: "var(--font-roboto)" }}
                >
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-[#111111] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* ─── OTP Verification Form ──────────────────────────────────── */}
            {activeTab === "verify-otp" && (
              <form className="space-y-6" onSubmit={handleVerify}>
                <AuthInput
                  icon={Mail}
                  type="email"
                  label="Email Address"
                  value={pendingEmail}
                  onChange={(e) => setPendingEmail(e.target.value)}
                  placeholder="you@example.com"
                  readOnly
                />

                <div>
                  <label
                    className="block text-sm font-medium text-[#111111] mb-3 text-center"
                    style={{ fontFamily: "var(--font-jost)" }}
                  >
                    Enter 6-digit verification code
                  </label>
                  <div
                    className="flex gap-3 justify-center"
                    onPaste={handleOtpPaste}
                  >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        ref={(el) => (otpInputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i]}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        aria-label={`OTP digit ${i + 1}`}
                        className="w-[48px] h-[56px] sm:w-[52px] sm:h-[60px] text-center text-xl font-bold bg-white border border-[#E5E5E5] rounded-[8px] outline-none transition-all duration-200 focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 text-[#111111]"
                        style={{ fontFamily: "var(--font-jost)" }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-center text-[12px] text-[#999999] mt-3"
                    style={{ fontFamily: "var(--font-roboto)" }}
                  >
                    Check your inbox for the verification code
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <AuthButton loading={verifySubmitting}>
                    Verify & Continue
                  </AuthButton>

                  <AuthButton
                    type="button"
                    variant="secondary"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    loading={false}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                  </AuthButton>
                </div>

                <p
                  className="text-center text-[14px] text-[#666666]"
                  style={{ fontFamily: "var(--font-roboto)" }}
                >
                  Entered wrong email?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-[#111111] font-semibold hover:underline"
                  >
                    Go back to sign up
                  </button>
                </p>
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
    </AuthRedirect>
  );
}
