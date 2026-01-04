import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 lg:flex-row">
      <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Acme Inc</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="grid items-start px-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-0 lg:flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
          <Link href="/dashboard" className="font-semibold">
            Acme Inc
          </Link>
          <div className="ml-auto">
             <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 lg:p-6">
            <div className="flex justify-end mb-4 hidden lg:flex">
                <UserButton afterSignOutUrl="/" />
            </div>
          {children}
        </main>
      </div>
    </div>
  );
}
