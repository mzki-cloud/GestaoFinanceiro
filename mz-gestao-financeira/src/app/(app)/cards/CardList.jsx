// src/components/cards/CardList.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const CardList = ({ initialCards, userId }) => {
  const [cards, setCards] = useState(initialCards);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Tem certeza que deseja excluir este cartão? Todas as transações associadas a ele permanecerão, mas não terão mais um cartão vinculado.')) return;
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      router.refresh(); // Força a revalidação de dados em Server Components
    } catch (err) {
      console.error('Erro ao excluir cartão:', err.message);
      setError('Não foi possível excluir o cartão.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card className="text-center text-gray-500">Carregando cartões...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Cartões Cadastrados</h2>
      {cards.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhum cartão cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
              <div>
                <p className="font-medium text-lg text-gray-800">{card.name}</p>
                <p className="text-sm text-gray-600">Limite: {formatCurrency(card.credit_limit || 0)}</p>
                <p className="text-sm text-gray-600">Fatura Atual: {formatCurrency(card.current_invoice || 0)}</p>
                {card.last_invoice_date && <p className="text-sm text-gray-600">Última Fatura: {card.last_invoice_date}</p>}
              </div>
              <div className="flex space-x-2">
                {/* O botão de editar abrirá o CardForm em modo de edição */}
                <Button variant="ghost" size="sm" onClick={() => router.push(`/cards?edit=${card.id}`)}>
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id)}>
                  <TrashIcon className="h-5 w-5 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CardList;
