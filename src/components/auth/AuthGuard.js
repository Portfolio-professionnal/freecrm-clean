'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

export default function AuthGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attendre que la vérification d'auth soit terminée
    if (loading) return;

    // Si l'utilisateur n'est pas connecté et n'est pas sur une page publique
    if (!isAuthenticated && !isPublicRoute(pathname)) {
      toast.info('Veuillez vous connecter pour accéder à cette page.');
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Pendant le chargement, afficher un état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié ou sur une page publique, afficher le contenu
  return isAuthenticated || isPublicRoute(pathname) ? children : null;
}

// Fonction pour vérifier si une route est publique
function isPublicRoute(pathname) {
  const publicRoutes = ['/login', '/signup', '/reset-password'];
  return publicRoutes.includes(pathname);
}