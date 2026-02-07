"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white shadow-md shadow-black/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
          Longhorn SportsCenter
        </Link>

        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                pathname === link.href
                  ? "bg-white/20 font-semibold"
                  : "hover:bg-white/10 opacity-80 hover:opacity-100"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/30">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full ring-2 ring-white/30"
              />
            )}
            <span className="text-sm hidden sm:block">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg hover:bg-white/10 opacity-75 hover:opacity-100 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
