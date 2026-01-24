// src/app/(app)/settings/page.jsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import BalanceRules from '@/components/settings/BalanceRules';
import CategoryManager from '@/components/settings/CategoryManager';
import UserPreferences from '@/components/settings/UserPreferences'; // Vamos criar este componente para outras prefs
import Card from '@/components/ui/Card';

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <p>Por favor, faça login para acessar suas configurações.</p>;
  }

  const userId = session.user.id;

  // Busca as categorias existentes para passar ao CategoryManager
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (catError) console.error('Erro ao buscar categorias para configurações:', catError);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-gray-900">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Componente para editar as regras de balanço (já detalhado) */}
        <BalanceRules />

        {/* Componente para gerenciar categorias */}
        <CategoryManager initialCategories={categories || []} userId={userId} />

        {/* Outros componentes de configuração (ex: moeda, ano padrão, tema) */}
        <UserPreferences userId={userId} />
      </div>
    </div>
  );
}
