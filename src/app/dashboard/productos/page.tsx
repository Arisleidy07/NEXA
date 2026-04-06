"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Package, Plus, Pencil, Trash2, X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  codigoBarras: string;
  userId: string;
}

export default function ProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ nombre: "", precio: "", codigoBarras: "" });
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(collection(db, "productos"), where("userId", "==", user.uid))
      );
      const prods: Product[] = [];
      snap.forEach((d) => prods.push({ id: d.id, ...d.data() } as Product));
      prods.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setProducts(prods);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", precio: "", codigoBarras: "" });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ nombre: p.nombre, precio: p.precio.toString(), codigoBarras: p.codigoBarras });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.nombre.trim() || !form.precio || !form.codigoBarras.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    const precio = parseFloat(form.precio);
    if (isNaN(precio) || precio <= 0) {
      toast.error("Precio inválido");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "productos", editing.id), {
          nombre: form.nombre.trim(),
          precio,
          codigoBarras: form.codigoBarras.trim(),
        });
        toast.success("Producto actualizado");
      } else {
        await addDoc(collection(db, "productos"), {
          nombre: form.nombre.trim(),
          precio,
          codigoBarras: form.codigoBarras.trim(),
          userId: user.uid,
        });
        toast.success("Producto creado");
      }
      setShowModal(false);
      loadProducts();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "productos", p.id));
      toast.success("Producto eliminado");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoBarras.includes(search)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Productos</h1>
          <p className="text-muted text-sm">{products.length} productos registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <Package className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">
              {search ? "Sin resultados" : "No hay productos"}
            </p>
            <p className="text-sm mt-1">
              {search ? "Intenta con otro término" : "Agrega tu primer producto"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">Código</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted">Precio</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.nombre}</td>
                  <td className="px-6 py-4 text-muted font-mono text-sm">{p.codigoBarras}</td>
                  <td className="px-6 py-4 text-right font-semibold">
                    ${p.precio.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editing ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Coca-Cola 500ml"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Código de Barras</label>
                <input
                  type="text"
                  value={form.codigoBarras}
                  onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                  placeholder="Ej: 7501055300846"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Precio (RD$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
