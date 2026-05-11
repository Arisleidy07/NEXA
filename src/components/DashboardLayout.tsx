"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  Receipt,
  Warehouse,
  History,
  LogOut,
  Loader2,
  User,
  ChevronDown,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/pos", icon: ScanBarcode, label: "POS (Caja)" },
  { href: "/dashboard/productos", icon: Package, label: "Productos" },
  { href: "/dashboard/ventas", icon: Receipt, label: "Ventas" },
  { href: "/dashboard/almacen", icon: Warehouse, label: "Almacén" },
  {
    href: "/dashboard/almacen/historial",
    icon: History,
    label: "Historial Mov.",
  },
  { href: "/dashboard/dispositivos", icon: Printer, label: "Dispositivos" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl = userProfile?.fotoUrl || user.photoURL;
  const displayName = userProfile?.nombre || user.displayName || "Mi Negocio";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="NEXA"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-bold tracking-tight">NEXA</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-danger transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main area with top bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-9 h-9"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <span className="text-sm font-medium hidden sm:block">
                {displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-muted" />
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 text-muted hover:text-danger transition-colors w-full border-t border-border"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
