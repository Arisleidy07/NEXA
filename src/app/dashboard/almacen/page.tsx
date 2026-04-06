"use client";

import { useState } from "react";
import {
  useInventario,
  ProductoInventario,
} from "@/contexts/InventarioContext";
import {
  Warehouse,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Loader2,
  X,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ModalType = "nuevo" | "entrada" | "salida" | null;

export default function AlmacenPage() {
  const { productos, loading, agregarProducto, agregarStock, retirarStock } =
    useInventario();

  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductoInventario | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formNombre, setFormNombre] = useState("");
  const [formCantidad, setFormCantidad] = useState("");
  const [formEmpleado, setFormEmpleado] = useState("");
  const [formNota, setFormNota] = useState("");

  const resetForm = () => {
    setFormNombre("");
    setFormCantidad("");
    setFormEmpleado("");
    setFormNota("");
    setSelectedProduct(null);
    setModalType(null);
  };

  const openNuevo = () => {
    resetForm();
    setModalType("nuevo");
  };

  const openEntrada = (p: ProductoInventario) => {
    resetForm();
    setSelectedProduct(p);
    setModalType("entrada");
  };

  const openSalida = (p: ProductoInventario) => {
    resetForm();
    setSelectedProduct(p);
    setModalType("salida");
  };

  const handleSubmit = async () => {
    const cantidad = parseInt(formCantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error("Cantidad inválida");
      return;
    }

    setSaving(true);
    try {
      if (modalType === "nuevo") {
        if (!formNombre.trim()) {
          toast.error("El nombre es obligatorio");
          setSaving(false);
          return;
        }
        await agregarProducto(formNombre, cantidad);
      } else if (modalType === "entrada" && selectedProduct) {
        if (!formEmpleado.trim()) {
          toast.error("El empleado es obligatorio");
          setSaving(false);
          return;
        }
        await agregarStock(
          selectedProduct.id,
          cantidad,
          formEmpleado,
          formNota,
        );
      } else if (modalType === "salida" && selectedProduct) {
        if (!formEmpleado.trim()) {
          toast.error("El empleado es obligatorio");
          setSaving(false);
          return;
        }
        await retirarStock(
          selectedProduct.id,
          cantidad,
          formEmpleado,
          formNota,
        );
      }
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la operación");
    } finally {
      setSaving(false);
    }
  };

  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUnidades = productos.reduce((sum, p) => sum + p.cantidad, 0);
  const sinStock = productos.filter((p) => p.cantidad === 0).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Almacén</h1>
          <p className="text-muted text-sm">
            {productos.length} productos · {totalUnidades} unidades totales
            {sinStock > 0 && (
              <span className="text-danger ml-2">· {sinStock} sin stock</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/almacen/historial"
            className="px-5 py-2.5 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Ver Historial
          </Link>
          <button
            onClick={openNuevo}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Buscar producto en almacén..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <Warehouse className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">
              {search ? "Sin resultados" : "Almacén vacío"}
            </p>
            <p className="text-sm mt-1">
              {search
                ? "Intenta con otro término"
                : "Agrega tu primer producto al inventario"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Producto
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-muted">
                  Cantidad
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-muted">
                  Estado
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Actualizado:{" "}
                      {new Date(p.updatedAt).toLocaleDateString("es-DO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold">{p.cantidad}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.cantidad === 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-danger">
                        <AlertTriangle className="w-3 h-3" />
                        Sin stock
                      </span>
                    ) : p.cantidad <= 5 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                        <AlertTriangle className="w-3 h-3" />
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-success">
                        Disponible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEntrada(p)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-50 text-muted hover:text-success transition-colors"
                        title="Agregar stock"
                      >
                        <PackagePlus className="w-4 h-4" />
                        <span className="hidden lg:inline">Entrada</span>
                      </button>
                      <button
                        onClick={() => openSalida(p)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 text-muted hover:text-danger transition-colors"
                        title="Retirar stock"
                      >
                        <PackageMinus className="w-4 h-4" />
                        <span className="hidden lg:inline">Salida</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {modalType === "nuevo" && (
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                )}
                {modalType === "entrada" && (
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5 text-success" />
                  </div>
                )}
                {modalType === "salida" && (
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-danger" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {modalType === "nuevo" && "Nuevo Producto"}
                    {modalType === "entrada" && "Agregar Stock"}
                    {modalType === "salida" && "Retirar Stock"}
                  </h2>
                  {selectedProduct && (
                    <p className="text-sm text-muted">
                      {selectedProduct.nombre} — Stock actual:{" "}
                      {selectedProduct.cantidad}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {modalType === "nuevo" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej: Router TP-Link"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={formCantidad}
                  onChange={(e) => setFormCantidad(e.target.value)}
                  placeholder="Ej: 10"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus={modalType !== "nuevo"}
                />
              </div>

              {(modalType === "entrada" || modalType === "salida") && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Empleado
                    </label>
                    <input
                      type="text"
                      value={formEmpleado}
                      onChange={(e) => setFormEmpleado(e.target.value)}
                      placeholder="Ej: Sebastián"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Nota (opcional)
                    </label>
                    <input
                      type="text"
                      value={formNota}
                      onChange={(e) => setFormNota(e.target.value)}
                      placeholder="Ej: Uso interno / Reposición"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  modalType === "salida"
                    ? "bg-danger hover:bg-danger-hover"
                    : modalType === "entrada"
                      ? "bg-success hover:bg-success-hover"
                      : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalType === "nuevo" && "Crear Producto"}
                {modalType === "entrada" && "Agregar Stock"}
                {modalType === "salida" && "Retirar Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
