/**
 * Phi Sigma Kappa AI Tutor Platform
 * Copyright (c) 2026 Phi Sigma Kappa Fraternity. Powered by JIE Mastery.ai.
 * All Rights Reserved.
 */
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle, Menu } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import pskShield from "@/assets/psk-shield.png";

const CARDINAL = "#B71234";
const CARDINAL_DARK = "#8B0E27";
const CHARCOAL = "#1A1A1A";
const CREAM = "#FAF7F2";
const SILVER = "#C0C0C0";
const MUTED = "#646569";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Open Sans', system-ui, sans-serif";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  accountName: z.string().min(1, "Your name is required"),
  studentName: z.string().min(1, "Brother name is required"),
  studentAge: z.coerce.number().min(16, "Must be at least 16").max(99, "Please enter a valid age"),
  gradeLevel: z.literal("college-adult"),
  primarySubject: z.literal("general"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  plan: z.literal("elite"),
  marketingOptIn: z.boolean().default(false),
  accessCode: z.string().min(1, "Access code is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  // Registration is disabled by default. Brothers are provisioned by their chapter or HQ admin.
  const REGISTRATION_ENABLED = false;
  const [resendCooldown, setResendCooldown] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchParams = new URLSearchParams(searchString);
  const verificationStatus = searchParams.get("verified");
  const actionParam = searchParams.get("action");

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (actionParam === "register" && REGISTRATION_ENABLED) setActiveTab("register");
  }, [actionParam]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/resend-verification", { email });
      return res.json();
    },
    onSuccess: () => {
      setResendCooldown(60);
      toast({ title: "Verification email sent", description: "Check your inbox." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not resend.", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (user) {
      const WHITELIST = ["/tutor", "/academic-dashboard", "/settings"];
      const savedRedirect = sessionStorage.getItem("jie_redirect_after_login");
      sessionStorage.removeItem("jie_redirect_after_login");

      if ((user as any).isAdmin) {
        setLocation("/admin");
      } else if (savedRedirect && WHITELIST.includes(savedRedirect)) {
        setLocation(savedRedirect);
      } else {
        setLocation("/tutor");
      }
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountName: "", studentName: "", studentAge: 20,
      gradeLevel: "college-adult", primarySubject: "general",
      email: "", password: "", plan: "elite", marketingOptIn: false,
      accessCode: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      setUnverifiedEmail(null);
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      if (error.requiresVerification && error.email) {
        setUnverifiedEmail(error.email);
      } else if (error.message?.includes("verify")) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(data.email)) setUnverifiedEmail(data.email);
      }
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error: any) {
      // handled by mutation
    }
  };

  if (user) return null;

  const navItems = [
    { label: "About", path: "/about-lsis" },
    { label: "Features", path: "/features" },
    { label: "Test Prep", path: "/features#test-prep" },
    { label: "Best Practices", path: "/best-practices" },
    { label: "Support", path: "/support" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF", fontFamily: FONT_BODY, color: CHARCOAL }}>
      {/* Cardinal top bar */}
      <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 4, background: CARDINAL }} />

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          padding: "8px 16px",
        }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={pskShield} alt="Phi Sigma Kappa Fraternity" className="h-12 md:h-16 object-contain flex-shrink-0" />
            <div className="hidden sm:block" style={{ borderLeft: `1px solid ${SILVER}`, paddingLeft: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color: CHARCOAL, lineHeight: 1.1 }}>Phi Sigma Kappa</div>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>The Cardinal Tutor</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  const [basePath, hash] = item.path.split("#");
                  setLocation(basePath);
                  if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 500);
                }}
                style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 14, fontWeight: 500,
                  color: MUTED, background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: FONT_BODY, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = CARDINAL; e.currentTarget.style.background = "rgba(183,18,52,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={() => { setActiveTab("login"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-white font-semibold px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm"
              style={{ background: CARDINAL }}>
              Sign In
            </Button>
            <button className="lg:hidden p-2 rounded-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              <Menu className="w-5 h-5" style={{ color: CHARCOAL }} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t pt-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  const [basePath, hash] = item.path.split("#");
                  setLocation(basePath);
                  if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 500);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium"
                style={{ color: CHARCOAL, borderBottom: "1px solid rgba(0,0,0,0.04)" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Verification banner */}
      {verificationStatus === "success" && (
        <div className="fixed top-16 left-0 right-0 z-40 px-4">
          <div className="max-w-xl mx-auto p-3 rounded-lg shadow-lg" style={{ background: "#E8F5E9", border: "1px solid #28A745" }}>
            <p className="text-sm font-semibold" style={{ color: "#1B5E20" }}>Email verified! You can now sign in.</p>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative" style={{ paddingTop: 120, paddingBottom: 80, background: `linear-gradient(180deg, #FFFFFF 0%, ${CREAM} 100%)` }}>
        <div className="max-w-6xl mx-auto px-4 md:px-12">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(183,18,52,0.08)", border: `1px solid rgba(183,18,52,0.2)` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 2 }}>
                Phi Sigma Kappa · Founded 1873 · A Family of Leaders
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div style={{ animation: "fadeInUp 0.8s ease" }}>
              <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(36px, 5.5vw, 60px)", fontWeight: 700, lineHeight: 1.08, color: CHARCOAL, marginBottom: 20, letterSpacing: -0.5 }}>
                Scholarship, Brotherhood, Excellence —{" "}
                <span style={{ color: CARDINAL }}>Now With a Voice.</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: CHARCOAL, marginBottom: 28, maxWidth: 560, fontWeight: 400 }}>
                Phi Sigma Kappa Brothers gain access to AI-powered Socratic tutoring built for college and graduate scholarship.
                Built on the Cardinal Principle of lifelong learning — and on the conviction that excellence is something you
                practice, not something you wait for.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button onClick={() => { setActiveTab(REGISTRATION_ENABLED ? "register" : "login"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="text-white font-semibold px-7 py-3 rounded-lg text-base flex items-center justify-center gap-2"
                  style={{ background: CARDINAL, boxShadow: "0 4px 20px rgba(183,18,52,0.3)", fontFamily: FONT_BODY }}>
                  Begin the Cardinal Journey <ArrowRight className="w-4 h-4" />
                </Button>
                <a href="https://phisigmakappa.org/join/locate-chapter" target="_blank" rel="noopener noreferrer"
                  className="font-semibold px-7 py-3 rounded-lg text-base flex items-center justify-center"
                  style={{ border: `1.5px solid ${CARDINAL}`, color: CARDINAL, background: "transparent", fontFamily: FONT_BODY, textDecoration: "none" }}>
                  Locate Your Chapter
                </a>
              </div>

              <div className="flex items-center gap-5 flex-wrap" style={{ fontSize: 13, color: MUTED, fontFamily: FONT_BODY }}>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: CARDINAL }} /> Voice tutoring · 25 languages</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: CARDINAL }} /> Coursework, GRE, GMAT, LSAT, MCAT</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: CARDINAL }} /> Brothers across every chapter</span>
              </div>
            </div>

            {/* Hero shield card */}
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-md">
                <div className="rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${CARDINAL} 0%, ${CARDINAL_DARK} 100%)`,
                    border: "6px solid white",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
                    aspectRatio: "1 / 1",
                    padding: 48,
                    transform: "rotate(-0.6deg) scale(1.025)",
                  }}>
                  <img src={pskShield} alt="Phi Sigma Kappa Fraternity Shield" className="w-full h-auto object-contain" style={{ filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.25))" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT — Cardinal Principles */}
      <section className="py-16 md:py-24 px-4 md:px-12" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 12, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              By These Things, I Stand
            </p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: CHARCOAL, lineHeight: 1.15, marginBottom: 16 }}>
              Built on the Cardinal Principles
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 640, margin: "0 auto", lineHeight: 1.65 }}>
              The Fraternity has stood for three principles since 1873. The platform is shaped to each.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                label: "To Promote Brotherhood",
                body: "Brothers across every chapter share access to the same standard of tutoring. From Alpha to Omega, the same Socratic discipline, the same pursuit of excellence — wherever you study, you study with the Fraternity behind you.",
              },
              {
                label: "To Stimulate Scholarship",
                body: "Twenty-five languages. Voice tutoring in real time. GRE, GMAT, LSAT, MCAT preparation. Coursework support across the humanities and sciences. The kind of scholarly support that matches the rigor Phi Sig has demanded since 1873.",
              },
              {
                label: "To Develop Character",
                body: "Real learning is Socratic — questions over answers, judgment over recall. Our tutor doesn't hand you the solution; it walks you to it. The kind of intellectual discipline that produces men of wisdom, prepared to make positive contributions to society.",
              },
            ].map((p, i) => (
              <div key={i} className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: CREAM, border: `1px solid rgba(183,18,52,0.10)` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 14 }}>{p.label}</p>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: CHARCOAL }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 px-4 md:px-12" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 12, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              Meet Challenges with Innovation
            </p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: CHARCOAL, lineHeight: 1.15, marginBottom: 16 }}>
              How the Cardinal Tutor Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "I", title: "Sign in as a Brother.", body: "Verify your chapter affiliation. Your account is provisioned by your House or by Fraternity HQ." },
              { n: "II", title: "Speak with your tutor.", body: "Voice-first, in real time, in any of 25 languages. The tutor listens, asks, and walks you through the work." },
              { n: "III", title: "Pursue scholarship.", body: "With discipline, with depth, and with the Brotherhood standing behind every conversation. The Cardinal Principles, in practice." },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-8" style={{ background: "#FFFFFF", border: `1px solid ${SILVER}33` }}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: CARDINAL, fontWeight: 700, lineHeight: 1 }}>{s.n}</span>
                  <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: CHARCOAL, lineHeight: 1.2 }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-24 px-4 md:px-12" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: 12, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
              From the Brothers
            </p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: CHARCOAL, lineHeight: 1.15 }}>
              Worthy of the Creed
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { quote: "By these things, I stand — and now I study.", attrib: "Brother, Beta Chapter" },
              { quote: "It taught me to think, not to memorize. The Cardinal Principles, in practice.", attrib: "Brother, Pi Chapter" },
            ].map((t, i) => (
              <figure key={i} className="rounded-2xl p-10" style={{ background: CREAM, borderLeft: `4px solid ${CARDINAL}` }}>
                <blockquote style={{ fontFamily: FONT_DISPLAY, fontSize: 22, lineHeight: 1.4, color: CHARCOAL, fontStyle: "italic", marginBottom: 16, fontWeight: 400 }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption style={{ fontSize: 13, color: CARDINAL_DARK, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                  — {t.attrib}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 md:py-24 px-4 md:px-12" style={{ background: CREAM }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ fontSize: 12, fontWeight: 700, color: CARDINAL, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
            Demand Excellence
          </p>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: CHARCOAL, lineHeight: 1.15, marginBottom: 16 }}>
            Pricing Worthy of the Brotherhood
          </h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Per-Brother access with the same standard of voice tutoring offered nowhere else.
            Chapters subscribing ten or more Brothers receive preferred chapter pricing —
            contact your House to learn more.
          </p>
          <div className="rounded-2xl p-10 max-w-md mx-auto" style={{ background: "#FFFFFF", border: `1px solid ${SILVER}55`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: CARDINAL, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Brother Access</p>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: CHARCOAL, marginBottom: 8 }}>Coordinated through your Chapter</p>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
              Access codes are issued by chapter leadership or Fraternity HQ. New Brothers receive their code at initiation; alumni Brothers may request access through their chapter.
            </p>
            <Button
              onClick={() => document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })}
              className="text-white font-semibold px-7 py-3 rounded-lg text-base flex items-center justify-center gap-2 mx-auto"
              style={{ background: CARDINAL, fontFamily: FONT_BODY }}>
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* AUTH FORM */}
      <section id="auth-section" className="py-16 md:py-24 px-4 md:px-12" style={{ background: "#FFFFFF" }}>
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl" style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="relative p-8 md:p-16 flex flex-col justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${CARDINAL} 0%, ${CARDINAL_DARK} 100%)` }}>
            <div className="absolute inset-0 opacity-[0.10] pointer-events-none flex items-center justify-center">
              <img src={pskShield} alt="" className="w-3/4 h-auto" />
            </div>
            <div className="relative z-10">
              <div className="mb-6 md:mb-10" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14, color: "white", letterSpacing: 3, textTransform: "uppercase" }}>
                Phi Sigma Kappa Fraternity
              </div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 16 }}>
                Welcome, Brother.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.88)", lineHeight: 1.7, maxWidth: 360 }}>
                Sign in to begin a session. The Cardinal Tutor is ready when you are — voice-first, Socratic, and waiting on your work.
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 24, fontStyle: "italic", fontFamily: FONT_DISPLAY }}>
                Commit to lifelong learning. Value brotherhood above self.
              </p>
            </div>
          </div>
          <div className="p-6 md:p-14 flex flex-col justify-center" style={{ background: "white" }}>
            {verificationStatus === "success" && (
              <div className="mb-6 p-4 rounded-lg" style={{ background: "#E8F5E9", border: "1px solid #28A745" }}>
                <p className="text-sm font-semibold" style={{ color: "#1B5E20" }}>Email verified. You may now sign in.</p>
              </div>
            )}
            {REGISTRATION_ENABLED ? (
              <div className="flex mb-6 md:mb-8 rounded-lg p-1" style={{ background: "#F3F3F3" }}>
                {(["login", "register"] as const).map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); loginForm.reset(); registerForm.reset(); }} className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-all"
                    style={{ background: activeTab === tab ? "white" : "transparent", color: activeTab === tab ? CHARCOAL : MUTED, boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none", fontFamily: FONT_BODY }}>
                    {tab === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-6 md:mb-8 text-center">
                <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: CHARCOAL }}>Sign In</h2>
                <p className="text-sm mt-2" style={{ color: MUTED, fontFamily: FONT_BODY }}>
                  Need access? Contact your chapter leadership.
                </p>
              </div>
            )}
            {(activeTab === "login" || !REGISTRATION_ENABLED) ? (
              <Form {...loginForm} key="login-form">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 md:space-y-5">
                  <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Email</FormLabel>
                      <FormControl><Input placeholder="brother@chapter.org" {...field} className="h-11 md:h-12 rounded-lg" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" {...field} className="h-11 md:h-12 rounded-lg pr-10" />
                          <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {unverifiedEmail && (
                    <div className="p-4 rounded-lg" style={{ background: "#FFF8E1", border: "1px solid #F5A623" }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: "#E65100" }}>Please verify your email first.</p>
                      <Button type="button" variant="outline" size="sm" disabled={resendCooldown > 0} onClick={() => resendVerificationMutation.mutate(unverifiedEmail)}>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification"}
                      </Button>
                    </div>
                  )}
                  <Button type="submit" disabled={loginMutation.isPending} className="w-full h-11 md:h-12 text-white font-semibold rounded-lg text-base" style={{ background: CARDINAL, fontFamily: FONT_BODY }}>
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                  {loginMutation.isError && <p className="text-sm text-center" style={{ color: "#DC3545" }}>{(loginMutation.error as any)?.message || "Invalid credentials"}</p>}
                  <a href="/forgot-password" className="block text-center text-sm hover:underline" style={{ color: MUTED }}>Forgot password?</a>
                </form>
              </Form>
            ) : (
              <Form {...registerForm} key="register-form">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3 md:space-y-4">
                  <FormField control={registerForm.control} name="accountName" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Full Name</FormLabel>
                      <FormControl><Input placeholder="Brother's full name" {...field} className="h-11 rounded-lg" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <input type="hidden" {...registerForm.register("studentName")} />
                  <input type="hidden" {...registerForm.register("studentAge")} />
                  <input type="hidden" {...registerForm.register("gradeLevel")} />
                  <input type="hidden" {...registerForm.register("primarySubject")} />
                  <input type="hidden" {...registerForm.register("plan")} />
                  <FormField control={registerForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Email</FormLabel>
                      <FormControl><Input placeholder="brother@chapter.org" {...field} className="h-11 rounded-lg" onChange={(e) => { field.onChange(e); registerForm.setValue("studentName", registerForm.getValues("accountName") || "Brother"); }} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showRegisterPassword ? "text" : "password"} placeholder="8+ characters" {...field} className="h-11 rounded-lg pr-10" />
                          <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="accessCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>Chapter Access Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your access code" {...field} className="h-11 rounded-lg font-mono uppercase tracking-wider"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={registerMutation.isPending} className="w-full h-11 md:h-12 text-white font-semibold rounded-lg text-base" style={{ background: CARDINAL, fontFamily: FONT_BODY }}
                    onClick={() => registerForm.setValue("studentName", registerForm.getValues("accountName") || "Brother")}>
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                  {registerMutation.isError && <p className="text-sm text-center" style={{ color: "#DC3545" }}>{(registerMutation.error as any)?.message || "Registration failed"}</p>}
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 md:px-12" style={{ borderTop: `1px solid ${SILVER}66`, background: CREAM }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={pskShield} alt="Phi Sigma Kappa" className="h-10 object-contain" />
            <div className="flex flex-col">
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: CHARCOAL }}>Phi Sigma Kappa Fraternity</span>
              <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT_BODY }}>© 2026 Phi Sigma Kappa Fraternity · Indianapolis, IN</span>
            </div>
          </div>
          <div className="flex items-center gap-5" style={{ fontSize: 12, color: MUTED, fontFamily: FONT_BODY }}>
            <a href="https://phisigmakappa.org" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>phisigmakappa.org</a>
            <a href="https://www.instagram.com/phisigmakappa/" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>Instagram</a>
            <a href="https://www.facebook.com/phisigmakappa" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>Facebook</a>
          </div>
          <span style={{ fontSize: 11, color: CARDINAL_DARK, fontFamily: FONT_BODY, fontVariant: "small-caps", letterSpacing: 2, fontWeight: 600 }}>
            Powered by JIE Mastery.ai
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
