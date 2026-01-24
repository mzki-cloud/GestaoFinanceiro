// src/app/layout.jsx
import './globals.css';
import { Inter } from 'next/font/google'; // Exemplo de fonte

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mz Gestão Financeira',
  description: 'Sistema completo para controle financeiro mensal.',
};

// Este é o componente React que o Next.js espera como default export
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
