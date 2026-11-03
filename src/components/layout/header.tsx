"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Moon, Sun, LogOut, Menu, User } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleThemeToggle = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between bg-white/80 backdrop-blur-md px-4 text-[#17251F] border-b border-[#D4D9D0]/70 dark:bg-[#17251F]/90 dark:border-[#2A4437] dark:text-[#F4F6F2] lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-black/5 dark:hover:bg-white/10"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold tracking-tight text-[#17251F] dark:text-white">{title}</h1>
      </div>
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <Badge variant="secondary" className="capitalize bg-[#E8EBE6] text-[#245C43] dark:bg-[#245C43]/30 dark:text-[#6EE7B7] font-semibold">
          {session?.user?.role ?? "guest"}
        </Badge>
        <span className="hidden text-sm font-medium text-zinc-600 dark:text-zinc-300 sm:inline">
          {session?.user?.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 hover:text-[#245C43] dark:text-zinc-300 dark:hover:text-[#3D8964]"
          onClick={handleThemeToggle}
          aria-label="Toggle color theme"
          title="Toggle color theme"
          suppressHydrationWarning
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>
        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#245C43] text-white font-semibold text-sm shadow-sm shadow-[#245C43]/30 transition hover:bg-[#1E4D37]"
          aria-label="Open profile menu"
        >
          {session?.user?.name ? initials : <User className="h-5 w-5" />}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-[#2A4437] dark:bg-[#17251F]">
            <div className="space-y-1 p-4 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {session?.user?.name ?? "Profile"}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {session?.user?.email ?? "No email"}
              </p>
            </div>
            <div className="border-t border-zinc-200 dark:border-[#2A4437]">
              <Link
                href="/profile"
                className="block px-4 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
