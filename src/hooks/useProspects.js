"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

export function useProspects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Récupérer tous les prospects
  const fetchProspects = async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setProspects(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement des prospects:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un prospect par ID
  const fetchProspect = async (id) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement du prospect:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau prospect
  const createProspect = async (prospectData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProspect = {
        ...prospectData,
        user_id: user.id,
        statut: prospectData.statut || "nouveau",
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("prospects")
        .insert([newProspect])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Prospect créé avec succès");
      setProspects(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un prospect
  const updateProspect = async (id, updates) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("prospects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Prospect mis à jour avec succès");
      setProspects(prev => prev.map(prospect => prospect.id === id ? data : prospect));
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Convertir un prospect en client
  const convertToClient = async (id) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer d'abord les données du prospect
      const { data: prospect, error: prospectError } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
        
      if (prospectError) throw prospectError;
      
      // Créer un nouveau client à partir du prospect
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert([{
          nom: prospect.nom,
          email: prospect.email,
          telephone: prospect.telephone,
          adresse: prospect.adresse,
          notes: prospect.notes,
          user_id: user.id,
          prospect_id: prospect.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (clientError) throw clientError;
      
      // Mettre à jour le prospect (statut converti + lien vers client)
      const { error: updateError } = await supabase
        .from("prospects")
        .update({ 
          statut: "converti", 
          client_id: client.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (updateError) throw updateError;
      
      toast.success("Prospect converti en client avec succès");
      
      // Mettre à jour la liste des prospects
      setProspects(prev => prev.map(p => 
        p.id === id ? { ...p, statut: "converti", client_id: client.id } : p
      ));
      
      return client;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur lors de la conversion: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un prospect
  const deleteProspect = async (id) => {
    if (!user || !id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("prospects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("Prospect supprimé avec succès");
      setProspects(prev => prev.filter(prospect => prospect.id !== id));
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
    prospects,
    loading,
    error,
    fetchProspects,
    fetchProspect,
    createProspect,
    updateProspect,
    convertToClient,
    deleteProspect
  };
}
