// src/app/(app)/layout.jsx
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthProvider from '@/components/auth/AuthProvider'; // Para disponibilizar a sessão no cliente

export default async function AppLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redireciona para a página de login se não houver sessão.
    // O middleware já faz isso, mas é um bom fallback.
    redirect('/login');
  }

  return (
    <AuthProvider session={session}> {/* Passa a sessão para o contexto do cliente */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar de Navegação */}
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {/* Navbar Superior */}
          <Navbar />

          {/* Conteúdo Principal das Páginas */}
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
