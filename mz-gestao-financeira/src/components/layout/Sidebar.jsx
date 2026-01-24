// src/components/layout/Sidebar.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  CreditCardIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/months/Jan', icon: CalendarDaysIcon, label: 'Meses' }, // Link para um mês padrão
  { href: '/transactions', icon: ListBulletIcon, label: 'Transações' },
  { href: '/cards', icon: CreditCardIcon, label: 'Cartões' },
  { href: '/settings', icon: Cog6ToothIcon, label: 'Configurações' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-md p-4 sticky top-0 h-screen">
      <div className="text-2xl font-bold text-blue-600 mb-8 text-center">
        Mz Gestão
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Lógica para destacar o item ativo
          const isActive = item.href === '/months/Jan'
            ? pathname.startsWith('/months')
            : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
