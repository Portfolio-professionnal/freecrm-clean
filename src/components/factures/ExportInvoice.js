export default function ExportInvoice({ invoice, client }) {
  const generatePDF = async () => {
    const element = document.getElementById('invoice-to-print');
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`facture-${invoice.numero}.pdf`);
  };
  
  return (
    <>
      <button 
        onClick={generatePDF}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Exporter en PDF
      </button>
      
      <div id="invoice-to-print" className="hidden p-8 bg-white">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">FACTURE</h1>
            <p>N° {invoice.numero}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">FreeCRM</p>
            <p>Votre entreprise</p>
            <p>Votre adresse</p>
          </div>
        </div>
        
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="font-bold mb-1">Facturé à:</h2>
            <p>{client?.nom || 'Client'}</p>
            <p>{client?.adresse || ''}</p>
            <p>{client?.email || ''}</p>
          </div>
          <div>
            <p><span className="font-bold">Date d'émission:</span> {new Date(invoice.date_emission).toLocaleDateString()}</p>
            <p><span className="font-bold">Date d'échéance:</span> {new Date(invoice.date_echeance).toLocaleDateString()}</p>
            <p><span className="font-bold">Statut:</span> {invoice.statut}</p>
          </div>
        </div>
        
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-right">Montant HT</th>
              <th className="py-2 px-4 text-right">TVA</th>
              <th className="py-2 px-4 text-right">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4">Prestation de services</td>
              <td className="py-2 px-4 text-right">{invoice.montant_ht} €</td>
              <td className="py-2 px-4 text-right">{invoice.taux_tva} %</td>
              <td className="py-2 px-4 text-right">{invoice.montant_ttc} €</td>
            </tr>
            <tr className="border-t">
              <td colSpan="3" className="py-2 px-4 text-right font-bold">Total</td>
              <td className="py-2 px-4 text-right font-bold">{invoice.montant_ttc} €</td>
            </tr>
          </tbody>
        </table>
        
        {invoice.conditions_paiement && (
          <div className="mb-4">
            <h3 className="font-bold mb-1">Conditions de paiement</h3>
            <p>{invoice.conditions_paiement}</p>
          </div>
        )}
        
        {invoice.notes && (
          <div>
            <h3 className="font-bold mb-1">Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}