"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

export function useFactures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Récupérer toutes les factures
  const fetchFactures = async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("factures")
        .select(`
          *,
          client:client_id(id, nom)
        `)
        .eq("user_id", user.id)
        .order("date_emission", { ascending: false });
      
      if (error) throw error;
      
      // Mise à jour des factures en retard
      const updatedData = data.map(facture => {
        if (facture.statut === "envoyée") {
          const dateEcheance = new Date(facture.date_echeance);
          const today = new Date();
          
          if (dateEcheance < today) {
            return { ...facture, statut: "en retard" };
          }
        }
        return facture;
      });
      
      setFactures(updatedData || []);
      return updatedData;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement des factures:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une facture par ID
  const fetchFacture = async (id) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("factures")
        .select(`
          *,
          client:client_id(id, nom, email, adresse, telephone)
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      
      // Vérifier si la facture est en retard
      if (data.statut === "envoyée") {
        const dateEcheance = new Date(data.date_echeance);
        const today = new Date();
        
        if (dateEcheance < today) {
          data.statut = "en retard";
        }
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement de la facture:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calculer le chiffre d'affaires
  const fetchChiffreAffaires = async (periode = 'mois') => {
    if (!user) return { total: 0, encaisse: 0, enAttente: 0, enRetard: 0 };
    
    setLoading(true);
    setError(null);
    
    try {
      let dateMin;
      const now = new Date();
      
      // Définir la période
      switch (periode) {
        case 'annee':
          dateMin = new Date(now.getFullYear(), 0, 1);
          break;
        case 'trimestre':
          dateMin = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'mois':
        default:
          dateMin = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      const { data, error } = await supabase
        .from("factures")
        .select("*")
        .eq("user_id", user.id)
        .gte("date_emission", dateMin.toISOString());
      
      if (error) throw error;
      
      // Calculer les totaux
      const result = {
        total: 0,
        encaisse: 0,
        enAttente: 0,
        enRetard: 0
      };
      
      if (data) {
        data.forEach(facture => {
          const montant = parseFloat(facture.montant_ttc || 0);
          result.total += montant;
          
          // Vérifier si la facture est en retard
          let statut = facture.statut;
          if (statut === "envoyée") {
            const dateEcheance = new Date(facture.date_echeance);
            const today = new Date();
            
            if (dateEcheance < today) {
              statut = "en retard";
            }
          }
          
          if (statut === "payée") {
            result.encaisse += montant;
          } else if (statut === "en retard") {
            result.enRetard += montant;
          } else {
            result.enAttente += montant;
          }
        });
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du calcul du chiffre d'affaires:", err);
      return { total: 0, encaisse: 0, enAttente: 0, enRetard: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle facture
  const createFacture = async (factureData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calcul du montant TTC si nécessaire
      let montantTTC = factureData.montant_ttc;
      if (!montantTTC && factureData.montant_ht) {
        const tva = factureData.taux_tva || 20;
        montantTTC = factureData.montant_ht * (1 + tva / 100);
      }
      
      const newFacture = {
        ...factureData,
        montant_ttc: montantTTC,
        user_id: user.id,
        statut: factureData.statut || "brouillon",
        date_emission: factureData.date_emission || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from("factures")
        .insert([newFacture])
        .select(`
          *,
          client:client_id(id, nom)
        `)
        .single();
      
      if (error) throw error;
      
      toast.success("Facture créée avec succès");
      setFactures(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une facture
  const updateFacture = async (id, updates) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calcul du montant TTC si nécessaire
      let montantTTC = updates.montant_ttc;
      if (!montantTTC && updates.montant_ht) {
        const tva = updates.taux_tva || 20;
        montantTTC = updates.montant_ht * (1 + tva / 100);
        updates.montant_ttc = montantTTC;
      }
      
      const { data, error } = await supabase
        .from("factures")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          client:client_id(id, nom)
        `)
        .single();
      
      if (error) throw error;
      
      toast.success("Facture mise à jour avec succès");
      setFactures(prev => prev.map(facture => facture.id === id ? data : facture));
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Marquer une facture comme envoyée
  const markAsSent = async (id) => {
    return updateFacture(id, { 
      statut: "envoyée", 
      date_envoi: new Date().toISOString() 
    });
  };

  // Marquer une facture comme payée
  const markAsPaid = async (id) => {
    return updateFacture(id, { 
      statut: "payée", 
      date_paiement: new Date().toISOString() 
    });
  };

  // Supprimer une facture
  const deleteFacture = async (id) => {
    if (!user || !id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("factures")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("Facture supprimée avec succès");
      setFactures(prev => prev.filter(facture => facture.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    factures,
    loading,
    error,
    fetchFactures,
    fetchFacture,
    fetchChiffreAffaires,
    createFacture,
    updateFacture,
    markAsSent,
    markAsPaid,
    deleteFacture
  };
}
