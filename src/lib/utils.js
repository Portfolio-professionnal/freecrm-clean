import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Parce que la manipulation de dates en JS, c'est comme assembler un meuble IKEA sans notice
export const formatDate = (date) => {
  if (!date) return 'Date inconnue';
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

export const formatDateTime = (date) => {
  if (!date) return 'Date inconnue';
  return format(new Date(date), 'dd/MM/yyyy à HH:mm', { locale: fr });
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
};

// Formater les montants en euros, parce que les freelances adorent les euros
export const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(montant || 0);
};

// Statuts pour les tâches, factures, etc.
export const STATUT_TACHE = {
  A_FAIRE: 'à faire',
  EN_COURS: 'en cours',
  TERMINEE: 'terminée',
};

export const STATUT_FACTURE = {
  BROUILLON: 'brouillon',
  ENVOYEE: 'envoyée',
  PAYEE: 'payée',
  EN_RETARD: 'en retard',
};

export const STATUT_PROSPECT = {
  NOUVEAU: 'nouveau',
  CONTACTE: 'contacté',
  EN_DISCUSSION: 'en discussion',
  PROPOSITION: 'proposition',
  CONVERTI: 'converti',
  PERDU: 'perdu',
};

// Générer une couleur pour les statuts
export const getStatusColor = (status) => {
  const colorMap = {
    // Tâches
    'à faire': 'bg-blue-100 text-blue-800',
    'en cours': 'bg-yellow-100 text-yellow-800',
    'terminée': 'bg-green-100 text-green-800',
    
    // Factures
    'brouillon': 'bg-gray-100 text-gray-800',
    'envoyée': 'bg-blue-100 text-blue-800',
    'payée': 'bg-green-100 text-green-800',
    'en retard': 'bg-red-100 text-red-800',
    
    // Prospects
    'nouveau': 'bg-purple-100 text-purple-800',
    'contacté': 'bg-blue-100 text-blue-800',
    'en discussion': 'bg-yellow-100 text-yellow-800',
    'proposition': 'bg-indigo-100 text-indigo-800',
    'converti': 'bg-green-100 text-green-800',
    'perdu': 'bg-red-100 text-red-800',
  };
  
  return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};