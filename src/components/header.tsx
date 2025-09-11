"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import Button from "@/components/ui/button";
import { isAdminEmail } from "@/lib/admin";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-3xl p-3 flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight">
          MatchMade
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link className="text-gray-700 hover:text-gray-900" href="/">
            Events
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" href="/survey">
            Survey
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" href="/matches">
            Matches
          </Link>
          {user && isAdminEmail(user.email) && (
            <Link className="text-gray-700 hover:text-gray-900" href="/admin/events">
              Admin
            </Link>
          )}
          {user && isAdminEmail(user.email) && (
            <Link className="text-sm hover:underline" href="/admin/qr-checker">
                QR Checker
            </Link>
          )}
           {user && isAdminEmail(user.email) && (
             <Link className="text-sm hover:underline" href="/admin/audit">
                Audit
             </Link>
          )}
          {user ? (
            <Button onClick={() => signOut(auth)}>Logout</Button>
          ) : (
            <Button onClick={() => signInWithPopup(auth, googleProvider)}>
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
