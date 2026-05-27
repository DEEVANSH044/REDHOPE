"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseAuthClient } from "@/lib/supabaseAuthClient";
import { Droplet, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        setMessage(data?.message ?? "Login failed");
        return;
      }

      const token: string | undefined = data?.data?.token;
      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
        const secure = window.location.protocol === "https:" ? "; secure" : "";
        document.cookie = `token=${encodeURIComponent(token)}; path=/; samesite=lax${secure}`;

        // Decode token to see if role is admin
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64));
            if (decoded && decoded.role === "admin") {
              router.push("/admin");
              return;
            }
          }
        } catch (e) {
          console.error("Failed to parse token in login page redirect", e);
        }
      }

      router.push("/dashboard");
    } catch {
      setMessage("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabaseAuthClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || "Failed to initialize Google Login.");
    }
  }

  return (
    <div className={`min-h-screen w-full flex bg-[#FDFBF7] text-[#1a1a1a] ${inter.className}`}>
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-16 lg:px-24 relative z-10 py-12">
        
        {/* Brand Logo */}
        <div className="absolute top-8 left-6 sm:left-16 lg:left-24">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
              <Droplet className="text-red-700 w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight text-gray-900 ${playfair.className}`}>
              red<span className="text-red-700">hope</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0">
          <div className="mb-8 text-center lg:text-left">
            <h1 className={`text-4xl sm:text-5xl font-bold mb-4 text-gray-900 leading-tight ${playfair.className}`}>
              Welcome Back
            </h1>
            <p className="text-gray-500 text-lg">
              Sign in to manage requests and save lives.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none shadow-sm"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-sm text-gray-400 font-medium">OR CONTINUE WITH</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <p className="mt-10 text-center text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-red-700 hover:text-red-800 hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent z-10 mix-blend-multiply"></div>
        <img 
          src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2000&auto=format&fit=crop" 
          alt="Medical Professional" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-20 left-16 right-16 z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
            <h2 className={`text-3xl font-bold text-white mb-4 ${playfair.className}`}>
              "A single drop of hope can create an ocean of change."
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Join thousands of donors and medical professionals who use redhope every day to manage emergency blood requests, organize campaigns, and save lives in real-time.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white/30 bg-gray-800 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}&backgroundColor=f3f4f6`} alt="User" />
                  </div>
                ))}
              </div>
              <span className="text-white font-medium text-sm">Trusted by 10k+ Heroes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
