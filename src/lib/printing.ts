// ==========================================
// UTILIDADES DE IMPRESIÓN - NEXA POS
// ==========================================

export interface ProductoEtiqueta {
  nombre: string;
  precio: number;
  codigoBarras: string;
}

export interface VentaTicket {
  id: string;
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
  total: number;
  fecha: string;
  negocioNombre?: string;
}

// ─── IMPRIMIR ETIQUETA ───────────────────
export function printLabel(producto: ProductoEtiqueta): void {
  const printWindow = window.open("", "_blank", "width=300,height=200");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Etiqueta - ${producto.nombre}</title>
      <style>
        @page { size: 50mm 30mm; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          width: 50mm; 
          height: 30mm; 
          padding: 2mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .nombre { 
          font-size: 8px; 
          font-weight: bold; 
          text-align: center;
          margin-bottom: 1mm;
          max-width: 46mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .precio { 
          font-size: 14px; 
          font-weight: bold; 
          text-align: center;
          margin-bottom: 2mm;
          color: #000;
        }
        .barcode { 
          font-family: 'Libre Barcode 39', 'Code 39', monospace;
          font-size: 20px;
          text-align: center;
          letter-spacing: 2px;
        }
        .barcode-text {
          font-size: 8px;
          text-align: center;
          font-family: monospace;
          margin-top: 1mm;
        }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="nombre">${producto.nombre}</div>
      <div class="precio">$${producto.precio.toFixed(2)}</div>
      <div class="barcode">*${producto.codigoBarras}*</div>
      <div class="barcode-text">${producto.codigoBarras}</div>
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

// ─── IMPRIMIR TICKET PROFESIONAL ───────────
export function printTicket(venta: VentaTicket): void {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket - ${venta.id.slice(-8).toUpperCase()}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', 'Monaco', monospace; 
          width: 80mm; 
          padding: 8px;
          font-size: 11px;
          line-height: 1.3;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { 
          border-top: 1px dashed #333; 
          margin: 6px 0; 
        }
        .line-thick {
          border-top: 2px solid #333;
          margin: 6px 0;
        }
        .row { 
          display: flex; 
          justify-content: space-between; 
          margin: 2px 0; 
        }
        .row-product {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-size: 10px;
        }
        .product-name {
          flex: 1;
          padding-right: 8px;
        }
        .product-qty {
          width: 30px;
          text-align: center;
        }
        .product-price {
          width: 60px;
          text-align: right;
        }
        .total { 
          font-size: 14px; 
          font-weight: bold;
          margin-top: 4px;
        }
        .header {
          margin-bottom: 8px;
        }
        .header h2 {
          font-size: 16px;
          font-weight: bold;
          margin: 4px 0;
        }
        .header p {
          font-size: 9px;
          margin: 2px 0;
        }
        .footer {
          margin-top: 8px;
          text-align: center;
          font-size: 9px;
        }
        .barcode-section {
          text-align: center;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #333;
        }
        .barcode-text {
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 2px;
          margin: 4px 0;
        }
        .thank-you {
          font-size: 11px;
          font-weight: bold;
          margin: 8px 0;
        }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header center">
        <h2>${venta.negocioNombre || "NEXA"}</h2>
        <p>${new Date(venta.fecha).toLocaleString("es-DO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
        <p>Ticket #${venta.id.slice(-8).toUpperCase()}</p>
      </div>
      
      <div class="line"></div>
      
      ${venta.productos
        .map(
          (p) => `
        <div class="row-product">
          <span class="product-name">${p.nombre}</span>
          <span class="product-qty">x${p.cantidad}</span>
          <span class="product-price">$${p.subtotal.toFixed(2)}</span>
        </div>
      `,
        )
        .join("")}
      
      <div class="line-thick"></div>
      
      <div class="row total">
        <span>TOTAL</span>
        <span>$${venta.total.toFixed(2)}</span>
      </div>
      
      <div class="footer">
        <p class="thank-you">¡Gracias por su compra!</p>
        <div class="barcode-section">
          <div class="barcode-text">*${venta.id.slice(-8).toUpperCase()}*</div>
          <p style="font-size:8px;margin-top:2px;">${venta.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>
      
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ─── IMPRIMIR TICKET DE PRUEBA ─────────────
export function printTestTicket(printerName?: string): void {
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
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        h2 { font-size: 14px; margin: 8px 0; }
        .success { color: #059669; font-weight: bold; }
        .test-item { margin: 4px 0; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="center">
        <h2>✓ PRUEBA DE IMPRESIÓN</h2>
        <p>NEXA POS System</p>
        <p>${new Date().toLocaleString("es-DO")}</p>
        ${printerName ? `<p>Impresora: ${printerName}</p>` : ""}
      </div>
      
      <div class="line"></div>
      
      <div class="test-item">✓ Conexión establecida</div>
      <div class="test-item">✓ Formato térmico 80mm</div>
      <div class="test-item">✓ Código de barras OK</div>
      <div class="test-item">✓ Caracteres especiales: ñ á é í ó ú</div>
      
      <div class="line"></div>
      
      <div class="center">
        <p class="success">IMPRESORA CONFIGURADA</p>
        <p style="font-size:9px;margin-top:4px;">Sistema listo para uso</p>
      </div>
      
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ─── IMPRIMIR ETIQUETA DE PRUEBA ───────────
export function printTestLabel(): void {
  printLabel({
    nombre: "Producto de Prueba",
    precio: 99.99,
    codigoBarras: "TEST-001",
  });
}
