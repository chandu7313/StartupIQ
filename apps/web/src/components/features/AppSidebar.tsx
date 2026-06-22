"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@startupiq/ui";
import { BillingStatus } from "./BillingStatus";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Validation", href: "/validate/new", icon: PlusCircle },
  { name: "My Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    // Basic clearing of cookie and redirect
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative flex h-screen flex-col border-r bg-card dark:bg-slate-900 z-10"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <img src="/app-logo.png" alt="startupIQ Logo" className="h-6 w-6 object-contain" />
            startupIQ
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 flex flex-col gap-4">
        <BillingStatus isCollapsed={isCollapsed} />
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <button onClick={handleLogout} className="flex h-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 px-3 hover:bg-rose-500/20 text-xs font-bold transition-colors">
            Log Out
          </button>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">My Account</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
