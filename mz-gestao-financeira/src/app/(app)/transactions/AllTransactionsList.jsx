// src/components/transactions/AllTransactionsList.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { PencilIcon, TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const AllTransactionsList = ({
  userId,
  month,
  year,
  type,
  categoryId,
  cardId,
  isFixed,
  page,
  pageSize,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formState, setFormState] = useState({
    description: '',
    amount: '',
    category_id: '',
    card_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    type: type || 'expense', // Default para despesa se não houver filtro
    is_fixed: isFixed !== null ? isFixed : false,
  });
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('transactions')
        .select('*, categories(name), cards(name)', { count: 'exact' })
        .eq('user_id', userId);

      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);
      if (type) query = query.eq('type', type);
      if (categoryId) query = query.eq('category_id', categoryId);
      if (cardId) query = query.eq('card_id', cardId);
      if (isFixed !== null) query = query.eq('is_fixed', isFixed);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error: fetchError, count } = await query
        .order('transaction_date', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;
      setTransactions(data);
      setTotalCount(count);
    } catch (err) {
      console.error('Erro ao buscar transações:', err.message);
      setError('Não foi possível carregar as transações.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndCards = async () => {
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId); // Busca todas as categorias do usuário

      if (catError) throw catError;
      setCategories(categoriesData);

      const { data: cardsData, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      if (cardError) throw cardError;
      setCards(cardsData);
    } catch (err) {
      console.error('Erro ao buscar categorias/cartões para formulário:', err.message);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchCategoriesAndCards();
    }
  }, [userId, month, year, type, categoryId, cardId, isFixed, page, pageSize]);

  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEditTransaction = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        month: new Date(formState.transaction_date).toLocaleString('pt-BR', { month: 'short' }).slice(0, 3),
        year: new Date(formState.transaction_date).getFullYear(),
        type: formState.type,
        description: formState.description,
        amount: parseFloat(formState.amount),
        category_id: formState.category_id || null,
        card_id: formState.card_id || null,
        transaction_date: formState.transaction_date,
        is_fixed: formState.type === 'expense' ? formState.is_fixed : false, // is_fixed só para despesas
      };

      if (editingTransaction) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingTransaction.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(payload);
        if (insertError) throw insertError;
      }

      await fetchTransactions(); // Recarrega a lista
      setIsModalOpen(false);
      setEditingTransaction(null);
      setFormState({
        description: '',
        amount: '',
        category_id: '',
        card_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        type: type || 'expense',
        is_fixed: isFixed !== null ? isFixed : false,
      });
      router.refresh(); // Força a revalidação de dados em Server Components
    } catch (err) {
      console.error('Erro ao salvar transação:', err.message);
      setError('Não foi possível salvar a transação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchTransactions();
      router.refresh();
    } catch (err) {
      console.error('Erro ao excluir transação:', err.message);
      setError('Não foi possível excluir a transação.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormState({
      description: transaction.description,
      amount: transaction.amount,
      category_id: transaction.category_id || '',
      card_id: transaction.card_id || '',
      transaction_date: transaction.transaction_date,
      type: transaction.type,
      is_fixed: transaction.is_fixed,
    });
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const filteredCategoriesForForm = categories.filter(cat => {
    if (!formState.type) return true;
    if (formState.type === 'expense') {
      return cat.type === 'fixed_expense' || cat.type === 'variable_expense';
    }
    return cat.type === formState.type;
  });

  if (loading) return <Card className="text-center text-gray-500">Carregando transações...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Transações</h2>
        <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
          <PlusIcon className="h-5 w-5 mr-2" /> Adicionar Transação
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhuma transação encontrada com os filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartão</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.transaction_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {t.type === 'income' ? 'Receita' : t.type === 'expense' ? (t.is_fixed ? 'Gasto Fixo' : 'Gasto Variável') : 'Investimento'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.categories?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.cards?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(t.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(t)} className="mr-2">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(t.id)}>
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}>
        <div className="space-y-4">
          <Select
            label="Tipo de Transação"
            id="type"
            name="type"
            value={formState.type}
            onChange={handleFormChange}
          >
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
            <option value="investment">Investimento</option>
          </Select>
          <Input
            label="Descrição"
            id="description"
            name="description"
            value={formState.description}
            onChange={handleFormChange}
            placeholder="Ex: Aluguel, Salário, Mercado"
          />
          <Input
            label="Valor"
            id="amount"
            name="amount"
            type="number"
            value={formState.amount}
            onChange={handleFormChange}
            placeholder="0.00"
          />
          <Select
            label="Categoria"
            id="category_id"
            name="category_id"
            value={formState.category_id}
            onChange={handleFormChange}
          >
            <option value="">Selecione uma categoria</option>
            {filteredCategoriesForForm.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          {formState.type === 'expense' && (
            <Select
              label="Cartão"
              id="card_id"
              name="card_id"
              value={formState.card_id}
              onChange={handleFormChange}
            >
              <option value="">Nenhum cartão</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Data"
            id="transaction_date"
            name="transaction_date"
            type="date"
            value={formState.transaction_date}
            onChange={handleFormChange}
          />
          {formState.type === 'expense' && (
            <div className="flex items-center">
              <input
                id="is_fixed"
                name="is_fixed"
                type="checkbox"
                checked={formState.is_fixed}
                onChange={handleFormChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_fixed" className="ml-2 block text-sm text-gray-900">
                Gasto Fixo
              </label>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddEditTransaction} disabled={loading}>
            {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default AllTransactionsList;
