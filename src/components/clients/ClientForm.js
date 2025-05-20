'use client';

import { useForm } from 'react-hook-form';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

export default function ClientForm({ client, onSubmit, onCancel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nom: client?.nom || '',
      email: client?.email || '',
      telephone: client?.telephone || '',
      adresse: client?.adresse || '',
      notes: client?.notes || '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormInput
        label="Nom / Société"
        id="nom"
        type="text"
        placeholder="Nom du client ou de l'entreprise"
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
          placeholder="client@example.com"
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
        placeholder="Notes et informations complémentaires"
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
          {client?.id ? 'Mettre à jour' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
}