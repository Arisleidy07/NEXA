"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Package,
  Receipt,
  ScanBarcode,
  Users,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  Printer,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";

/* ─── Data ─── */
const features = [
  {
    icon: Package,
    title: "Inventario en tiempo real",
    desc: "Control total de tu stock. Cada entrada y salida se registra al instante.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Receipt,
    title: "Facturación automática",
    desc: "Genera tickets profesionales con un solo clic. Sin complicaciones.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: ScanBarcode,
    title: "Escaneo rápido",
    desc: "Escanea códigos de barra y agrega productos al carrito al instante.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: Users,
    title: "Control de empleados",
    desc: "Registra quién opera, quién retira stock y quién realiza cada venta.",
    color: "from-orange-500 to-amber-400",
  },
];

const demoProducts = [
  { name: "Coca-Cola 500ml", price: 45.0, qty: 2 },
  { name: "Doritos Nacho", price: 35.0, qty: 1 },
  { name: "Agua Cristal 1L", price: 25.0, qty: 3 },
  { name: "Pan Blanco", price: 60.0, qty: 1 },
];

const navLinks = [
  { label: "Inicio", href: "#hero" },
  { label: "Funciones", href: "#funciones" },
  { label: "Demo", href: "#demo" },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({
  target,
  duration = 1.5,
  prefix = "",
}: {
  target: number;
  duration?: number;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("en-US", {
        minimumFractionDigits: prefix === "$" ? 2 : 0,
      })}
    </span>
  );
}

/* ─── Component ─── */
export default function Home() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  /* Demo cart animation */
  const [demoCart, setDemoCart] = useState<typeof demoProducts>([]);
  const [demoStep, setDemoStep] = useState(0);
  const demoStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !demoStarted.current) {
          demoStarted.current = true;
          demoProducts.forEach((p, i) => {
            setTimeout(
              () => {
                setDemoCart((prev) => [...prev, p]);
                setDemoStep(i + 1);
              },
              800 * (i + 1),
            );
          });
        }
      },
      { threshold: 0.3 },
    );
    const el = document.getElementById("demo-trigger");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const demoTotal = demoCart.reduce((s, p) => s + p.price * p.qty, 0);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
        {/* ═══ NAVBAR ═══ */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="NEXA"
                width={38}
                height={38}
                className="object-contain"
              />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                NEXA
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {!loading && user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-200 shadow-sm text-sm"
                >
                  Ir al Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-200 shadow-sm text-sm"
                  >
                    Comenzar Gratis
                  </Link>
                </>
              )}
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 bg-foreground rounded transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                  />
                  <span
                    className={`block h-0.5 bg-foreground rounded transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}
                  />
                  <span
                    className={`block h-0.5 bg-foreground rounded transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                  />
                </div>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3"
            >
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-muted hover:text-foreground py-2"
                >
                  {l.label}
                </a>
              ))}
            </motion.div>
          )}
        </nav>

        {/* ═══ HERO ═══ */}
        <section
          id="hero"
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60 animate-gradient-shift" />

          {/* Decorative orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse-glow" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #1e40af 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Floating elements */}
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 max-w-5xl mx-auto px-6 text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
            >
              <Image
                src="/logo.png"
                alt="NEXA"
                width={80}
                height={80}
                className="mx-auto mb-6 drop-shadow-xl"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-primary/20 rounded-full text-sm font-semibold text-primary mb-8 shadow-sm"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Sistema POS Profesional
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Control total de tu{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                negocio
              </span>{" "}
              en tiempo real
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Facturación, inventario y control en un solo sistema. Diseñado
              para negocios que exigen velocidad y precisión.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/registro"
                className="group flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-hover transition-all duration-300 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
              >
                Comenzar ahora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur border border-gray-200 text-foreground rounded-2xl font-semibold text-lg hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-primary ml-0.5" />
                </span>
                Ver demo
              </a>
            </motion.div>
          </motion.div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="funciones" className="py-28 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-sm font-semibold rounded-full mb-4">
                Funciones
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                Todo lo que necesitas,{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  nada que no
                </span>
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                Herramientas poderosas diseñadas para negocios reales.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  {/* Gradient accent */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                  <p className="text-muted leading-relaxed text-[15px]">
                    {f.desc}
                  </p>

                  {/* Hover arrow */}
                  <div className="mt-6 flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    Explorar <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEMO VISUAL ═══ */}
        <section
          id="demo"
          className="py-28 bg-gradient-to-b from-gray-50/80 to-white relative"
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-sm font-semibold rounded-full mb-4">
                Demo en vivo
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                Mira NEXA{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  en acción
                </span>
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                Así funciona el punto de venta. Rápido, limpio y profesional.
              </p>
            </motion.div>

            <div id="demo-trigger" className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                {/* POS Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="NEXA"
                      width={28}
                      height={28}
                      className="object-contain brightness-0 invert"
                    />
                    <span className="text-white font-bold">NEXA POS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/80 text-sm">En línea</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-5">
                  {/* Product list */}
                  <div className="md:col-span-3 p-6 border-r border-gray-100">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                        <ScanBarcode className="w-5 h-5 text-muted" />
                        <span className="text-muted text-sm">
                          Escanear producto...
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {demoProducts.map((p, i) => (
                        <motion.div
                          key={p.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={
                            demoStep > i
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0.3, x: 0 }
                          }
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${demoStep > i ? "border-primary/20 bg-primary/[0.02]" : "border-gray-100 bg-gray-50/50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${demoStep > i ? "bg-primary/10" : "bg-gray-100"}`}
                            >
                              <Package
                                className={`w-5 h-5 ${demoStep > i ? "text-primary" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{p.name}</p>
                              <p className="text-xs text-muted">
                                ${p.price.toFixed(2)} c/u
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                              <Minus className="w-3.5 h-3.5 text-muted" />
                              <span className="text-sm font-semibold w-6 text-center">
                                {p.qty}
                              </span>
                              <Plus className="w-3.5 h-3.5 text-muted" />
                            </div>
                            <p className="font-bold text-sm w-20 text-right">
                              ${(p.price * p.qty).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Cart summary */}
                  <div className="md:col-span-2 p-6 bg-gray-50/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h4 className="font-bold">Resumen</h4>
                      <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        {demoCart.length} items
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 mb-6">
                      {demoCart.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted">
                            {p.name} x{p.qty}
                          </span>
                          <span className="font-semibold">
                            ${(p.price * p.qty).toFixed(2)}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted text-sm">Subtotal</span>
                        <span className="font-semibold">
                          ${demoTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted text-sm">ITBIS (18%)</span>
                        <span className="font-semibold">
                          ${(demoTotal * 0.18).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="font-bold text-lg">Total</span>
                        <motion.span
                          key={demoTotal}
                          initial={{ scale: 1.2, color: "#1e40af" }}
                          animate={{ scale: 1, color: "#0f172a" }}
                          transition={{ duration: 0.4 }}
                          className="font-extrabold text-2xl"
                        >
                          ${(demoTotal * 1.18).toFixed(2)}
                        </motion.span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        Cobrar
                      </button>
                      <button className="py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Printer className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: "Negocios activos", value: 520, prefix: "" },
                { label: "Ventas procesadas", value: 84000, prefix: "" },
                { label: "Productos escaneados", value: 350000, prefix: "" },
                { label: "Uptime", value: 99, prefix: "", suffix: ".9%" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                    <AnimatedCounter target={s.value} prefix={s.prefix} />
                    {"suffix" in s ? s.suffix : "+"}
                  </p>
                  <p className="text-muted text-sm">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ MESSAGE / QUOTE ═══ */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/logo.png"
                alt="NEXA"
                width={56}
                height={56}
                className="mx-auto mb-8 brightness-0 invert drop-shadow-lg"
              />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Diseñado para negocios reales.
                <br />
                <span className="text-blue-200">
                  Rápido, confiable y profesional.
                </span>
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10">
                NEXA es más que un sistema — es la herramienta que transforma la
                operación de tu negocio.
              </p>
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                Empezar ahora — es gratis
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-3 gap-12 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/logo.png"
                    alt="NEXA"
                    width={36}
                    height={36}
                    className="object-contain brightness-0 invert"
                  />
                  <span className="text-xl font-bold">NEXA</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Sistema de facturación profesional para negocios que exigen
                  velocidad, control y confiabilidad.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
                  Plataforma
                </h4>
                <div className="space-y-3">
                  <a
                    href="#funciones"
                    className="block text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Funciones
                  </a>
                  <a
                    href="#demo"
                    className="block text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Demo
                  </a>
                  <Link
                    href="/registro"
                    className="block text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login"
                    className="block text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
                  Soporte
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <p className="text-sm text-slate-300">soporte@nexa.com</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                &copy; 2026 NEXA. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                Hecho con <span className="text-red-400 mx-1">♥</span> para
                negocios reales
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
