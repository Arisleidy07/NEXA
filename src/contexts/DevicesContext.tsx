"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { printTestLabel } from "@/lib/printing";

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
    printTestLabel();
  };

  const handleTestLabel = () => {
    printTestLabel();
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
        testPrintLabel: handleTestLabel,
        saveSettings,
      }}
    >
      {children}
    </DevicesContext.Provider>
  );
}

export const useDevices = () => useContext(DevicesContext);
