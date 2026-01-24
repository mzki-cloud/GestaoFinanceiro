// src/components/months/BalanceSummary.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const BalanceSummary = ({ userId, month, year, monthlySettings }) => {
  const [totals, setTotals] = useState({
    income: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    investments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotals = async () => {
      setLoading(true);
      setError(null);
      try {
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

        setTotals({
          income: totalIncome,
          fixedExpenses: totalFixedExpenses,
          variableExpenses: totalVariableExpenses,
          investments: totalInvestments,
        });

      } catch (err) {
        console.error('Erro ao buscar totais para balanço:', err.message);
        setError('Não foi possível carregar os totais para o balanço.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && month && year) {
      fetchTotals();
    }
  }, [userId, month, year]);

  if (loading) return <Card className="text-center text-gray-500">Carregando balanço...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  // Usar as configurações passadas via props
  const {
    initial_income,
    needs_percentage,
    wants_percentage,
    savings_percentage,
    investment_percentage
  } = monthlySettings;

  // Calcula os valores ideais com base na renda inicial configurada
  const idealNeeds = initial_income * needs_percentage;
  const idealWants = initial_income * wants_percentage;
  const idealSavings = initial_income * savings_percentage;
  const idealInvestment = initial_income * investment_percentage;

  // Calcula os gastos reais para cada categoria (simplificado para este exemplo)
  // Em uma aplicação real, você categorizaria as despesas em "necessidades" e "desejos"
  // e os investimentos em "poupança" e "investimento" de forma mais granular.
  const realNeeds = totals.fixedExpenses; // Simplificação: gastos fixos como necessidades
  const realWants = totals.variableExpenses; // Simplificação: gastos variáveis como desejos
  const realSavings = 0; // Precisaria de uma categoria específica de poupança
  const realInvestment = totals.investments;

  const getStatusColor = (real, ideal) => {
    if (real <= ideal) return 'text-green-600';
    if (real > ideal && real <= ideal * 1.1) return 'text-yellow-600'; // Até 10% acima
    return 'text-red-600';
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Balanço do Mês</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <p className="font-medium text-gray-700">Renda Mensal Base:</p>
          <p className="font-semibold text-blue-600">{formatCurrency(initial_income)}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Regra de Balanço Personalizada</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p className="text-gray-600">Necessidades ({needs_percentage * 100}%):</p>
            <p className={`text-right ${getStatusColor(realNeeds, idealNeeds)}`}>
              {formatCurrency(realNeeds)} / {formatCurrency(idealNeeds)}
            </p>

            <p className="text-gray-600">Desejos ({wants_percentage * 100}%):</p>
            <p className={`text-right ${getStatusColor(realWants, idealWants)}`}>
              {formatCurrency(realWants)} / {formatCurrency(idealWants)}
            </p>

            <p className="text-gray-600">Poupança ({savings_percentage * 100}%):</p>
            <p className={`text-right ${getStatusColor(realSavings, idealSavings)}`}>
              {formatCurrency(realSavings)} / {formatCurrency(idealSavings)}
            </p>

            <p className="text-gray-600">Investimento ({investment_percentage * 100}%):</p>
            <p className={`text-right ${getStatusColor(realInvestment, idealInvestment)}`}>
              {formatCurrency(realInvestment)} / {formatCurrency(idealInvestment)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t mt-4">
          <p className="text-lg font-semibold text-gray-800">Total de Despesas e Investimentos:</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totals.fixedExpenses + totals.variableExpenses + totals.investments)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BalanceSummary;
