// src/components/dashboard/FinancialSummary.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils'; // Precisamos criar essa função utilitária

const FinancialSummary = ({ userId, month, year }) => {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca receitas
        const { data: incomeData, error: incomeError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('month', month)
          .eq('year', year)
          .eq('type', 'income');

        if (incomeError) throw incomeError;

        const totalIncome = incomeData.reduce((acc, curr) => acc + curr.amount, 0);

        // Busca despesas
        const { data: expenseData, error: expenseError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('month', month)
          .eq('year', year)
          .eq('type', 'expense');

        if (expenseError) throw expenseError;

        const totalExpenses = expenseData.reduce((acc, curr) => acc + curr.amount, 0);

        setSummary({
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses,
        });
      } catch (err) {
        console.error('Erro ao buscar resumo financeiro:', err.message);
        setError('Não foi possível carregar o resumo financeiro.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && month && year) {
      fetchFinancialSummary();
    }
  }, [userId, month, year]);

  if (loading) return <Card className="text-center text-gray-500">Carregando resumo...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-500">Receitas</p>
        <p className="text-2xl font-semibold text-green-600">{formatCurrency(summary.income)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Despesas</p>
        <p className="text-2xl font-semibold text-red-600">{formatCurrency(summary.expenses)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Balanço</p>
        <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(summary.balance)}
        </p>
      </div>
    </Card>
  );
};

export default FinancialSummary;
