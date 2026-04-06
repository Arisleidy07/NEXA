"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Receipt,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2,
  Calendar,
} from "lucide-react";

interface SaleProduct {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface Sale {
  id: string;
  productos: SaleProduct[];
  total: number;
  fecha: string;
  userId: string;
}

export default function VentasPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(collection(db, "ventas"), where("userId", "==", user.uid)),
      );
      const data: Sale[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Sale));
      data.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
      setSales(data);
    } catch {
      console.error("Error loading sales");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handlePrintSale = (sale: Sale) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket - NEXA</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10px; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .total { font-size: 16px; font-weight: bold; }
          h2 { margin: 0; font-size: 18px; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="/logo.png" alt="NEXA" style="width:50px;height:50px;object-fit:contain;margin:0 auto 4px;" />
          <h2>NEXA</h2>
          <p>${user?.displayName || "Mi Negocio"}</p>
          <p style="font-size:10px">${new Date(sale.fecha).toLocaleString("es-DO")}</p>
          <p style="font-size:10px">Venta #${sale.id.slice(-8).toUpperCase()}</p>
        </div>
        <div class="line"></div>
        ${sale.productos
          .map(
            (p) => `
          <div class="row">
            <span>${p.nombre} x${p.cantidad}</span>
            <span>$${p.subtotal.toFixed(2)}</span>
          </div>
        `,
          )
          .join("")}
        <div class="line"></div>
        <div class="row total">
          <span>TOTAL</span>
          <span>$${sale.total.toFixed(2)}</span>
        </div>
        <div class="line"></div>
        <p class="center" style="font-size:10px">¡Gracias por su compra!</p>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const todaySales = sales.filter(
    (s) => new Date(s.fecha).toDateString() === new Date().toDateString(),
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Historial de Ventas</h1>
        <p className="text-muted text-sm">{sales.length} ventas registradas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Ventas Hoy</p>
          <p className="text-2xl font-bold">{todaySales.length}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Ingresos Hoy</p>
          <p className="text-2xl font-bold text-success">
            $
            {todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <p className="text-muted text-sm mb-1">Ingresos Totales</p>
          <p className="text-2xl font-bold text-primary">
            $
            {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <Receipt className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No hay ventas registradas</p>
            <p className="text-sm mt-1">
              Las ventas aparecerán aquí después de cobrar en el POS
            </p>
          </div>
        ) : (
          <div>
            {sales.map((sale) => {
              const isExpanded = expandedSale === sale.id;
              return (
                <div
                  key={sale.id}
                  className="border-b border-border last:border-0"
                >
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {sale.productos.length} producto(s) &middot;{" "}
                          {sale.productos.reduce((s, p) => s + p.cantidad, 0)}{" "}
                          items
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(sale.fecha).toLocaleDateString("es-DO", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg text-success">
                        $
                        {sale.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-4 bg-gray-50/30">
                      <div className="border border-border rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-border">
                              <th className="text-left px-4 py-2 font-medium text-muted">
                                Producto
                              </th>
                              <th className="text-center px-4 py-2 font-medium text-muted">
                                Cant.
                              </th>
                              <th className="text-right px-4 py-2 font-medium text-muted">
                                Precio
                              </th>
                              <th className="text-right px-4 py-2 font-medium text-muted">
                                Subtotal
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.productos.map((p, i) => (
                              <tr
                                key={i}
                                className="border-b border-border last:border-0"
                              >
                                <td className="px-4 py-2">{p.nombre}</td>
                                <td className="px-4 py-2 text-center">
                                  {p.cantidad}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  ${p.precio.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                  ${p.subtotal.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintSale(sale);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Reimprimir Ticket
                        </button>
                        <p className="text-xs text-muted">
                          ID: {sale.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
