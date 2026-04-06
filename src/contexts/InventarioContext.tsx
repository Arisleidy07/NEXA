"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
export interface ProductoInventario {
  id: string;
  nombre: string;
  cantidad: number;
  userId: string;
  updatedAt: string;
}

export interface Movimiento {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  tipo: "entrada" | "salida";
  empleado: string;
  nota: string;
  fecha: string;
  userId: string;
}

interface InventarioContextType {
  productos: ProductoInventario[];
  movimientos: Movimiento[];
  loading: boolean;
  agregarProducto: (nombre: string, cantidad: number) => Promise<void>;
  agregarStock: (
    productoId: string,
    cantidad: number,
    empleado: string,
    nota: string,
  ) => Promise<void>;
  retirarStock: (
    productoId: string,
    cantidad: number,
    empleado: string,
    nota: string,
  ) => Promise<void>;
}

const InventarioContext = createContext<InventarioContextType>(
  {} as InventarioContextType,
);

// ── Provider ───────────────────────────────────────────
export function InventarioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener: inventario
  useEffect(() => {
    if (!user) {
      setProductos([]);
      setMovimientos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qInv = query(
      collection(db, "inventario"),
      where("userId", "==", user.uid),
    );

    const unsubInv = onSnapshot(
      qInv,
      (snap) => {
        const items: ProductoInventario[] = [];
        snap.forEach((d) =>
          items.push({ id: d.id, ...d.data() } as ProductoInventario),
        );
        items.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setProductos(items);
        setLoading(false);
      },
      (err) => {
        console.error("inventario listener error:", err);
        setLoading(false);
      },
    );

    const qMov = query(
      collection(db, "movimientos"),
      where("userId", "==", user.uid),
    );

    const unsubMov = onSnapshot(
      qMov,
      (snap) => {
        const items: Movimiento[] = [];
        snap.forEach((d) =>
          items.push({ id: d.id, ...d.data() } as Movimiento),
        );
        items.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        setMovimientos(items);
      },
      (err) => {
        console.error("movimientos listener error:", err);
      },
    );

    return () => {
      unsubInv();
      unsubMov();
    };
  }, [user]);

  // ── Agregar nuevo producto al inventario ─────────────
  const agregarProducto = useCallback(
    async (nombre: string, cantidad: number) => {
      if (!user) return;
      if (!nombre.trim()) {
        toast.error("El nombre es obligatorio");
        return;
      }
      if (cantidad < 0) {
        toast.error("La cantidad no puede ser negativa");
        return;
      }

      const now = new Date().toISOString();

      const docRef = await addDoc(collection(db, "inventario"), {
        nombre: nombre.trim(),
        cantidad,
        userId: user.uid,
        updatedAt: now,
      });

      // Registrar movimiento de entrada inicial
      if (cantidad > 0) {
        await addDoc(collection(db, "movimientos"), {
          productoId: docRef.id,
          nombre: nombre.trim(),
          cantidad,
          tipo: "entrada",
          empleado: user.displayName || "Sistema",
          nota: "Stock inicial",
          fecha: now,
          userId: user.uid,
        });
      }

      toast.success("Producto agregado al inventario");
    },
    [user],
  );

  // ── Agregar stock (entrada) ──────────────────────────
  const agregarStock = useCallback(
    async (
      productoId: string,
      cantidad: number,
      empleado: string,
      nota: string,
    ) => {
      if (!user) return;
      if (cantidad <= 0) {
        toast.error("La cantidad debe ser mayor a 0");
        return;
      }
      if (!empleado.trim()) {
        toast.error("El nombre del empleado es obligatorio");
        return;
      }

      const producto = productos.find((p) => p.id === productoId);
      if (!producto) {
        toast.error("Producto no encontrado");
        return;
      }

      const now = new Date().toISOString();
      const nuevaCantidad = producto.cantidad + cantidad;

      await updateDoc(doc(db, "inventario", productoId), {
        cantidad: nuevaCantidad,
        updatedAt: now,
      });

      await addDoc(collection(db, "movimientos"), {
        productoId,
        nombre: producto.nombre,
        cantidad,
        tipo: "entrada",
        empleado: empleado.trim(),
        nota: nota.trim(),
        fecha: now,
        userId: user.uid,
      });

      toast.success(`+${cantidad} ${producto.nombre} agregados`);
    },
    [user, productos],
  );

  // ── Retirar stock (salida) ───────────────────────────
  const retirarStock = useCallback(
    async (
      productoId: string,
      cantidad: number,
      empleado: string,
      nota: string,
    ) => {
      if (!user) return;
      if (cantidad <= 0) {
        toast.error("La cantidad debe ser mayor a 0");
        return;
      }
      if (!empleado.trim()) {
        toast.error("El nombre del empleado es obligatorio");
        return;
      }

      const producto = productos.find((p) => p.id === productoId);
      if (!producto) {
        toast.error("Producto no encontrado");
        return;
      }

      if (cantidad > producto.cantidad) {
        toast.error(
          `Stock insuficiente. Solo hay ${producto.cantidad} unidades de "${producto.nombre}"`,
        );
        return;
      }

      const now = new Date().toISOString();
      const nuevaCantidad = producto.cantidad - cantidad;

      await updateDoc(doc(db, "inventario", productoId), {
        cantidad: nuevaCantidad,
        updatedAt: now,
      });

      await addDoc(collection(db, "movimientos"), {
        productoId,
        nombre: producto.nombre,
        cantidad,
        tipo: "salida",
        empleado: empleado.trim(),
        nota: nota.trim(),
        fecha: now,
        userId: user.uid,
      });

      toast.success(`-${cantidad} ${producto.nombre} retirados`);
    },
    [user, productos],
  );

  return (
    <InventarioContext.Provider
      value={{
        productos,
        movimientos,
        loading,
        agregarProducto,
        agregarStock,
        retirarStock,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
}

export const useInventario = () => useContext(InventarioContext);
