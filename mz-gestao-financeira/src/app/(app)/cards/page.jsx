// src/app/(app)/cards/page.jsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import CardList from '@/components/cards/CardList';
import CardForm from '@/components/cards/CardForm'; // Para adicionar/editar cartões
import Card from '@/components/ui/Card';

export default async function CardsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <p>Por favor, faça login para acessar seus cartões.</p>;
  }

  const userId = session.user.id;

  // Busca os cartões do usuário
  const { data: cards, error: fetchError } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (fetchError) {
    console.error('Erro ao buscar cartões:', fetchError);
    return <p>Erro ao carregar seus cartões.</p>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-gray-900">Meus Cartões</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Cartões */}
        <CardList initialCards={cards || []} userId={userId} />

        {/* Formulário para Adicionar/Editar Cartão */}
        <CardForm userId={userId} />
      </div>
    </div>
  );
}
