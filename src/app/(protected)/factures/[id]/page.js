"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFactures } from "@/hooks/useFactures";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function FactureDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const factureId = params.id;
  
  const { fetchFacture, updateFacture, deleteFacture, markAsSent, markAsPaid } = useFactures();
  
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user || !factureId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const factureData = await fetchFacture(factureId);
        
        if (!factureData) {
          throw new Error("Facture non trouvée");
        }
        
        setFacture(factureData);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, factureId]);
  
  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.")) {
      try {
        await deleteFacture(factureId);
        router.push("/factures");
      } catch (err) {
        console.error("Erreur lors de la suppression de la facture:", err);
      }
    }
  };
  
  const handleMarkAsSent = async () => {
    try {
      const updatedFacture = await markAsSent(factureId);
      setFacture(updatedFacture);
    } catch (err) {
      console.error("Erreur lors du marquage de la facture comme envoyée:", err);
    }
  };
  
  const handleMarkAsPaid = async () => {
    try {
      const updatedFacture = await markAsPaid(factureId);
      setFacture(updatedFacture);
    } catch (err) {
      console.error("Erreur lors du marquage de la facture comme payée:", err);
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push("/factures")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Retour à la liste des factures
          </button>
        </div>
      </div>
    );
  }
  
  if (!facture) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facture non trouvée</h2>
          <p className="text-gray-700 mb-4">La facture que vous recherchez n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => router.push("/factures")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Retour à la liste des factures
          </button>
        </div>
      </div>
    );
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

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/factures")}
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              &larr; Retour aux factures
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Facture {facture.numero}</h1>
            <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
              facture.statut === "payée" ? "bg-green-100 text-green-800" :
              facture.statut === "en retard" ? "bg-red-100 text-red-800" :
              facture.statut === "envoyée" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {facture.statut}
            </span>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Détails de la facture</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Informations et montants</p>
              </div>
              <div className="space-x-2">
                {facture.statut === "brouillon" && (
                  <button
                    onClick={handleMarkAsSent}
                    className="bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700"
                  >
                    Marquer comme envoyée
                  </button>
                )}
                {(facture.statut === "envoyée" || facture.statut === "en retard") && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="bg-green-600 text-white py-1 px-4 rounded-md hover:bg-green-700"
                  >
                    Marquer comme payée
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {facture.client ? (
                      <Link href={`/clients/${facture.client.id}`} className="text-blue-600 hover:text-blue-800">
                        {facture.client.nom}
                      </Link>
                    ) : "Client inconnu"}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Numéro de facture</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{facture.numero}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date d'émission</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(facture.date_emission)}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date d'échéance</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(facture.date_echeance)}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Montant HT</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatMontant(facture.montant_ht)}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Taux TVA</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{facture.taux_tva} %</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Montant TVA</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatMontant(facture.montant_ttc - facture.montant_ht)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Montant TTC</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatMontant(facture.montant_ttc)}
                  </dd>
                </div>
                {facture.statut === "payée" && facture.date_paiement && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Date de paiement</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(facture.date_paiement)}</dd>
                  </div>
                )}
                {facture.conditions_paiement && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Conditions de paiement</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{facture.conditions_paiement}</dd>
                  </div>
                )}
                {facture.notes && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{facture.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => window.print()}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Imprimer / PDF
            </button>
            <Link
              href={`/factures/duplicate/${factureId}`}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Dupliquer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
