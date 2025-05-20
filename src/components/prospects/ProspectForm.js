'use client';

import { useForm } from 'react-hook-form';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import { STATUT_PROSPECT } from '@/lib/utils';

export default function ProspectForm({ prospect, onSubmit, onCancel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nom: prospect?.nom || '',
      email: prospect?.email || '',
      telephone: prospect?.telephone || '',
      adresse: prospect?.adresse || '',
      statut: prospect?.statut || STATUT_PROSPECT.NOUVEAU,
      source: prospect?.source || '',
      notes: prospect?.notes || '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  // Options de statut pour le prospect
  const statutOptions = [
    { value: STATUT_PROSPECT.NOUVEAU, label: 'Nouveau' },
    { value: STATUT_PROSPECT.CONTACTE, label: 'Contacté' },
    { value: STATUT_PROSPECT.EN_DISCUSSION, label: 'En discussion' },
    { value: STATUT_PROSPECT.PROPOSITION, label: 'Proposition' },
    { value: STATUT_PROSPECT.PERDU, label: 'Perdu' },
  ];

  // Sources possibles pour les prospects
  const sourceOptions = [
    { value: 'site_web', label: 'Site web' },
    { value: 'reseaux_sociaux', label: 'Réseaux sociaux' },
    { value: 'recommandation', label: 'Recommandation' },
    { value: 'salon', label: 'Salon professionnel' },
    { value: 'publicite', label: 'Publicité' },
    { value: 'partenariat', label: 'Partenariat' },
    { value: 'autre', label: 'Autre' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormInput
        label="Nom / Société"
        id="nom"
        type="text"
        placeholder="Nom du prospect ou de l'entreprise"
        required
        error={errors.nom?.message}
        {...register('nom', {
          required: 'Le nom est requis',
          maxLength: {
            value: 100,
            message: 'Le nom ne peut pas dépasser 100 caractères',
          },
        })}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email"
          id="email"
          type="email"
          placeholder="prospect@example.com"
          error={errors.email?.message}
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Adresse email invalide',
            },
          })}
        />

        <FormInput
          label="Téléphone"
          id="telephone"
          type="text"
          placeholder="06 12 34 56 78"
          error={errors.telephone?.message}
          {...register('telephone', {
            pattern: {
              value: /^[0-9+\-\s()]*$/,
              message: 'Numéro de téléphone invalide',
            },
          })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Statut"
          id="statut"
          type="select"
          error={errors.statut?.message}
          options={statutOptions}
          {...register('statut', {
            required: 'Le statut est requis',
          })}
        />

        <FormInput
          label="Source"
          id="source"
          type="select"
          options={sourceOptions}
          error={errors.source?.message}
          {...register('source')}
        />
      </div>

      <FormInput
        label="Adresse"
        id="adresse"
        type="textarea"
        placeholder="Adresse complète"
        rows={3}
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <FormInput
        label="Notes"
        id="notes"
        type="textarea"
        placeholder="Notes et informations complémentaires (besoins, opportunités, challenges...)"
        rows={4}
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div className="flex justify-end space-x-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={<FiX />}
          disabled={isSubmitting || isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || isLoading}
          icon={<FiSave />}
        >
          {prospect?.id ? 'Mettre à jour' : 'Créer le prospect'}
        </Button>
      </div>
    </form>
  );
}