"use client";

import { signIn } from "next-auth/react";
import { Calendar, Clock, FileText, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />

        <div className="max-w-4xl mx-auto px-6 py-28 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Smart Sports Scheduling for Longhorns
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight">
            Longhorn SportsCenter
          </h1>
          <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed">
            Never miss a Longhorns game. Smart scheduling that fits your life.
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="bg-white text-[#BF5700] px-8 py-3.5 rounded-xl font-semibold text-lg
                       hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200
                       shadow-lg shadow-black/10
                       inline-flex items-center gap-2.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 tracking-tight">
          How it works
        </h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          Three steps to never miss another Longhorns game
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-[#BF5700]" />}
            title="Smart Recommendations"
            description="Get personalized game suggestions based on your favorite sports, schedule, and preferences."
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6 text-[#BF5700]" />}
            title="Google Calendar Sync"
            description="Automatically check your availability and add games directly to your Google Calendar."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-[#BF5700]" />}
            title="Class Schedule Import"
            description="Upload your class schedule PDF and we'll make sure games don't conflict with your classes."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6 text-[#BF5700]" />}
            title="7 Sports Covered"
            description="Football, Volleyball, Men's & Women's Basketball, Baseball, Softball, and Soccer — all in one place."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-400 border-t border-gray-100">
        <p className="font-medium text-[#BF5700]">Hook &apos;em Horns</p>
        <a href="/privacy" className="mt-2 inline-block text-gray-400 hover:text-gray-600 underline">
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 hover-lift group">
      <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#BF5700]/10 to-[#E87511]/10
                      flex items-center justify-center
                      group-hover:from-[#BF5700]/20 group-hover:to-[#E87511]/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
