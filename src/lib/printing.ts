// ============================================
// SISTEMA PROFESIONAL DE ETIQUETAS
// NEXA POS - Barcode REAL con JsBarcode
// ============================================

export interface ProductoEtiqueta {
  nombre: string;
  precio: number;
  codigoBarras: string;
}

// ============================================
// IMPRIMIR ETIQUETA - BARCODE REAL CODE128
// ============================================
export function printLabel(producto: ProductoEtiqueta): void {
  const printWindow = window.open("", "_blank", "width=400,height=300");
  if (!printWindow) return;

  // Sanitizar datos para evitar problemas en el HTML
  const nombreSafe = producto.nombre
    .substring(0, 25)
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const precioStr = producto.precio.toFixed(2);
  const codigoSafe = producto.codigoBarras
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Etiqueta - ${codigoSafe}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: 50mm 30mm;
      margin: 0;
      padding: 0;
    }
    
    body {
      width: 50mm;
      height: 30mm;
      background: #ffffff;
      font-family: 'Arial', 'Helvetica', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2mm;
    }
    
    .etiqueta {
      width: 46mm;
      text-align: center;
    }
    
    .producto-nombre {
      font-size: 8px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 1mm;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
    }
    
    .producto-precio {
      font-size: 14px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 2mm;
    }
    
    .barcode-wrapper {
      width: 100%;
      height: 12mm;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1mm 0;
    }
    
    #barcode {
      max-width: 100%;
      height: auto;
    }
    
    .barcode-texto {
      font-family: 'Courier New', monospace;
      font-size: 7px;
      color: #333333;
      letter-spacing: 0.5px;
      margin-top: 0.5mm;
    }
    
    @media print {
      @page {
        size: 50mm 30mm;
        margin: 0;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        background: #ffffff;
        -webkit-print-background-adjust: exact;
      }
      
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta">
    <div class="producto-nombre">${nombreSafe}</div>
    <div class="producto-precio">$${precioStr}</div>
    <div class="barcode-wrapper">
      <svg id="barcode"></svg>
    </div>
    <div class="barcode-texto">${codigoSafe}</div>
  </div>
  
  <script>
    (function() {
      try {
        JsBarcode("#barcode", "${codigoSafe}", {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 0,
          fontSize: 0
        });
        
        // Esperar a que el barcode se renderice
        setTimeout(function() {
          window.print();
          // Cerrar ventana después de imprimir
          setTimeout(function() {
            window.close();
          }, 500);
        }, 300);
      } catch(err) {
        console.error("Error generando barcode:", err);
        document.querySelector(".barcode-wrapper").innerHTML = 
          '<div style="font-size:8px;color:red;text-align:center;">BARCODE ERROR</div>';
      }
    })();
  <\/script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================
// ETIQUETA DE PRUEBA - PARA TESTEAR IMPRESORA
// ============================================
export function printTestLabel(): void {
  printLabel({
    nombre: "PRODUCTO DE PRUEBA",
    precio: 99.99,
    codigoBarras: "NEX-TEST-001",
  });
}
