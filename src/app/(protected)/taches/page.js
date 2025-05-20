"use client";

import { useEffect, useState } from "react";
import { useTaches } from "@/hooks/useTaches";
import { useClients } from "@/hooks/useClients";
import { useProspects } from "@/hooks/useProspects";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import SearchSelect from "@/components/ui/SearchSelect";
import SearchBar from "@/components/ui/SearchBar";

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
  const [filter, setFilter] = useState("all");
  const [filteredTaches, setFilteredTaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchTaches();
      fetchClients();
      fetchProspects();
    }
  }, [user]);

  // Appliquer le filtre et la recherche lorsque les tâches changent
  useEffect(() => {
    applyFiltersAndSearch();
  }, [taches, filter, searchTerm]);

  const applyFiltersAndSearch = () => {
    let filtered = [...taches];
    
    // Appliquer le filtre par statut/date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    switch (filter) {
      case "today":
        filtered = filtered.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === today.getTime();
        });
        break;
      case "week":
        filtered = filtered.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() >= today.getTime() && date.getTime() <= nextWeek.getTime();
        });
        break;
      case "overdue":
        filtered = filtered.filter(tache => {
          const date = new Date(tache.date_echeance);
          date.setHours(0, 0, 0, 0);
          return date.getTime() < today.getTime() && tache.statut !== "terminée";
        });
        break;
    }
    
    // Appliquer la recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tache => 
        tache.titre.toLowerCase().includes(term) ||
        (tache.description && tache.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredTaches(filtered);
  };

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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleMarkAsDone = async (id) => {
    await markAsDone(id);
  };

  const handleDeleteTache = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      await deleteTache(id);
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

  // Préparer les options pour les clients et prospects pour le SearchSelect
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.nom
  }));
  
  const prospectOptions = prospects.map(prospect => ({
    value: prospect.id,
    label: prospect.nom
  }));

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
        {/* Barre de recherche */}
        <SearchBar onSearch={handleSearch} placeholder="Rechercher une tâche..." />
        
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
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            En retard
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : filteredTaches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {taches.length === 0 
                ? "Vous n'avez pas encore de tâches." 
                : "Aucune tâche ne correspond à vos critères."}
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter une tâche
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTaches.map(tache => (
                <li key={tache.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={tache.statut === "terminée"}
                        onChange={() => handleMarkAsDone(tache.id)}
                      />
                      <div className="ml-3 flex flex-col">
                        <span className={`text-lg font-medium ${tache.statut === "terminée" ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {tache.titre}
                        </span>
                        {tache.description && (
                          <span className="text-sm text-gray-500">{tache.description}</span>
                        )}
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-2">Échéance: {formatDate(tache.date_echeance)}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tache.priorite)}`}>
                            {tache.priorite.charAt(0).toUpperCase() + tache.priorite.slice(1)}
                          </span>
                          {tache.client_id && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Client: {clients.find(c => c.id === tache.client_id)?.nom || "Inconnu"}
                            </span>
                          )}
                          {tache.prospect_id && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Prospect: {prospects.find(p => p.id === tache.prospect_id)?.nom || "Inconnu"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteTache(tache.id)}
                        className="ml-2 text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal pour créer une tâche */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
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
                      rows={3}
                      value={newTache.description}
                      onChange={(e) => setNewTache({...newTache, description: e.target.value})}
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
                    <label className="block text-sm font-medium text-gray-700">Lié à un client</label>
                    <div className="mt-1">
                      <SearchSelect
                        options={clientOptions}
                        value={newTache.client_id}
                        onChange={(value) => {
                          setNewTache({
                            ...newTache, 
                            client_id: value,
                            // Désélectionner le prospect si un client est sélectionné
                            prospect_id: value ? null : newTache.prospect_id
                          });
                        }}
                        placeholder="Sélectionner un client (optionnel)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lié à un prospect</label>
                    <div className="mt-1">
                      <SearchSelect
                        options={prospectOptions}
                        value={newTache.prospect_id}
                        onChange={(value) => {
                          setNewTache({
                            ...newTache,
                            prospect_id: value,
                            // Désélectionner le client si un prospect est sélectionné
                            client_id: value ? null : newTache.client_id
                          });
                        }}
                        placeholder="Sélectionner un prospect (optionnel)"
                        disabled={newTache.client_id !== null}
                      />
                    </div>
                    {newTache.client_id && (
                      <p className="mt-1 text-sm text-gray-500">Le prospect ne peut pas être sélectionné si un client est déjà associé.</p>
                    )}
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
