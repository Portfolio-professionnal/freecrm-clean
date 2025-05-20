"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

export function useTaches() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Récupérer toutes les tâches
  const fetchTaches = async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Récupération des tâches pour l'utilisateur:", user.id);
      
      // Requête simplifiée - sans les jointures
      const { data, error } = await supabase
        .from("taches")
        .select("*")
        .eq("user_id", user.id)
        .order("date_echeance", { ascending: true });
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      console.log("Tâches récupérées:", data);
      setTaches(data || []);
      return data || [];
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(err.message);
      toast.error(`Erreur lors du chargement des tâches: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les tâches en retard
  const fetchTachesEnRetard = async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Récupération des tâches en retard pour l'utilisateur:", user.id);
      
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      console.log("Date d'aujourd'hui pour filtrage:", today);
      
      const { data, error } = await supabase
        .from("taches")
        .select("*")
        .eq("user_id", user.id)
        .neq("statut", "terminée")
        .lt("date_echeance", today);
      
      if (error) {
        console.error("Erreur Supabase pour les tâches en retard:", error);
        throw error;
      }
      
      console.log("Tâches en retard récupérées:", data);
      return data || [];
    } catch (err) {
      console.error("Erreur lors du chargement des tâches en retard:", err);
      // Ne pas bloquer avec une erreur, retourner simplement un tableau vide
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle tâche
  const createTache = async (tacheData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newTache = {
        ...tacheData,
        user_id: user.id,
        statut: tacheData.statut || "à faire",
        created_at: new Date().toISOString()
      };
      
      console.log("Création d'une tâche:", newTache);
      
      const { data, error } = await supabase
        .from("taches")
        .insert([newTache])
        .select();
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      toast.success("Tâche créée avec succès");
      setTaches(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une tâche
  const updateTache = async (id, updates) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("taches")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();
      
      if (error) throw error;
      
      toast.success("Tâche mise à jour avec succès");
      setTaches(prev => prev.map(tache => tache.id === id ? data[0] : tache));
      return data[0];
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Marquer une tâche comme terminée
  const markAsDone = async (id) => {
    return updateTache(id, { 
      statut: "terminée", 
      date_terminee: new Date().toISOString() 
    });
  };

  // Supprimer une tâche
  const deleteTache = async (id) => {
    if (!user || !id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("taches")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("Tâche supprimée avec succès");
      setTaches(prev => prev.filter(tache => tache.id !== id));
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
    taches,
    loading,
    error,
    fetchTaches,
    fetchTachesEnRetard,
    createTache,
    updateTache,
    markAsDone,
    deleteTache
  };
}
