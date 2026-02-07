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
    <nav className="bg-[#BF5700] text-white">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-bold text-lg">
          Longhorn SportsCenter
        </Link>

        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm flex items-center gap-1.5 transition-opacity ${
                pathname === link.href
                  ? "opacity-100 font-semibold"
                  : "opacity-75 hover:opacity-100"
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
                className="w-7 h-7 rounded-full"
              />
            )}
            <span className="text-sm hidden sm:block">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="opacity-75 hover:opacity-100 transition-opacity"
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
