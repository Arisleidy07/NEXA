"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import Image from "next/image";
import {
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  X,
  Printer,
  Search,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { printTicket } from "@/lib/printing";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  codigoBarras: string;
  imagenUrl?: string;
}

interface CartItem {
  product: Product;
  cantidad: number;
}

interface CompletedSale {
  items: CartItem[];
  total: number;
  fecha: string;
  id: string;
}

export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [flashItem, setFlashItem] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load products once
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDocs(
        query(collection(db, "productos"), where("userId", "==", user.uid)),
      );
      const prods: Product[] = [];
      snap.forEach((d) => prods.push({ id: d.id, ...d.data() } as Product));
      setProducts(prods);
    };
    load();
  }, [user]);

  // Create audio context for beep sound
  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRl9vT19teleABIABAAEARKwAAIlYAgACABAAZGF0YU" +
        "tvT19XQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=",
    );
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Silent fallback
    }
  }, []);

  const playErrorBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 300;
      osc.type = "square";
      gain.gain.value = 0.2;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Silent fallback
    }
  }, []);

  // Auto-focus scanner input
  useEffect(() => {
    const focus = () => {
      if (!showConfirmation && inputRef.current) {
        inputRef.current.focus();
      }
    };
    focus();
    const interval = setInterval(focus, 500);
    window.addEventListener("click", focus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("click", focus);
    };
  }, [showConfirmation]);

  const addToCart = (product: Product) => {
    playBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...prev, { product, cantidad: 1 }];
    });
    setFlashItem(product.id);
    setTimeout(() => setFlashItem(null), 400);
    setTimeout(() => {
      cartEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = scanInput.trim();
    if (!code) return;

    const product = products.find((p) => p.codigoBarras === code);
    if (!product) {
      playErrorBeep();
      toast.error("Producto no encontrado", { description: `Código: ${code}` });
      setScanInput("");
      return;
    }

    addToCart(product);
    setScanInput("");
  };

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.codigoBarras.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.precio * item.cantidad,
    0,
  );

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    setProcessing(true);

    try {
      const fecha = new Date().toISOString();
      const saleData = {
        productos: cart.map((item) => ({
          productoId: item.product.id,
          nombre: item.product.nombre,
          precio: item.product.precio,
          cantidad: item.cantidad,
          subtotal: item.product.precio * item.cantidad,
        })),
        total,
        fecha,
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db, "ventas"), saleData);

      setCompletedSale({
        items: [...cart],
        total,
        fecha,
        id: docRef.id,
      });

      setCart([]);
      setShowConfirmation(true);
      playBeep();
      toast.success("Venta registrada exitosamente");
    } catch {
      toast.error("Error al procesar la venta");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!completedSale) return;

    printTicket({
      id: completedSale.id,
      productos: completedSale.items.map((item) => ({
        nombre: item.product.nombre,
        cantidad: item.cantidad,
        precio: item.product.precio,
        subtotal: item.product.precio * item.cantidad,
      })),
      total: completedSale.total,
      fecha: completedSale.fecha,
      negocioNombre: user?.displayName || undefined,
    });
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setCompletedSale(null);
    inputRef.current?.focus();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="flex h-screen">
      {/* Left: Scanner + Cart */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scanner Bar + Search */}
        <div className="p-4 bg-card border-b border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <ScanBarcode className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={handleScan}
                placeholder="Escanear código de barras..."
                className="w-full px-5 py-3.5 border-2 border-primary/30 rounded-xl text-lg font-mono bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted bg-gray-100 px-2 py-1 rounded">
                ENTER
              </div>
            </div>
          </div>

          {/* Search by name/code */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto por nombre o código..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-40 max-h-72 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-border last:border-0"
                  >
                    {/* Product Image */}
                    {p.imagenUrl ? (
                      <Image
                        src={p.imagenUrl}
                        alt={p.nombre}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-muted" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.nombre}</p>
                      <p className="text-xs text-muted font-mono">
                        {p.codigoBarras}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="font-semibold text-sm">
                        ${p.precio.toFixed(2)}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-40 px-4 py-3">
                <p className="text-sm text-muted text-center">
                  No se encontraron productos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Carrito vacío</p>
              <p className="text-sm mt-1">Escanea un producto para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={item.product.id}
                  className={`flex items-center gap-4 bg-card border border-border rounded-xl p-4 transition-all ${
                    flashItem === item.product.id ? "scan-flash" : ""
                  } slide-in`}
                >
                  <div className="w-8 text-center text-sm text-muted font-mono">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.product.nombre}
                    </p>
                    <p className="text-sm text-muted">
                      ${item.product.precio.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-lg">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-28 text-right">
                    <p className="font-bold">
                      ${(item.product.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div ref={cartEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Right: Summary Panel */}
      <div className="w-80 bg-card border-l border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="font-bold text-lg">Resumen</h2>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Productos</span>
              <span className="font-medium">{cart.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Items totales</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-muted font-medium">TOTAL</span>
                <span className="text-3xl font-bold text-foreground">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="w-full py-3 border border-border rounded-xl font-medium text-muted hover:bg-gray-50 hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Limpiar Carrito
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full py-4 bg-success text-white rounded-xl font-bold text-lg hover:bg-success-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <DollarSign className="w-6 h-6" />
              {processing ? "Procesando..." : "COBRAR"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && completedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-success p-6 text-center text-white">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">¡Venta Completada!</h2>
              <p className="text-green-100 mt-1">
                {new Date(completedSale.fecha).toLocaleString("es-DO")}
              </p>
            </div>

            {/* Ticket Preview */}
            <div className="p-6">
              <div
                id="ticket-print"
                className="bg-white border border-border rounded-xl p-6"
              >
                <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-300">
                  <Image
                    src="/logo.png"
                    alt="NEXA"
                    width={48}
                    height={48}
                    className="mx-auto mb-2 object-contain"
                  />
                  <h3 className="text-xl font-bold">NEXA</h3>
                  <p className="text-sm text-muted">
                    {user?.displayName || "Mi Negocio"}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(completedSale.fecha).toLocaleString("es-DO")}
                  </p>
                  <p className="text-xs text-muted">
                    Venta #{completedSale.id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-gray-300">
                  {completedSale.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1">
                        <span>{item.product.nombre}</span>
                        <span className="text-muted ml-2">
                          x{item.cantidad}
                        </span>
                      </div>
                      <span className="font-medium">
                        ${(item.product.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-lg">TOTAL</span>
                  <span className="font-bold text-2xl">
                    ${completedSale.total.toFixed(2)}
                  </span>
                </div>

                <p className="text-center text-xs text-muted mt-4 pt-4 border-t border-dashed border-gray-300">
                  ¡Gracias por su compra!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir Ticket
              </button>
              <button
                onClick={closeConfirmation}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
