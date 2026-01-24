// src/components/layout/Navbar.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Para menu mobile/sidebar

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
      {/* Botão para abrir/fechar sidebar em mobile */}
      <button
        className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Nome do Sistema */}
      <Link href="/dashboard" className="text-2xl font-bold text-blue-600 ml-4 lg:ml-0">
        Mz Gestão Financeira
      </Link>

      {/* Informações do Usuário e Logout */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
            <span className="text-gray-700 font-medium hidden md:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sair">
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" />
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="primary" size="sm">Login</Button>
          </Link>
        )}
      </div>

      {/* Overlay e Sidebar para Mobile (se isMenuOpen for true) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
          {/* Conteúdo da Sidebar Mobile (pode ser o mesmo do componente Sidebar) */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-600">Navegação</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-gray-900">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {/* Aqui você pode renderizar os itens de navegação da Sidebar */}
          <nav className="mt-4 space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Dashboard</Link>
            <Link href="/months/Jan" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Meses</Link>
            <Link href="/transactions" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Transações</Link>
            <Link href="/cards" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cartões</Link>
            <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Configurações</Link>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
