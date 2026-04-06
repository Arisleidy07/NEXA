"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  ScanBarcode,
  Receipt,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: ScanBarcode,
    title: "Escaneo Instantáneo",
    desc: "Agrega productos al carrito con solo escanear el código de barras.",
  },
  {
    icon: Zap,
    title: "Ultra Rápido",
    desc: "Optimizado para operar sin retrasos, incluso en jornadas largas.",
  },
  {
    icon: Receipt,
    title: "Tickets Profesionales",
    desc: "Imprime tickets térmicos con diseño profesional automáticamente.",
  },
  {
    icon: BarChart3,
    title: "Control de Ventas",
    desc: "Historial completo de ventas con detalles de cada transacción.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro y Privado",
    desc: "Cada negocio tiene sus datos completamente aislados y protegidos.",
  },
  {
    icon: Users,
    title: "Multi-negocio",
    desc: "Cada usuario gestiona su propio negocio de forma independiente.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">NEXA</span>
        </div>
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 text-foreground font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Crear Cuenta
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-primary rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Sistema POS Profesional
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            Facturación rápida,{" "}
            <span className="text-primary">profesional</span> y sin errores
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            NEXA es el sistema de punto de venta diseñado para negocios que
            necesitan velocidad, estabilidad y una experiencia superior a la de
            cualquier supermercado.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/registro"
              className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-blue-500/25"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-border text-foreground rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold mb-4">
              Todo lo que tu negocio necesita
            </h2>
            <p className="text-muted text-lg">
              Un sistema completo, diseñado para operar en el mundo real.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted text-sm border-t border-border">
        <p>
          &copy; {new Date().getFullYear()} NEXA. Sistema de facturación
          profesional.
        </p>
      </footer>
    </div>
  );
}
