"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFactures } from "@/hooks/useFactures";
import { useTaches } from "@/hooks/useTaches";
import { useProspects } from "@/hooks/useProspects";
import { useClients } from "@/hooks/useClients";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { fetchChiffreAffaires } = useFactures();
  const { fetchTachesEnRetard } = useTaches();
  const { fetchProspects } = useProspects();
  const { fetchClients } = useClients();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    chiffreAffaires: { total: 0, encaisse: 0, enAttente: 0, enRetard: 0 },
    tachesEnRetard: [],
    prospects: [],
    clients: []
  });
  // État pour gérer la redirection
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Gérer la redirection si l'utilisateur n'est pas connecté
    if (!user && shouldRedirect) {
      router.push("/login");
    }
  }, [user, shouldRedirect, router]);

  useEffect(() => {
    if (!user) {
      setShouldRedirect(true);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Charger les données en parallèle
        const [ca, tachesEnRetard, prospects, clients] = await Promise.all([
          fetchChiffreAffaires('mois'),
          fetchTachesEnRetard(),
          fetchProspects(),
          fetchClients()
        ]);
        
        setStats({
          chiffreAffaires: ca,
          tachesEnRetard,
          prospects,
          clients
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  if (!user) {
    return <div>Chargement...</div>; // N'essayez plus de rediriger ici
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
                <Link href="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
                <Link href="/factures" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Factures
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tableau de bord</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* KPI financiers */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance financière du mois</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Chiffre d'affaires */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Chiffre d'affaires</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatMontant(stats.chiffreAffaires.total)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Montant encaissé */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Montant encaissé</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatMontant(stats.chiffreAffaires.encaisse)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Montant en attente */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatMontant(stats.chiffreAffaires.enAttente)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Montant en retard */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">En retard</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatMontant(stats.chiffreAffaires.enRetard)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tâches en retard */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tâches en retard</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {stats.tachesEnRetard.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                Aucune tâche en retard
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats.tachesEnRetard.slice(0, 5).map(tache => (
                  <li key={tache.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-600 truncate">{tache.titre}</p>
                          <p className="text-sm text-gray-500">
                            Échéance: {formatDate(tache.date_echeance)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          En retard
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {stats.tachesEnRetard.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                <Link href="/taches" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Voir toutes les tâches
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Derniers clients et prospects */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Derniers clients */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Derniers clients</h3>
            </div>
            {stats.clients.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                Aucun client
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats.clients.slice(0, 5).map(client => (
                  <li key={client.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/clients/${client.id}`} className="block">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-600 truncate">{client.nom}</p>
                          {client.email && (
                            <p className="text-sm text-gray-500 truncate">{client.email}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <Link href="/clients" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Voir tous les clients
              </Link>
            </div>
          </div>

          {/* Derniers prospects */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Derniers prospects</h3>
            </div>
            {stats.prospects.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                Aucun prospect
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {stats.prospects.slice(0, 5).map(prospect => (
                  <li key={prospect.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={`/prospects/${prospect.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-600 truncate">{prospect.nom}</p>
                          {prospect.email && (
                            <p className="text-sm text-gray-500 truncate">{prospect.email}</p>
                          )}
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${prospect.statut === "nouveau" ? "bg-blue-100 text-blue-800" : 
                            prospect.statut === "contacté" ? "bg-yellow-100 text-yellow-800" :
                            prospect.statut === "en discussion" ? "bg-purple-100 text-purple-800" :
                            prospect.statut === "proposition" ? "bg-indigo-100 text-indigo-800" :
                            prospect.statut === "converti" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"}`}>
                            {prospect.statut}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <Link href="/prospects" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Voir tous les prospects
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
