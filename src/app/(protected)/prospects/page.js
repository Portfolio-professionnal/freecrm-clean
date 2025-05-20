"use client";

import { useEffect, useState } from "react";
import { useProspects } from "@/hooks/useProspects";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProspectsPage() {
  const { user } = useAuth();
  const { prospects, loading, error, fetchProspects, createProspect, deleteProspect, convertToClient } = useProspects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProspect, setNewProspect] = useState({ 
    nom: "", 
    email: "", 
    telephone: "",
    statut: "nouveau" 
  });
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchProspects();
    }
  }, [user]);

  const handleCreateProspect = async (e) => {
    e.preventDefault();
    if (!newProspect.nom) return;

    await createProspect(newProspect);
    setNewProspect({ nom: "", email: "", telephone: "", statut: "nouveau" });
    setIsModalOpen(false);
  };

  const handleDeleteProspect = async (id, e) => {
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) {
      await deleteProspect(id);
    }
  };

  const handleConvertToClient = async (id, e) => {
    e.stopPropagation();
    if (confirm("Convertir ce prospect en client ?")) {
      const client = await convertToClient(id);
      if (client) {
        router.push(`/clients/${client.id}`);
      }
    }
  };

  // Fonction pour obtenir la couleur du badge de statut
  const getStatusColor = (status) => {
    const statusColors = {
      "nouveau": "bg-blue-100 text-blue-800",
      "contacté": "bg-yellow-100 text-yellow-800",
      "en discussion": "bg-purple-100 text-purple-800",
      "proposition": "bg-indigo-100 text-indigo-800",
      "converti": "bg-green-100 text-green-800",
      "perdu": "bg-red-100 text-red-800"
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
                <Link href="/prospects" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Prospects
                </Link>
                <Link href="/taches" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Tâches
                </Link>
                <Link href="/factures" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Factures
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Prospects</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Nouveau prospect
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            Erreur: {error}
          </div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de prospects.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter un prospect
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prospects.map(prospect => (
              <div 
                key={prospect.id} 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md"
                onClick={() => router.push(`/prospects/${prospect.id}`)}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{prospect.nom}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.statut)}`}>
                      {prospect.statut}
                    </span>
                  </div>
                  {prospect.email && <p className="mt-1 text-sm text-gray-500">{prospect.email}</p>}
                  {prospect.telephone && <p className="mt-1 text-sm text-gray-500">{prospect.telephone}</p>}
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
                  {prospect.statut !== "converti" && prospect.statut !== "perdu" && (
                    <button
                      onClick={(e) => handleConvertToClient(prospect.id, e)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Convertir en client
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteProspect(prospect.id, e)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal pour créer un prospect */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Créer un nouveau prospect</h3>
                <form onSubmit={handleCreateProspect} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom / Société *</label>
                    <input
                      type="text"
                      id="nom"
                      value={newProspect.nom}
                      onChange={(e) => setNewProspect({...newProspect, nom: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={newProspect.email}
                      onChange={(e) => setNewProspect({...newProspect, email: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="text"
                      id="telephone"
                      value={newProspect.telephone}
                      onChange={(e) => setNewProspect({...newProspect, telephone: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      id="statut"
                      value={newProspect.statut}
                      onChange={(e) => setNewProspect({...newProspect, statut: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="contacté">Contacté</option>
                      <option value="en discussion">En discussion</option>
                      <option value="proposition">Proposition</option>
                      <option value="perdu">Perdu</option>
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
