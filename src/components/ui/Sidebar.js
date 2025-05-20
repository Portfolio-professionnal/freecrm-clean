'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiHome, 
  FiUsers, 
  FiPhone, 
  FiList, 
  FiFileText, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: <FiHome size={20} /> },
    { href: '/prospects', label: 'Prospects', icon: <FiPhone size={20} /> },
    { href: '/clients', label: 'Clients', icon: <FiUsers size={20} /> },
    { href: '/taches', label: 'Tâches', icon: <FiList size={20} /> },
    { href: '/factures', label: 'Factures', icon: <FiFileText size={20} /> },
    { href: '/profil', label: 'Paramètres', icon: <FiSettings size={20} /> },
  ];

  const isActive = (href) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  const handleLogout = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Bouton menu mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-40">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-primary-600">FreeCRM</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span className="mr-3 text-gray-500">
              <FiLogOut size={20} />
            </span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Sidebar mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="absolute inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-primary-600">FreeCRM</h1>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-5 pb-4">
              <nav className="px-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`mr-3 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3 text-gray-500">
                  <FiLogOut size={20} />
                </span>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}