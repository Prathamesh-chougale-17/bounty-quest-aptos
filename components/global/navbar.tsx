"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import ModeToggle from "./darkmode";
import Image from "next/image";
import { WalletSelector as ShadcnWalletSelector } from "@/components/WalletButton";

const routes = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/tasks", label: "Tasks" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center mb-6">
                    <Link
                      href="/"
                      className="flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image
                        src={"/bounty-quest.png"}
                        width={36}
                        height={36}
                        alt="Logo"
                        className="mr-2"
                      />
                      <span className="font-bold text-lg">BountyQuest</span>
                    </Link>
                  </div>

                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium transition-colors hover:text-primary py-2"
                    >
                      {route.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
                    <ShadcnWalletSelector />
                    <ModeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Visible on all screen sizes */}
          <Link href="/" className="flex items-center">
            <Image
              src={"/bounty-quest.png"}
              width={36}
              height={36}
              alt="Logo"
              className="mr-2"
            />
            <span className="font-bold text-lg hidden sm:inline">
              BountyQuest
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-1 md:space-x-2 lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm font-medium transition-colors hover:text-primary px-1 py-2"
            >
              {route.label}
            </Link>
          ))}
        </div>

        {/* Right side actions - Desktop & Mobile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <div className="hidden lg:block">
            <ShadcnWalletSelector />
          </div>
          <div className="lg:hidden">
            <ShadcnWalletSelector />
          </div>
          <div className="sm:hidden">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
