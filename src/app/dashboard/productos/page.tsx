"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  ImagePlus,
  Eye,
  Printer,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { printLabel } from "@/lib/printing";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  codigoBarras: string;
  imagenUrl?: string;
  userId: string;
}

function generateBarcode(): string {
  const prefix = "NEX";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export default function ProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    codigoBarras: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(collection(db, "productos"), where("userId", "==", user.uid)),
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
    setForm({ nombre: "", precio: "", codigoBarras: generateBarcode() });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      precio: p.precio.toString(),
      codigoBarras: p.codigoBarras,
    });
    setImageFile(null);
    setImagePreview(p.imagenUrl || null);
    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openViewModal = (p: Product) => {
    setViewingProduct(p);
    setShowViewModal(true);
  };

  const uploadProductImage = async (
    productId: string,
    file: File,
  ): Promise<string> => {
    const storageRef = ref(
      storage,
      `productos/${user!.uid}/${productId}_${Date.now()}`,
    );
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.nombre.trim() || !form.precio) {
      toast.error("Completa nombre y precio");
      return;
    }
    const precio = parseFloat(form.precio);
    if (isNaN(precio) || precio <= 0) {
      toast.error("Precio inválido");
      return;
    }
    if (!editing && !imageFile) {
      toast.error("Selecciona una imagen para el producto");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const updateData: Record<string, unknown> = {
          nombre: form.nombre.trim(),
          precio,
          codigoBarras: form.codigoBarras.trim(),
        };
        if (imageFile) {
          const url = await uploadProductImage(editing.id, imageFile);
          updateData.imagenUrl = url;
        }
        await updateDoc(doc(db, "productos", editing.id), updateData);
        toast.success("Producto actualizado");
      } else {
        const docRef = await addDoc(collection(db, "productos"), {
          nombre: form.nombre.trim(),
          precio,
          codigoBarras: form.codigoBarras.trim(),
          userId: user.uid,
        });
        if (imageFile) {
          const url = await uploadProductImage(docRef.id, imageFile);
          await updateDoc(doc(db, "productos", docRef.id), { imagenUrl: url });
        }
        toast.success("Producto creado");
      }
      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
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
      p.codigoBarras.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Productos</h1>
          <p className="text-muted text-sm">
            {products.length} productos registrados
          </p>
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
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
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
              {search
                ? "Intenta con otro término"
                : "Agrega tu primer producto"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Producto
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted">
                  Código
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted">
                  Precio
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
                    <div className="flex items-center gap-3">
                      {p.imagenUrl ? (
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                          <Image
                            src={p.imagenUrl}
                            alt={p.nombre}
                            width={44}
                            height={44}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted" />
                        </div>
                      )}
                      <span className="font-medium">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted font-mono text-sm">
                    {p.codigoBarras}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    $
                    {p.precio.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openViewModal(p)}
                        className="p-2 rounded-lg hover:bg-green-50 text-muted hover:text-success transition-colors"
                        title="Ver producto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-muted hover:text-primary transition-colors"
                        title="Editar producto"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition-colors"
                        title="Eliminar producto"
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

      {/* View Product Modal */}
      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg p-0 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">Detalles del Producto</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Large Image */}
              <div className="w-full aspect-square max-h-[300px] mb-6 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                {viewingProduct.imagenUrl ? (
                  <Image
                    src={viewingProduct.imagenUrl}
                    alt={viewingProduct.nombre}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted">
                    <Package className="w-20 h-20 mb-4 opacity-40" />
                    <p className="text-lg">Sin imagen</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-muted mb-1">Nombre del Producto</p>
                  <p className="text-xl font-bold">{viewingProduct.nombre}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-muted mb-1">Código de Barras</p>
                    <p className="font-mono text-lg font-medium">
                      {viewingProduct.codigoBarras}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-4">
                    <p className="text-sm text-primary mb-1">Precio</p>
                    <p className="text-2xl font-bold text-primary">
                      ${viewingProduct.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border bg-gray-50/50">
              <button
                onClick={() => {
                  printLabel({
                    nombre: viewingProduct.nombre,
                    precio: viewingProduct.precio,
                    codigoBarras: viewingProduct.codigoBarras,
                  });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Imprimir Etiqueta
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEdit(viewingProduct);
                }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                Editar Producto
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editing ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Imagen del Producto{" "}
                  {!editing && <span className="text-danger">*</span>}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[120px]"
                >
                  {imagePreview ? (
                    <div className="w-[120px] h-[120px] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={120}
                        height={120}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-muted mb-2" />
                      <p className="text-sm text-muted">
                        Click para subir imagen
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Coca-Cola 500ml"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={form.codigoBarras}
                  readOnly
                  className="w-full px-4 py-3 border border-border rounded-xl bg-gray-50 text-muted font-mono cursor-not-allowed"
                />
                <p className="text-xs text-muted mt-1">
                  Generado automáticamente
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Precio (RD$)
                </label>
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
