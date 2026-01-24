// src/components/settings/CategoryManager.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const CategoryManager = ({ initialCategories, userId }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formState, setFormState] = useState({ name: '', type: 'expense' }); // Default para despesa
  const router = useRouter();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEditCategory = async () => {
    if (!formState.name || !formState.type) {
      setMessage('Nome e tipo da categoria são obrigatórios.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        user_id: userId,
        name: formState.name,
        type: formState.type,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id)
          .eq('user_id', userId);
        if (error) throw error;
        setMessage('Categoria atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(payload);
        if (error) throw error;
        setMessage('Categoria adicionada com sucesso!');
      }

      // Limpa o formulário e recarrega a lista
      setFormState({ name: '', type: 'expense' });
      setEditingCategory(null);
      setIsModalOpen(false);
      router.refresh(); // Força a revalidação de dados em Server Components
    } catch (err) {
      console.error('Erro ao salvar categoria:', err.message);
      setMessage('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Transações associadas a ela não terão mais uma categoria vinculada.')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (error) throw error;
      setMessage('Categoria excluída com sucesso!');
      router.refresh();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err.message);
      setMessage('Erro ao excluir categoria.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormState({ name: '', type: 'expense' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormState({ name: category.name, type: category.type });
    setIsModalOpen(true);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciar Categorias</h2>
        <Button onClick={openAddModal}>
          <PlusIcon className="h-5 w-5 mr-2" /> Adicionar Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
              <div>
                <p className="font-medium text-gray-800">{cat.name}</p>
                <p className="text-sm text-gray-600">Tipo: {cat.type === 'income' ? 'Receita' : cat.type === 'fixed_expense' ? 'Gasto Fixo' : cat.type === 'variable_expense' ? 'Gasto Variável' : 'Investimento'}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)}>
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                  <TrashIcon className="h-5 w-5 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p className={`mt-4 text-sm text-center ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}>
        <div className="space-y-4">
          <Input
            label="Nome da Categoria"
            id="categoryName"
            name="name"
            value={formState.name}
            onChange={handleFormChange}
            placeholder="Ex: Alimentação, Transporte"
            required
          />
          <Select
            label="Tipo de Categoria"
            id="categoryType"
            name="type"
            value={formState.type}
            onChange={handleFormChange}
          >
            <option value="income">Receita</option>
            <option value="fixed_expense">Gasto Fixo</option>
            <option value="variable_expense">Gasto Variável</option>
            <option value="investment">Investimento</option>
          </Select>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddEditCategory} disabled={loading}>
            {loading ? 'Salvando...' : editingCategory ? <><CheckIcon className="h-5 w-5 mr-2" /> Salvar Alterações</> : <><PlusIcon className="h-5 w-5 mr-2" /> Adicionar Categoria</>}
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default CategoryManager;
