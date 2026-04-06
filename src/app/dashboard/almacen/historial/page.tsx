"use client";

import { useState } from "react";
import { useInventario } from "@/contexts/InventarioContext";
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Loader2,
  ArrowLeft,
  Filter,
} from "lucide-react";
import Link from "next/link";

type FiltroTipo = "todos" | "entrada" | "salida";

export default function HistorialPage() {
  const { movimientos, loading } = useInventario();
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");

  const filtered = movimientos.filter((m) => {
    const matchSearch =
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.empleado.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "todos" || m.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  const totalEntradas = movimientos.filter((m) => m.tipo === "entrada").length;
  const totalSalidas = movimientos.filter((m) => m.tipo === "salida").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/almacen"
            className="p-2 rounded-xl border border-border hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Historial de Movimientos
            </h1>
            <p className="text-muted text-sm">
              {movimientos.length} movimientos · {totalEntradas} entradas ·{" "}
              {totalSalidas} salidas
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por producto o empleado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroTipo("todos")}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              filtroTipo === "todos"
                ? "bg-primary text-white"
                : "border border-border hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo("entrada")}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              filtroTipo === "entrada"
                ? "bg-success text-white"
                : "border border-border hover:bg-green-50 hover:text-success"
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Entradas
          </button>
          <button
            onClick={() => setFiltroTipo("salida")}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              filtroTipo === "salida"
                ? "bg-danger text-white"
                : "border border-border hover:bg-red-50 hover:text-danger"
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Salidas
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <History className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">
              {search || filtroTipo !== "todos"
                ? "Sin resultados"
                : "No hay movimientos"}
            </p>
            <p className="text-sm mt-1">
              {search || filtroTipo !== "todos"
                ? "Intenta con otros filtros"
                : "Los movimientos aparecerán aquí al agregar o retirar stock"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Tipo
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Producto
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-muted">
                  Cantidad
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Empleado
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Nota
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    {m.tipo === "entrada" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-success">
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-danger">
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                        Salida
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{m.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`font-bold ${
                        m.tipo === "entrada" ? "text-success" : "text-danger"
                      }`}
                    >
                      {m.tipo === "entrada" ? "+" : "-"}
                      {m.cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">{m.empleado}</td>
                  <td className="px-6 py-4 text-muted text-sm">
                    {m.nota || "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted">
                    {new Date(m.fecha).toLocaleDateString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
