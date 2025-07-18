import React from 'react';
import { FileText } from 'lucide-react';
import writtenNumber from 'written-number';

const InvoiceTemplate = React.forwardRef(({ invoice, client, items, profile }, ref) => {
  if (!invoice) return null;

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  const themeColor = profile?.theme_color || '#333333';

  const totalInWords = writtenNumber(totalAmount, { lang: 'fr' });

  const hexToRgba = (hex, alpha) => {
    if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      return `rgba(51, 51, 51, ${alpha})`; // Fallback color
    }
    let c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
  };

  const isFeminine = invoice.type === 'facture' || invoice.type === 'proforma';
  const agreementText = isFeminine ? 'la présente' : 'le présent';

  return (
    <div ref={ref} className="bg-white text-black font-sans text-sm mx-auto p-4 md:p-8 shadow-lg">
      <div id="invoice-content">
        {/* Header */}
        <header className="flex flex-col-reverse md:flex-row justify-between items-start pb-8 border-b-2" style={{ borderColor: themeColor }}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider" style={{ color: themeColor }}>{invoice.type}</h1>
            <p className="text-gray-500 mt-2">Numéro: {invoice.invoice_number}</p>
          </div>
          <div className="text-left md:text-right w-full md:w-auto mb-4 md:mb-0">
            <div className="flex items-center md:justify-end gap-2">
              {profile?.logo_url ? (
                  <img-replace src={profile.logo_url} alt="Logo" className="h-10 object-contain" />
              ) : (
                  <FileText className="w-8 h-8" style={{ color: themeColor }}/>
              )}
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: themeColor }}>
                {profile?.denomination || 'Mon Entreprise'}
              </h2>
            </div>
          </div>
        </header>

        {/* Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="font-semibold text-gray-500 uppercase tracking-wide mb-2">Facturé à</h3>
            <p className="font-bold text-gray-800 text-lg">{client?.name || 'Client non spécifié'}</p>
            <p className="text-gray-600">{client?.address}</p>
            <p className="text-gray-600">{client?.email}</p>
            <p className="text-gray-600">{client?.phone}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="mb-4">
              <p className="font-semibold text-gray-500">Date d'émission</p>
              <p className="font-medium text-gray-800">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">Date d'échéance</p>
              <p className="font-medium text-gray-800">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Items Table */}
        <section className="mt-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr 
                  className="uppercase text-xs"
                  style={{ 
                    backgroundColor: hexToRgba(themeColor, 0.1),
                    color: 'black' 
                  }}
                >
                  <th className="p-2 md:p-3 font-semibold w-1/2">Description</th>
                  <th className="p-2 md:p-3 font-semibold text-center w-24">Quantité</th>
                  <th className="p-2 md:p-3 font-semibold text-right w-32">Prix Unitaire</th>
                  <th className="p-2 md:p-3 font-semibold text-right w-40">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-2 md:p-3 break-words">{item.description}</td>
                    <td className="p-2 md:p-3 text-center">{item.quantity}</td>
                    <td className="p-2 md:p-3 text-right">{Number(item.unit_price).toLocaleString('fr-FR')}</td>
                    <td className="p-2 md:p-3 text-right font-medium">{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Total Box */}
        <section className="flex justify-end mt-8">
          <div className="w-full max-w-sm">
            <div 
              className="flex justify-between items-center p-4 rounded-lg"
              style={{ backgroundColor: hexToRgba(themeColor, 0.1) }}
            >
              <p className="font-bold text-lg uppercase" style={{ color: themeColor }}>Total</p>
              <p className="font-bold text-lg text-gray-800">{totalAmount.toLocaleString('fr-FR')} F CFA</p>
            </div>
          </div>
        </section>

        {/* Amount in Words */}
        <section className="mt-6 w-full">
          <p className="text-gray-700 italic text-sm text-left">
            Arrêté {agreementText} {invoice.type.toLowerCase()} à la somme de <span className="font-bold capitalize">{totalInWords}</span> francs CFA.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-gray-500 text-xs">
          <p className="font-bold mb-2">{profile?.denomination || 'Mon Entreprise'}</p>
          <p>{profile?.headquarters || 'Adresse non spécifiée'}</p>
          <p>{profile?.contact_info || 'Contacts non définis'}</p>
          <p className="mt-4 italic">Merci de votre confiance.</p>
        </footer>
      </div>
    </div>
  );
});

export default InvoiceTemplate;