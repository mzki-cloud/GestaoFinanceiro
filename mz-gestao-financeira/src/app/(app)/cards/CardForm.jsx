// src/components/cards/CardForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

const CardForm = ({ userId }) => {
  const [cardName, setCardName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [lastInvoiceDate, setLastInvoiceDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const editCardId = searchParams.get('edit');
    if (editCardId && userId) {
      const fetchCardToEdit = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('id', editCardId)
            .eq('user_id', userId)
            .single();

          if (error) throw error;
          if (data) {
            setEditingCardId(data.id);
            setCardName(data.name);
            setCreditLimit(data.credit_limit || '');
            setLastInvoiceDate(data.last_invoice_date || '');
          }
        } catch (err) {
          console.error('Erro ao buscar cartão para edição:', err.message);
          setMessage('Erro ao carregar dados do cartão para edição.');
        } finally {
          setLoading(false);
        }
      };
      fetchCardToEdit();
    } else {
      // Limpa o formulário se não estiver em modo de edição
      setEditingCardId(null);
      setCardName('');
      setCreditLimit('');
      setLastInvoiceDate('');
    }
  }, [searchParams, userId]);

  const handleSaveCard = async () => {
    if (!cardName) {
      setMessage('O nome do cartão é obrigatório.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        user_id: userId,
        name: cardName,
        credit_limit: creditLimit ? parseFloat(creditLimit) : null,
        last_invoice_date: lastInvoiceDate || null,
      };

      if (editingCardId) {
        const { error } = await supabase
          .from('cards')
          .update(payload)
          .eq('id', editingCardId)
          .eq('user_id', userId);
        if (error) throw error;
        setMessage('Cartão atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('cards')
          .insert(payload);
        if (error) throw error;
        setMessage('Cartão adicionado com sucesso!');
      }

      // Limpa o formulário e recarrega a lista
      setCardName('');
      setCreditLimit('');
      setLastInvoiceDate('');
      setEditingCardId(null);
      router.replace(pathname); // Remove o parâmetro 'edit' da URL
      router.refresh(); // Força a revalidação de dados em Server Components
    } catch (err) {
      console.error('Erro ao salvar cartão:', err.message);
      setMessage('Erro ao salvar cartão.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {editingCardId ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
      </h2>
      <div className="space-y-4">
        <Input
          label="Nome do Cartão"
          id="cardName"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Ex: Cartão de Crédito Nubank"
          required
        />
        <Input
          label="Limite de Crédito (opcional)"
          id="creditLimit"
          type="number"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        <Input
          label="Data da Última Fatura (opcional)"
          id="lastInvoiceDate"
          type="date"
          value={lastInvoiceDate}
          onChange={(e) => setLastInvoiceDate(e.target.value)}
        />
      </div>
      {message && (
        <p className={`mt-4 text-sm text-center ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      <Button onClick={handleSaveCard} disabled={loading} className="w-full mt-6">
        {loading ? 'Salvando...' : editingCardId ? <><CheckIcon className="h-5 w-5 mr-2" /> Salvar Alterações</> : <><PlusIcon className="h-5 w-5 mr-2" /> Adicionar Cartão</>}
      </Button>
      {editingCardId && (
        <Button variant="secondary" onClick={() => router.replace(pathname)} className="w-full mt-2">
          Cancelar Edição
        </Button>
      )}
    </Card>
  );
};

export default CardForm;
