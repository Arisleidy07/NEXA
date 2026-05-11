"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ==========================================
// DEVICE CONTEXT - NEXA POS
// ==========================================

export interface PrinterConfig {
  id: string;
  name: string;
  type: "ticket" | "label";
  isDefault: boolean;
  isConnected: boolean;
  paperWidth: 80 | 58;
}

interface DevicesContextType {
  // Printers
  ticketPrinter: PrinterConfig | null;
  labelPrinter: PrinterConfig | null;
  setTicketPrinter: (printer: PrinterConfig) => void;
  setLabelPrinter: (printer: PrinterConfig) => void;

  // Scanner
  scannerEnabled: boolean;
  setScannerEnabled: (enabled: boolean) => void;

  // Settings
  autoPrint: boolean;
  setAutoPrint: (enabled: boolean) => void;

  // Actions
  testPrintTicket: () => void;
  testPrintLabel: () => void;
  saveSettings: () => void;
}

const defaultTicketPrinter: PrinterConfig = {
  id: "default-ticket",
  name: "Impresora de Tickets (Por defecto)",
  type: "ticket",
  isDefault: true,
  isConnected: true,
  paperWidth: 80,
};

const defaultLabelPrinter: PrinterConfig = {
  id: "default-label",
  name: "Impresora de Etiquetas (Por defecto)",
  type: "label",
  isDefault: true,
  isConnected: true,
  paperWidth: 58,
};

const DevicesContext = createContext<DevicesContextType>(
  {} as DevicesContextType,
);

export function DevicesProvider({ children }: { children: ReactNode }) {
  // Printer states
  const [ticketPrinter, setTicketPrinterState] = useState<PrinterConfig | null>(
    null,
  );
  const [labelPrinter, setLabelPrinterState] = useState<PrinterConfig | null>(
    null,
  );

  // Scanner state
  const [scannerEnabled, setScannerEnabledState] = useState(true);

  // Auto print setting
  const [autoPrint, setAutoPrintState] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedTicket = localStorage.getItem("nexa_ticket_printer");
      const savedLabel = localStorage.getItem("nexa_label_printer");
      const savedScanner = localStorage.getItem("nexa_scanner_enabled");
      const savedAutoPrint = localStorage.getItem("nexa_auto_print");

      if (savedTicket) {
        setTicketPrinterState(JSON.parse(savedTicket));
      } else {
        setTicketPrinterState(defaultTicketPrinter);
      }

      if (savedLabel) {
        setLabelPrinterState(JSON.parse(savedLabel));
      } else {
        setLabelPrinterState(defaultLabelPrinter);
      }

      if (savedScanner !== null) {
        setScannerEnabledState(savedScanner === "true");
      }

      if (savedAutoPrint !== null) {
        setAutoPrintState(savedAutoPrint === "true");
      }
    } catch {
      // Use defaults if localStorage fails
      setTicketPrinterState(defaultTicketPrinter);
      setLabelPrinterState(defaultLabelPrinter);
    }
  }, []);

  // Save settings function
  const saveSettings = () => {
    try {
      if (ticketPrinter) {
        localStorage.setItem(
          "nexa_ticket_printer",
          JSON.stringify(ticketPrinter),
        );
      }
      if (labelPrinter) {
        localStorage.setItem(
          "nexa_label_printer",
          JSON.stringify(labelPrinter),
        );
      }
      localStorage.setItem("nexa_scanner_enabled", scannerEnabled.toString());
      localStorage.setItem("nexa_auto_print", autoPrint.toString());
    } catch {
      console.error("Error saving device settings");
    }
  };

  // Update printer with auto-save
  const setTicketPrinter = (printer: PrinterConfig) => {
    setTicketPrinterState(printer);
    try {
      localStorage.setItem("nexa_ticket_printer", JSON.stringify(printer));
    } catch {
      // Ignore storage errors
    }
  };

  const setLabelPrinter = (printer: PrinterConfig) => {
    setLabelPrinterState(printer);
    try {
      localStorage.setItem("nexa_label_printer", JSON.stringify(printer));
    } catch {
      // Ignore storage errors
    }
  };

  const setScannerEnabledValue = (enabled: boolean) => {
    setScannerEnabledState(enabled);
    try {
      localStorage.setItem("nexa_scanner_enabled", enabled.toString());
    } catch {
      // Ignore storage errors
    }
  };

  const setAutoPrintValue = (enabled: boolean) => {
    setAutoPrintState(enabled);
    try {
      localStorage.setItem("nexa_auto_print", enabled.toString());
    } catch {
      // Ignore storage errors
    }
  };

  // Test print functions
  const testPrintTicket = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prueba de Impresión</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            width: 80mm; 
            padding: 8px;
            font-size: 11px;
          }
          .center { text-align: center; }
          .line { border-top: 1px dashed #333; margin: 6px 0; }
          .success { color: #059669; font-weight: bold; font-size: 14px; }
          .header { margin-bottom: 12px; }
          h2 { font-size: 16px; margin: 8px 0; }
          .check { font-size: 20px; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="check">✓</div>
          <h2 class="success">PRUEBA EXITOSA</h2>
          <p>NEXA POS System</p>
          <p>${new Date().toLocaleString("es-DO")}</p>
        </div>
        <div class="line"></div>
        <div class="center">
          <p>Impresora de Tickets</p>
          <p class="success">Configurada correctamente</p>
        </div>
        <div class="line"></div>
        <div class="center" style="font-size:9px;margin-top:8px;">
          <p>Caracteres: ñ á é í ó ú Ñ</p>
          <p>Símbolos: $ % & @ #</p>
        </div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const testPrintLabel = () => {
    const printWindow = window.open("", "_blank", "width=300,height=200");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prueba Etiqueta</title>
        <style>
          @page { size: 50mm 30mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            width: 50mm; 
            height: 30mm; 
            padding: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .nombre { font-size: 8px; font-weight: bold; text-align: center; margin-bottom: 1mm; }
          .precio { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 2mm; }
          .test { font-size: 7px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="nombre">PRODUCTO DE PRUEBA</div>
        <div class="precio">$99.99</div>
        <div class="test">Etiqueta de prueba - NEXA</div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <DevicesContext.Provider
      value={{
        ticketPrinter,
        labelPrinter,
        setTicketPrinter,
        setLabelPrinter,
        scannerEnabled,
        setScannerEnabled: setScannerEnabledValue,
        autoPrint,
        setAutoPrint: setAutoPrintValue,
        testPrintTicket,
        testPrintLabel,
        saveSettings,
      }}
    >
      {children}
    </DevicesContext.Provider>
  );
}

export const useDevices = () => useContext(DevicesContext);
