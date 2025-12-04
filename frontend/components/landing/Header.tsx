"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";
import ThemeSelector from "../theme/theme-selector";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

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
      <header className="flex items-center justify-between gap-4 px-6 md:px-8 py-6 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
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
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
          </Link>
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
            <div className="flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30">
              <span className="text-base font-medium">Theme</span>
              <ThemeSelector compact={true} />
            </div>

            <Link href="/login" onClick={() => setIsOpen(false)}>
              <div className="flex items-center px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30">
                <span className="text-base font-medium">Sign In</span>
              </div>
            </Link>

            <Link href="/signup" onClick={() => setIsOpen(false)}>
              <div className="flex items-center px-6 py-4 hover:bg-accent/5 transition-colors border-b border-border/30">
                <span className="text-base font-medium">Get Started</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
