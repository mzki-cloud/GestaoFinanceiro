// src/app/(app)/transactions/page.jsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AllTransactionsList from '@/components/transactions/AllTransactionsList';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import Card from '@/components/ui/Card';
import { getMonthName } from '@/lib/utils';

export default async function TransactionsPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <p>Por favor, faça login para acessar suas transações.</p>;
  }

  const userId = session.user.id;

  // Parâmetros de filtro da URL
  const filterMonth = searchParams.month || null;
  const filterYear = searchParams.year ? parseInt(searchParams.year) : null;
  const filterType = searchParams.type || null; // 'income', 'expense', 'investment'
  const filterCategoryId = searchParams.category || null;
  const filterCardId = searchParams.card || null;
  const filterIsFixed = searchParams.isFixed ? (searchParams.isFixed === 'true') : null;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = 10; // Número de transações por página

  // Busca categorias e cartões para os filtros
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (catError) console.error('Erro ao buscar categorias para filtros:', catError);

  const { data: cards, error: cardError } = await supabase
    .from('cards')
    .select('id, name')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (cardError) console.error('Erro ao buscar cartões para filtros:', cardError);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-gray-900">Todas as Transações</h1>

      {/* Componente de Filtros */}
      <TransactionFilters
        initialMonth={filterMonth}
        initialYear={filterYear}
        initialType={filterType}
        initialCategoryId={filterCategoryId}
        initialCardId={filterCardId}
        initialIsFixed={filterIsFixed}
        categories={categories || []}
        cards={cards || []}
      />

      {/* Lista de Todas as Transações */}
      <AllTransactionsList
        userId={userId}
        month={filterMonth}
        year={filterYear}
        type={filterType}
        categoryId={filterCategoryId}
        cardId={filterCardId}
        isFixed={filterIsFixed}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
