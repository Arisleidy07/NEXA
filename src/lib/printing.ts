// ============================================
// SISTEMA DE ETIQUETAS - BARCODE REAL
// NEXA POS
// ============================================

export interface ProductoEtiqueta {
  nombre: string;
  precio: number;
  codigoBarras: string;
}

// ============================================
// IMPRIMIR ETIQUETA
// ============================================
export function printLabel(producto: ProductoEtiqueta): void {
  const printWindow = window.open("", "_blank", "width=300,height=200");
  if (!printWindow) return;

  const nombre = producto.nombre.substring(0, 20).replace(/["<>]/g, "");
  const precio = producto.precio.toFixed(2);
  const codigo = producto.codigoBarras.replace(/["<>]/g, "");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Etiqueta</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { size: 50mm 30mm; margin: 0; }
    
    body {
      width: 50mm;
      height: 30mm;
      background: #fff;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2mm;
    }
    
    .label {
      width: 100%;
      text-align: center;
    }
    
    .name {
      font-size: 8px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 1mm;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .price {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 1mm;
    }
    
    #barcode {
      max-width: 46mm;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="name">${nombre}</div>
    <div class="price">$${precio}</div>
    <svg id="barcode"></svg>
  </div>
  <script>
    window.onload = function() {
      JsBarcode("#barcode", "${codigo}", {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 0,
        fontSize: 12,
        textMargin: 2
      });
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 300);
      }, 400);
    };
  <\/script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================
// ETIQUETA DE PRUEBA
// ============================================
export function printTestLabel(): void {
  printLabel({
    nombre: "PRODUCTO PRUEBA",
    precio: 99.99,
    codigoBarras: "NEX-TEST-001",
  });
}
