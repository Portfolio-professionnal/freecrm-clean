'use client';

import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="lg:pl-64 flex flex-col min-h-screen">
        <div className="flex-grow p-6 sm:p-8">
          {children}
        </div>
        
        <footer className="p-4 text-center text-gray-500 text-sm border-t border-gray-200">
          <p>Free CRM - {new Date().getFullYear()} - Développé par un freelance qui comprend vos galères</p>
        </footer>
      </main>
    </div>
  );
}