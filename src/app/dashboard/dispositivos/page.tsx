"use client";

import { useDevices } from "@/contexts/DevicesContext";
import {
  Printer,
  Tag,
  ScanBarcode,
  Settings,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function DispositivosPage() {
  const {
    ticketPrinter,
    labelPrinter,
    scannerEnabled,
    setScannerEnabled,
    autoPrint,
    setAutoPrint,
    testPrintTicket,
    testPrintLabel,
    saveSettings,
  } = useDevices();

  const handleSave = () => {
    saveSettings();
    toast.success("Configuración guardada");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dispositivos</h1>
          <p className="text-muted text-sm">
            Configura tus impresoras y escáner
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <Save className="w-5 h-5" />
          Guardar Configuración
        </button>
      </div>

      {/* Impresora de Tickets */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
            <Printer className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">Impresora de Tickets</h2>
              {ticketPrinter?.isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Conectada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Desconectada
                </span>
              )}
            </div>
            <p className="text-muted text-sm mb-4">
              {ticketPrinter?.name || "No configurada"}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Ancho de papel</p>
                <p className="font-medium">{ticketPrinter?.paperWidth || 80}mm</p>
                <p className="text-xs text-muted mt-1">
                  Térmico estándar
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Tipo</p>
                <p className="font-medium">USB / Red</p>
                <p className="text-xs text-muted mt-1">
                  Compatible con navegador
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                testPrintTicket();
                toast.success("Enviando prueba de impresión...");
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Prueba de Impresión
            </button>
          </div>
        </div>
      </div>

      {/* Impresora de Etiquetas */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
            <Tag className="w-7 h-7 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">Impresora de Etiquetas</h2>
              {labelPrinter?.isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Conectada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Desconectada
                </span>
              )}
            </div>
            <p className="text-muted text-sm mb-4">
              {labelPrinter?.name || "No configurada"}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Tamaño de etiqueta</p>
                <p className="font-medium">50mm x 30mm</p>
                <p className="text-xs text-muted mt-1">
                  Térmica directa
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Tipo</p>
                <p className="font-medium">USB / Bluetooth</p>
                <p className="text-xs text-muted mt-1">
                  Compatible con navegador
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                testPrintLabel();
                toast.success("Enviando prueba de etiqueta...");
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Prueba de Etiqueta
            </button>
          </div>
        </div>
      </div>

      {/* Escáner y Configuración */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Escáner */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ScanBarcode className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold">Escáner de Código</h2>
              <p className="text-sm text-muted">USB HID (modo teclado)</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span className="text-sm font-medium">Escáner habilitado</span>
              <input
                type="checkbox"
                checked={scannerEnabled}
                onChange={(e) => setScannerEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>

            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700">
                <strong>Nota:</strong> El escáner funciona como teclado USB.
                El cursor debe estar en el campo de entrada del POS.
              </p>
            </div>
          </div>
        </div>

        {/* Configuración General */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold">Configuración</h2>
              <p className="text-sm text-muted">Opciones de impresión</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span className="text-sm font-medium">Impresión automática</span>
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => setAutoPrint(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>

            <div className="p-3 bg-yellow-50 rounded-xl">
              <p className="text-xs text-yellow-700">
                <strong>Preparado para Electron:</strong> La configuración se
                guarda localmente y será compatible con la app de escritorio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
