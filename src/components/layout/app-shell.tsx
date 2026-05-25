import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  ScrollText,
  Settings,
} from "lucide-react";
import { UserMenu } from "./user-menu";
import {
  NotificationBell,
  type NotificationItem,
} from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { MobileGate } from "@/components/shared/mobile-gate";

const NAV_SECTIONS: {
  marker: string;
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
  {
    marker: "§ 01",
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    marker: "§ 02",
    label: "Reference",
    items: [{ href: "/handbook", label: "Handbook", icon: BookOpen }],
  },
  {
    marker: "§ 03",
    label: "Records",
    items: [
      { href: "/audit", label: "Audit log", icon: ScrollText },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({
  children,
  user,
  notifications,
  unreadCount,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string } | null;
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  return (
    <div className="min-h-screen bg-paper">
      {/* ── Classification banner ─────────────────────────────── */}
      <div className="border-b border-rule-3 bg-ink text-paper">
        <div className="flex items-center justify-between gap-4 px-5 py-1.5">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="text-paper">TRYAKSH-SOP-PCB-001</span>
            <span className="text-paper/60">·</span>
            <span className="text-paper">v2.0</span>
            <span className="text-paper/60">·</span>
            <span className="text-signal">STATUS: CONTROLLED</span>
          </div>
          <div className="hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
            <span>Asia/Kolkata · IST</span>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-1.875rem)] grid-cols-1 md:grid-cols-[232px_1fr]">
        {/* ── Sidebar — the spine of the manual ──────────────────── */}
        <aside className="hidden md:flex flex-col border-r border-rule bg-paper-2">
          <div className="px-6 pt-6 pb-5 border-b border-rule">
            <Link href="/" className="block group">
              <Image
                src="/tryaksh-logo.png"
                alt="Tryaksh"
                width={1024}
                height={768}
                priority
                className="h-9 w-auto select-none dark:invert"
              />
              <div className="mt-3 mono-caps text-ink-3 group-hover:text-ink transition-colors">
                Innovations · SOP
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.marker}>
                <div className="px-3 pb-2 flex items-center justify-between">
                  <span className="mono-caps text-ink-4">{section.label}</span>
                  <span className="section-mark">{section.marker}</span>
                </div>
                <ul className="space-y-px">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group relative flex items-center gap-3 px-3 py-2 text-[13px] text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors"
                        >
                          <Icon className="size-3.5 text-ink-3 group-hover:text-ink" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-rule px-5 py-4">
            <div className="mono-caps text-ink-4">Edition</div>
            <div className="mt-1 font-mono text-[11px] text-ink-2">v0.1.0</div>
            <div className="mt-2 text-[10px] text-ink-4 leading-snug">
              Sequentially gated. Stages 6 &amp; 8 are lock gates and cannot be
              reopened without a formal request.
            </div>
          </div>
        </aside>

        {/* ── Main column ───────────────────────────────────────── */}
        <div className="flex flex-col min-w-0">
          <header className="h-14 border-b border-rule bg-paper-2/60 backdrop-blur-sm flex items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <div className="size-1.5 bg-signal rounded-full animate-pulse" aria-hidden />
                <span className="mono-caps text-ink-3">
                  Live · Tryaksh Innovations Pvt. Ltd.
                </span>
              </div>
              <div className="md:hidden">
                <Link href="/" className="block">
                  <Image
                    src="/tryaksh-logo.png"
                    alt="Tryaksh"
                    width={1024}
                    height={768}
                    className="h-6 w-auto dark:invert"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell
                initialUnread={unreadCount}
                initialNotifications={notifications}
              />
              {user && (
                <UserMenu
                  name={user.name}
                  email={user.email}
                  role={user.role}
                />
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
              <MobileGate />
              {children}
            </div>
          </main>

          <footer className="border-t border-rule bg-paper-2/40 px-5 md:px-10 py-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="mono-caps text-ink-4">
                Tryaksh Innovations Pvt. Ltd. · This is a controlled document.
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
                See: TRYAKSH-STD-ENG-001 · v1.0
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
