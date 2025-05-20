"use client";

import { useEffect, useState } from "react";
import { useFactures } from "@/hooks/useFactures";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FacturesPage() {
  const { user } = useAuth();
  const { factures, loading, error, fetchFactures, createFacture, markAsSent, markAsPaid, deleteFacture } = useFactures();
  const { clients, fetchClients } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFacture, setNewFacture] = useState({
    numero: `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    date_emission: new Date().toISOString().split("T")[0],
    date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
    client_id: "",
    montant_ht: "",
    taux_tva: 20,
    montant_ttc: "",
    statut: "brouillon"
  });
  const [filter, setFilter] = useState("all"); // "all", "draft", "sent", "overdue", "paid"
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchFactures();
      fetchClients();
    }
  }, [user]);

  const handleCreateFacture = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!newFacture.numero || !newFacture.date_emission || !newFacture.date_echeance || !newFacture.client_id || !newFacture.montant_ht) {
      return;
    }
    
    // Calculer le montant TTC
    const montantTTC = parseFloat(newFacture.montant_ht) * (1 + parseFloat(newFacture.taux_tva) / 100);
    
    await createFacture({
      ...newFacture,
      client_id: parseInt(newFacture.client_id),
      montant_ht: parseFloat(newFacture.montant_ht),
      montant_ttc: montantTTC
    });
    
    // Réinitialiser le formulaire
    setNewFacture({
      numero: `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date_emission: new Date().toISOString().split("T")[0],
      date_echeance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      client_id: "",
      montant_ht: "",
      taux_tva: 20,
      montant_ttc: "",
      statut: "brouillon"
    });
    
    setIsModalOpen(false);
  };

  const handleMarkAsSent = async (id, e) => {
    e.stopPropagation();
    await markAsSent(id);
  };

  const handleMarkAsPaid = async (id, e) => {
    e.stopPropagation();
    await markAsPaid(id);
  };

  const handleDeleteFacture = async (id, e) => {
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      await deleteFacture(id);
    }
  };

  // Fonction pour filtrer les factures
  const filteredFactures = () => {
    if (!factures.length) return [];
    
    switch (filter) {
      case "draft":
        return factures.filter(facture => facture.statut === "brouillon");
      case "sent":
        return factures.filter(facture => facture.statut === "envoyée");
      case "overdue":
        return factures.filter(facture => facture.statut === "en retard");
      case "paid":
        return factures.filter(facture => facture.statut === "payée");
      default:
        return factures;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const statusColors = {
      "brouillon": "bg-gray-100 text-gray-800",
      "envoyée": "bg-blue-100 text-blue-800",
      "en retard": "bg-red-100 text-red-800",
      "payée": "bg-green-100 text-green-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-blue-600 text-xl font-bold">FreeCRM</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Tableau de bord
                </Link>
                <Link href="/clients" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Clients
                </Link>
                <Link href="/prospects" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Prospects
                </Link>
                <Link href="/taches" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Tâches
                </Link>
                <Link href="/factures" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Factures
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Factures</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Nouvelle facture
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "draft" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Brouillons
          </button>
          <button
            onClick={() => setFilter("sent")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "sent" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Envoyées
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "overdue" 
                ? "bg-red-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            En retard
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "paid" 
                ? "bg-green-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Payées
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            Erreur: {error}
          </div>
        ) : filteredFactures().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucune facture trouvée pour ce filtre.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer une facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'émission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'échéance
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant TTC
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFactures().map((facture) => (
                  <tr 
                    key={facture.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/factures/${facture.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {facture.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {facture.client ? facture.client.nom : "Client inconnu"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(facture.date_emission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(facture.date_echeance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatMontant(facture.montant_ttc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(facture.statut)}`}>
                        {facture.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {facture.statut === "brouillon" && (
                          <button
                            onClick={(e) => handleMarkAsSent(facture.id, e)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Envoyer
                          </button>
                        )}
                        {(facture.statut === "envoyée" || facture.statut === "en retard") && (
                          <button
                            onClick={(e) => handleMarkAsPaid(facture.id, e)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Payer
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteFacture(facture.id, e)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal pour créer une facture */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Créer une nouvelle facture</h3>
                <form onSubmit={handleCreateFacture} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="numero" className="block text-sm font-medium text-gray-700">N° Facture *</label>
                      <input
                        type="text"
                        id="numero"
                        value={newFacture.numero}
                        onChange={(e) => setNewFacture({...newFacture, numero: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Client *</label>
                      <select
                        id="client_id"
                        value={newFacture.client_id}
                        onChange={(e) => setNewFacture({...newFacture, client_id: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date_emission" className="block text-sm font-medium text-gray-700">Date d'émission *</label>
                      <input
                        type="date"
                        id="date_emission"
                        value={newFacture.date_emission}
                        onChange={(e) => setNewFacture({...newFacture, date_emission: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="date_echeance" className="block text-sm font-medium text-gray-700">Date d'échéance *</label>
                      <input
                        type="date"
                        id="date_echeance"
                        value={newFacture.date_echeance}
                        onChange={(e) => setNewFacture({...newFacture, date_echeance: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="montant_ht" className="block text-sm font-medium text-gray-700">Montant HT *</label>
                      <input
                        type="number"
                        id="montant_ht"
                        value={newFacture.montant_ht}
                        onChange={(e) => setNewFacture({...newFacture, montant_ht: e.target.value})}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="taux_tva" className="block text-sm font-medium text-gray-700">Taux TVA (%)</label>
                      <input
                        type="number"
                        id="taux_tva"
                        value={newFacture.taux_tva}
                        onChange={(e) => setNewFacture({...newFacture, taux_tva: e.target.value})}
                        step="0.1"
                        min="0"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      id="statut"
                      value={newFacture.statut}
                      onChange={(e) => setNewFacture({...newFacture, statut: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="envoyée">Envoyée</option>
                      <option value="payée">Payée</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
