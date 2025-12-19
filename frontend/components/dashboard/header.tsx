"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, Menu, X } from "lucide-react";
import Logo from "../Logo";
import ThemeSelector from "../theme/theme-selector";
import { User } from "@/lib/schema/user.schema";

interface DashboardHeaderProps {
  user: User;
  onToggleTour: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  user,
  onToggleTour,
  onLogout,
}: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-6 md:px-8 py-6 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 max-w-7xl mx-auto">
        {/* Left Part - Logo */}
        <div className="flex gap-2 items-center cursor-pointer shrink-0">
          <Logo height={50} width={50} />
          <Link href="/">
            <div className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer">
              PhotoVault
            </div>
          </Link>
        </div>

        {/* Right Part - Desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeSelector compact={true} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTour}
            className="text-muted-foreground hover:text-foreground"
          >
            Tour
          </Button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold hover:opacity-90 transition-opacity"
            >
              {user.username?.charAt(0).toUpperCase()}
            </button>

            {showUserMenu && (
              <div className="absolute  right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg z-50">
                <Link href="/profile">
                  <button className="w-full text-left px-4 py-2 hover:bg-muted rounded-t-lg">
                    Profile Settings
                  </button>
                </Link>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-b-lg text-destructive"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Full Screen Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border/50">
            <div className="flex gap-2 items-center">
              <Logo height={40} width={40} />
              <div className="text-xl font-bold">PhotoVault</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col py-4">
            {/* Actions */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30">
              <ThemeSelector compact={true} />
            </div>

            <button
              onClick={() => {
                onToggleTour();
                setIsOpen(false);
              }}
              className="flex items-center px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30 text-left"
            >
              <span className="text-base font-medium">Tour</span>
            </button>

            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <div className="flex items-center px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30">
                <span className="text-base font-medium">Profile Settings</span>
              </div>
            </Link>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30 text-left text-destructive"
            >
              <span className="text-base font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
