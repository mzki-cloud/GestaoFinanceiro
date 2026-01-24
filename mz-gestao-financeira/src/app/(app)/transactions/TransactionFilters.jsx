// src/components/transactions/TransactionFilters.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getMonthName } from '@/lib/utils';

const TransactionFilters = ({
  initialMonth,
  initialYear,
  initialType,
  initialCategoryId,
  initialCardId,
  initialIsFixed,
  categories,
  cards,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [month, setMonth] = useState(initialMonth || '');
  const [year, setYear] = useState(initialYear || '');
  const [type, setType] = useState(initialType || '');
  const [categoryId, setCategoryId] = useState(initialCategoryId || '');
  const [cardId, setCardId] = useState(initialCardId || '');
  const [isFixed, setIsFixed] = useState(initialIsFixed !== null ? initialIsFixed.toString() : '');

  const months = [
    { value: 'Jan', label: 'Janeiro' }, { value: 'Fev', label: 'Fevereiro' },
    { value: 'Mar', label: 'Março' }, { value: 'Abr', label: 'Abril' },
    { value: 'Mai', label: 'Maio' }, { value: 'Jun', label: 'Junho' },
    { value: 'Jul', label: 'Julho' }, { value: 'Ago', label: 'Agosto' },
    { value: 'Set', label: 'Setembro' }, { value: 'Out', label: 'Outubro' },
    { value: 'Nov', label: 'Novembro' }, { value: 'Dez', label: 'Dezembro' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    setMonth(initialMonth || '');
    setYear(initialYear || '');
    setType(initialType || '');
    setCategoryId(initialCategoryId || '');
    setCardId(initialCardId || '');
    setIsFixed(initialIsFixed !== null ? initialIsFixed.toString() : '');
  }, [initialMonth, initialYear, initialType, initialCategoryId, initialCardId, initialIsFixed]);

  const handleApplyFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (month) newSearchParams.set('month', month);
    if (year) newSearchParams.set('year', year.toString());
    if (type) newSearchParams.set('type', type);
    if (categoryId) newSearchParams.set('category', categoryId);
    if (cardId) newSearchParams.set('card', cardId);
    if (isFixed) newSearchParams.set('isFixed', isFixed);
    newSearchParams.set('page', '1'); // Resetar para a primeira página ao aplicar filtros

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleClearFilters = () => {
    setMonth('');
    setYear('');
    setType('');
    setCategoryId('');
    setCardId('');
    setIsFixed('');
    router.push(pathname); // Limpa todos os parâmetros da URL
  };

  const filteredCategories = categories.filter(cat => {
    if (!type) return true; // Se nenhum tipo de transação selecionado, mostra todas as categorias
    if (type === 'expense') {
      // Se for despesa, filtra por fixed_expense ou variable_expense
      if (isFixed === 'true') return cat.type === 'fixed_expense';
      if (isFixed === 'false') return cat.type === 'variable_expense';
      return cat.type === 'fixed_expense' || cat.type === 'variable_expense';
    }
    return cat.type === type;
  });

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Select label="Mês" value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Todos os Meses</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>
        <Select label="Ano" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          <option value="">Todos os Anos</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
        <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos os Tipos</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
          <option value="investment">Investimento</option>
        </Select>
        {type === 'expense' && (
          <Select label="Gasto Fixo/Variável" value={isFixed} onChange={(e) => setIsFixed(e.target.value)}>
            <option value="">Ambos</option>
            <option value="true">Fixo</option>
            <option value="false">Variável</option>
          </Select>
        )}
        <Select label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas as Categorias</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        <Select label="Cartão" value={cardId} onChange={(e) => setCardId(e.target.value)}>
          <option value="">Todos os Cartões</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>{card.name}</option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="secondary" onClick={handleClearFilters}>Limpar Filtros</Button>
        <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
      </div>
    </Card>
  );
};

export default TransactionFilters;
