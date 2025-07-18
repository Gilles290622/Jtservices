export const generateInvoiceHTML = (sale) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Facture ${sale.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #6366f1; }
          .invoice-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">JTS Services</div>
          <p>Système de Gestion de Caisse</p>
        </div>
        
        <div class="invoice-details">
          <p><strong>Numéro de facture:</strong> ${sale.invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(sale.created_at).toLocaleDateString('fr-FR')}</p>
          <p><strong>Heure:</strong> ${new Date(sale.created_at).toLocaleTimeString('fr-FR')}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix unitaire</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${Number(item.price).toLocaleString('fr-FR')} F CFA</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toLocaleString('fr-FR')} F CFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Total: ${Number(sale.total).toLocaleString('fr-FR')} F CFA</p>
        </div>

        <div class="footer">
          <p>Merci pour votre achat !</p>
          <p>JTS Services - Votre partenaire de confiance</p>
        </div>
      </body>
    </html>
  `;
};