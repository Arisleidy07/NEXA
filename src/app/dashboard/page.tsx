"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  ScanBarcode,
  Package,
  Receipt,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
}

interface RecentSale {
  id: string;
  total: number;
  fecha: string;
  productCount: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      try {
        const productsSnap = await getDocs(
          query(collection(db, "productos"), where("userId", "==", user.uid)),
        );
        const salesSnap = await getDocs(
          query(collection(db, "ventas"), where("userId", "==", user.uid)),
        );

        let totalRevenue = 0;
        const sales: RecentSale[] = [];
        salesSnap.forEach((doc) => {
          const data = doc.data();
          totalRevenue += data.total || 0;
          sales.push({
            id: doc.id,
            total: data.total,
            fecha: data.fecha,
            productCount: data.productos?.length || 0,
          });
        });

        sales.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );

        setStats({
          totalProducts: productsSnap.size,
          totalSales: salesSnap.size,
          totalRevenue,
        });
        setRecentSales(sales.slice(0, 5));
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  const statCards = [
    {
      label: "Productos",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/dashboard/productos",
    },
    {
      label: "Ventas Totales",
      value: stats.totalSales,
      icon: Receipt,
      color: "bg-green-50 text-green-600",
      href: "/dashboard/ventas",
    },
    {
      label: "Ingresos",
      value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      href: "/dashboard/ventas",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Bienvenido, {user?.displayName || "Usuario"}
        </h1>
        <p className="text-muted">Resumen de tu negocio</p>
      </div>

      {/* Quick Action */}
      <Link
        href="/dashboard/pos"
        className="flex items-center justify-between p-6 bg-primary text-white rounded-2xl mb-8 hover:bg-primary-hover transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <ScanBarcode className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Abrir Caja (POS)</h2>
            <p className="text-blue-100 text-sm">Iniciar punto de venta</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loading ? "..." : card.value}
            </p>
            <p className="text-muted text-sm">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Ventas Recientes</h3>
          <Link
            href="/dashboard/ventas"
            className="text-primary text-sm font-medium hover:underline"
          >
            Ver todas
          </Link>
        </div>
        {loading ? (
          <p className="text-muted text-sm py-4">Cargando...</p>
        ) : recentSales.length === 0 ? (
          <p className="text-muted text-sm py-4">
            No hay ventas registradas aún. ¡Abre el POS y empieza a vender!
          </p>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">
                    {sale.productCount} producto(s)
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(sale.fecha).toLocaleDateString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="font-semibold text-success">
                  $
                  {sale.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
