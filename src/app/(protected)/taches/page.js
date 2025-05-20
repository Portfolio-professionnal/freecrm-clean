"use client";

import { useEffect, useState } from "react";
import { useTaches } from "@/hooks/useTaches";
import { useClients } from "@/hooks/useClients";
import { useProspects } from "@/hooks/useProspects";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function TachesPage() {
  const { user } = useAuth();
  const { taches, loading, fetchTaches, createTache, markAsDone, deleteTache } = useTaches();
  const { clients, fetchClients } = useClients();
  const { prospects, fetchProspects } = useProspects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTache, setNewTache] = useState({
    titre: "",
    description: "",
    date_echeance: new Date().toISOString().split("T")[0],
    priorite: "moyenne",
    statut: "à faire",
    client_id: null,
    prospect_id: null
  });
  const [filter, setFilter] = useState("all"); // "all", "today", "week", "overdue"

  useEffect(() => {
    if (user) {
      fetchTaches();
      fetchClients();
      fetchProspects();
    }
  }, [user]);

  const handleCreateTache = async (e) => {
    e.preventDefault();
    if (!newTache.titre || !newTache.date_echeance) return;

    await createTache(newTache);
    setNewTache({
      titre: "",
      description: "",
      date_echeance: new Date().toISOString().split("T")[0],
      priorite: "moyenne",
      statut: "à faire",
      client_id: null,
      prospect_id: null
    });
    setIsModalOpen(false);
  };

  const handleMarkAsDone = async (id) => {
    await markAsDone(id);
  };

  const handleDeleteTache = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      await deleteTache(id);
    }
  };

  // Fonction pour filtrer les tâches
  const filteredTaches = () => {
    if (!taches.length) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    switch (filter) {
      case "today":
        return taches.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === today.getTime();
        });
      case "week":
        return taches.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() >= today.getTime() && date.getTime() <= nextWeek.getTime();
        });
      case "overdue":
        return taches.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() < today.getTime() && tache.statut !== "terminée";
        });
      default:
        return taches;
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    const priorityColors = {
      "basse": "bg-blue-100 text-blue-800",
      "moyenne": "bg-yellow-100 text-yellow-800",
      "haute": "bg-orange-100 text-orange-800",
      "urgente": "bg-red-100 text-red-800"
    };
    return priorityColors[priority] || "bg-gray-100 text-gray-800";
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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
                <Link href="/taches" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tâches</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Nouvelle tâche
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
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "today" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "week" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cette semaine
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
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : filteredTaches().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucune tâche trouvée pour ce filtre.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer une tâche
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTaches().map((tache) => (
                <li key={tache.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={tache.statut === "terminée"}
                          onChange={() => tache.statut !== "terminée" && handleMarkAsDone(tache.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <p className={`ml-3 text-sm font-medium ${tache.statut === "terminée" ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {tache.titre}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(tache.priorite)}`}>
                          {tache.priorite}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {(tache.client || tache.prospect) && (
                          <p className="flex items-center text-sm text-gray-500">
                            {tache.client ? (
                              <span>Client: {tache.client.nom}</span>
                            ) : (
                              <span>Prospect: {tache.prospect.nom}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Échéance: {formatDate(tache.date_echeance)}
                        </p>
                        <button
                          onClick={() => handleDeleteTache(tache.id)}
                          className="ml-4 text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal pour créer une tâche */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Créer une nouvelle tâche</h3>
                <form onSubmit={handleCreateTache} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre *</label>
                    <input
                      type="text"
                      id="titre"
                      value={newTache.titre}
                      onChange={(e) => setNewTache({...newTache, titre: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      value={newTache.description}
                      onChange={(e) => setNewTache({...newTache, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="date_echeance" className="block text-sm font-medium text-gray-700">Date d'échéance *</label>
                    <input
                      type="date"
                      id="date_echeance"
                      value={newTache.date_echeance}
                      onChange={(e) => setNewTache({...newTache, date_echeance: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="priorite" className="block text-sm font-medium text-gray-700">Priorité</label>
                    <select
                      id="priorite"
                      value={newTache.priorite}
                      onChange={(e) => setNewTache({...newTache, priorite: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Client associé</label>
                    <select
                      id="client_id"
                      value={newTache.client_id || ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setNewTache({...newTache, client_id: value, prospect_id: null});
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Aucun client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prospect_id" className="block text-sm font-medium text-gray-700">Prospect associé</label>
                    <select
                      id="prospect_id"
                      value={newTache.prospect_id || ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setNewTache({...newTache, prospect_id: value, client_id: null});
                      }}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={newTache.client_id !== null}
                    >
                      <option value="">Aucun prospect</option>
                      {prospects.map(prospect => (
                        <option key={prospect.id} value={prospect.id}>{prospect.nom}</option>
                      ))}
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
