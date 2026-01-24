// src/components/months/MonthOverview.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const MonthOverview = ({ userId, month, year }) => {
  const [summary, setSummary] = useState({ income: 0, fixedExpenses: 0, variableExpenses: 0, investments: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca todas as transações do mês
        const { data: transactions, error: fetchError } = await supabase
          .from('transactions')
          .select('amount, type, is_fixed')
          .eq('user_id', userId)
          .eq('month', month)
          .eq('year', year);

        if (fetchError) throw fetchError;

        let totalIncome = 0;
        let totalFixedExpenses = 0;
        let totalVariableExpenses = 0;
        let totalInvestments = 0;

        transactions.forEach(t => {
          if (t.type === 'income') {
            totalIncome += t.amount;
          } else if (t.type === 'expense') {
            if (t.is_fixed) {
              totalFixedExpenses += t.amount;
            } else {
              totalVariableExpenses += t.amount;
            }
          } else if (t.type === 'investment') {
            totalInvestments += t.amount;
          }
        });

        setSummary({
          income: totalIncome,
          fixedExpenses: totalFixedExpenses,
          variableExpenses: totalVariableExpenses,
          investments: totalInvestments,
          balance: totalIncome - (totalFixedExpenses + totalVariableExpenses + totalInvestments),
        });

      } catch (err) {
        console.error('Erro ao buscar resumo do mês:', err.message);
        setError('Não foi possível carregar o resumo do mês.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && month && year) {
      fetchMonthSummary();
    }
  }, [userId, month, year]);

  if (loading) return <Card className="text-center text-gray-500">Carregando resumo do mês...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-500">Receitas</p>
        <p className="text-xl font-semibold text-green-600">{formatCurrency(summary.income)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Gastos Fixos</p>
        <p className="text-xl font-semibold text-red-600">{formatCurrency(summary.fixedExpenses)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Gastos Variáveis</p>
        <p className="text-xl font-semibold text-red-600">{formatCurrency(summary.variableExpenses)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Investimentos</p>
        <p className="text-xl font-semibold text-blue-600">{formatCurrency(summary.investments)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Balanço Final</p>
        <p className={`text-xl font-semibold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(summary.balance)}
        </p>
      </div>
    </Card>
  );
};

export default MonthOverview;
