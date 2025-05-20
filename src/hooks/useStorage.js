'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export function useStorage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Télécharger un fichier dans le stockage Supabase
  const uploadFile = async (file, path) => {
    if (!user || !file) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Déterminer le chemin de stockage
      const filePath = path || `${user.id}/${Math.random().toString(36).substring(2)}/${file.name}`;
      
      // Télécharger le fichier
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      
      toast.success('Fichier téléchargé avec succès !');
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur lors du téléchargement du fichier: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Télécharger une facture (avec un chemin spécifique)
  const uploadInvoice = async (file, factureId) => {
    if (!factureId) {
      toast.error('ID de facture requis pour télécharger un fichier');
      return null;
    }
    
    // Construire le chemin pour les factures
    const path = `${user.id}/factures/${factureId}/${file.name}`;
    return uploadFile(file, path);
  };

  // Récupérer l'URL publique d'un fichier
  const getPublicUrl = (path) => {
    if (!path) return null;
    
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'URL publique:', err);
      return null;
    }
  };

  // Lister les fichiers dans un dossier
  const listFiles = async (folder) => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      // Déterminer le chemin du dossier
      const path = folder || `${user.id}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .list(path);
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la liste des fichiers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Télécharger un fichier
  const downloadFile = async (path) => {
    if (!user || !path) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(path);
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur lors du téléchargement du fichier: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un fichier
  const deleteFile = async (path) => {
    if (!user || !path) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([path]);
      
      if (error) throw error;
      
      toast.success('Fichier supprimé avec succès !');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur lors de la suppression du fichier: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadFile,
    uploadInvoice,
    getPublicUrl,
    listFiles,
    downloadFile,
    deleteFile
  };
}