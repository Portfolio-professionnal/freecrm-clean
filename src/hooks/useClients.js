"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Récupérer tous les clients
  const fetchClients = async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("nom", { ascending: true });
      
      if (error) throw error;
      
      setClients(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement des clients:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un client par ID
  const fetchClient = async (id) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors du chargement du client:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau client
  const createClient = async (clientData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newClient = {
        ...clientData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("clients")
        .insert([newClient])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Client créé avec succès");
      setClients(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un client
  const updateClient = async (id, updates) => {
    if (!user || !id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Client mis à jour avec succès");
      setClients(prev => prev.map(client => client.id === id ? data : client));
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un client
  const deleteClient = async (id) => {
    if (!user || !id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast.success("Client supprimé avec succès");
      setClients(prev => prev.filter(client => client.id !== id));
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
    clients,
    loading,
    error,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient
  };
}
