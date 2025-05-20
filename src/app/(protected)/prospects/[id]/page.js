"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProspects } from "@/hooks/useProspects";
import { useTaches } from "@/hooks/useTaches";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function ProspectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const prospectId = params.id;
  
  const { fetchProspect, updateProspect, deleteProspect, convertToClient } = useProspects();
  const { fetchTaches, createTache } = useTaches();
  
  const [prospect, setProspect] = useState(null);
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    statut: "",
    source: "",
    notes: ""
  });
  
  const [isNewTacheModalOpen, setIsNewTacheModalOpen] = useState(false);
  const [newTache, setNewTache] = useState({
    titre: "",
    description: "",
    date_echeance: new Date().toISOString().split("T")[0],
    priorite: "moyenne",
    statut: "à faire"
  });

  useEffect(() => {
    if (!user || !prospectId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les données du prospect et des tâches en parallèle
        const prospectPromise = fetchProspect(prospectId);
        const tachesPromise = fetchTaches();
        
        const [prospectData, allTaches] = await Promise.all([
          prospectPromise,
          tachesPromise
        ]);
        
        if (!prospectData) {
          throw new Error("Prospect non trouvé");
        }
        
        setProspect(prospectData);
        setFormData({
          nom: prospectData.nom || "",
          email: prospectData.email || "",
          telephone: prospectData.telephone || "",
          adresse: prospectData.adresse || "",
          statut: prospectData.statut || "nouveau",
          source: prospectData.source || "",
          notes: prospectData.notes || ""
        });
        
        // Filtrer les tâches pour ce prospect
        const prospectTaches = allTaches.filter(tache => tache.prospect_id === parseInt(prospectId));
        setTaches(prospectTaches);
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, prospectId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedProspect = await updateProspect(prospectId, formData);
      setProspect(updatedProspect);
      setIsEditMode(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du prospect:", err);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce prospect ? Cette action est irréversible.")) {
      try {
        await deleteProspect(prospectId);
        router.push("/prospects");
      } catch (err) {
        console.error("Erreur lors de la suppression du prospect:", err);
      }
    }
  };
  
  const handleConvert = async () => {
    if (window.confirm("Convertir ce prospect en client ?")) {
      try {
        const client = await convertToClient(prospectId);
        if (client) {
          router.push(`/clients/${client.id}`);
        }
      } catch (err) {
        console.error("Erreur lors de la conversion du prospect:", err);
      }
    }
  };
  
  const handleCreateTache = async (e) => {
    e.preventDefault();
    
    try {
      const tacheData = {
        ...newTache,
        prospect_id: parseInt(prospectId)
      };
      
      const createdTache = await createTache(tacheData);
      
      setTaches([...taches, createdTache]);
      setIsNewTacheModalOpen(false);
      setNewTache({
        titre: "",
        description: "",
        date_echeance: new Date().toISOString().split("T")[0],
        priorite: "moyenne",
        statut: "à faire"
      });
    } catch (err) {
      console.error("Erreur lors de la création de la tâche:", err);
    }
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Fonction pour obtenir la couleur du statut
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
            onClick={() => router.push("/prospects")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Retour à la liste des prospects
          </button>
        </div>
      </div>
    );
  }
  
  if (!prospect) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prospect non trouvé</h2>
          <p className="text-gray-700 mb-4">Le prospect que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push("/prospects")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Retour à la liste des prospects
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

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/prospects")}
              className="text-blue-600 hover:text-blue-800 mr-4"
            >
              &larr; Retour aux prospects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{prospect.nom}</h1>
            <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.statut)}`}>
              {prospect.statut}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informations du prospect */}
            <div className="md:col-span-2">
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Informations du prospect</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Coordonnées et détails</p>
                  </div>
                  <div>
                    {isEditMode ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditMode(false)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          form="edit-form"
                          className="bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700"
                        >
                          Enregistrer
                        </button>
                      </div>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={handleDelete}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  {isEditMode ? (
                    <form id="edit-form" onSubmit={handleSubmit}>
                      <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom / Société</label>
                            <input
                              type="text"
                              name="nom"
                              id="nom"
                              value={formData.nom}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input
                              type="text"
                              name="telephone"
                              id="telephone"
                              value={formData.telephone}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select
                              id="statut"
                              name="statut"
                              value={formData.statut}
                              onChange={handleInputChange}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="nouveau">Nouveau</option>
                              <option value="contacté">Contacté</option>
                              <option value="en discussion">En discussion</option>
                              <option value="proposition">Proposition</option>
                              <option value="converti">Converti</option>
                              <option value="perdu">Perdu</option>
                            </select>
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
                            <input
                              type="text"
                              name="source"
                              id="source"
                              value={formData.source}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="col-span-6">
                            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                            <textarea
                              name="adresse"
                              id="adresse"
                              rows={3}
                              value={formData.adresse}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="col-span-6">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                              name="notes"
                              id="notes"
                              rows={4}
                              value={formData.notes}
                              onChange={handleInputChange}
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Nom / Société</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{prospect.nom}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {prospect.email || "—"}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {prospect.telephone || "—"}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                          {prospect.adresse || "—"}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Statut</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.statut)}`}>
                            {prospect.statut}
                          </span>
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Source</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {prospect.source || "—"}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                          {prospect.notes || "—"}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div>
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Actions</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl>
                    <div className="flex justify-between py-3 text-sm">
                      <dt className="text-gray-500">Prospect depuis</dt>
                      <dd className="text-gray-900">{formatDate(prospect.created_at)}</dd>
                    </div>
                    <div className="flex justify-between py-3 text-sm border-t border-gray-200">
                      <dt className="text-gray-500">Tâches en cours</dt>
                      <dd className="text-gray-900">{taches.filter(tache => tache.statut !== "terminée").length}</dd>
                    </div>
                  </dl>
                </div>
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                  <div className="flex flex-col space-y-3">
                    {prospect.statut !== "converti" && prospect.statut !== "perdu" && (
                      <button
                        onClick={handleConvert}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Convertir en client
                      </button>
                    )}
                    <button
                      onClick={() => setIsNewTacheModalOpen(true)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Nouvelle tâche
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Tâches */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Tâches</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {taches.length === 0 ? "Aucune tâche" : `${taches.length} tâche(s)`}
                  </p>
                </div>
                <button
                  onClick={() => setIsNewTacheModalOpen(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Ajouter
                </button>
              </div>
              <div className="border-t border-gray-200">
                {taches.length === 0 ? (
                  <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                    Aucune tâche pour ce prospect
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {taches.map(tache => (
                      <li key={tache.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tache.statut === "terminée"}
                              readOnly
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <p className={`ml-3 text-sm font-medium ${tache.statut === "terminée" ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {tache.titre}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {formatDate(tache.date_echeance)}
                            </span>
                          </div>
                        </div>
                        {tache.description && (
                          <p className="mt-2 text-sm text-gray-500 ml-7">
                            {tache.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal pour créer une tâche */}
      {isNewTacheModalOpen && (
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
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsNewTacheModalOpen(false)}
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
    </div>
  );
}
