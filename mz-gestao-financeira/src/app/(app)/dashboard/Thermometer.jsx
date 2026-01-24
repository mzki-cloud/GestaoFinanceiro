// src/components/dashboard/Thermometer.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const Thermometer = ({ userId, month, year }) => {
  const [status, setStatus] = useState({ text: 'Carregando...', emoji: '⚪' });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateThermometerStatus = async () => {
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

        const currentBalance = totalIncome - totalExpenses;
        setBalance(currentBalance);

        // Regras do termômetro (baseadas no seu blueprint)
        if (currentBalance > 0) {
          setStatus({ text: 'No Azul', emoji: '🟢' });
        } else if (currentBalance === 0) {
          setStatus({ text: 'Neutro', emoji: '🟡' });
        } else {
          setStatus({ text: 'No Vermelho', emoji: '🔴' });
        }

      } catch (err) {
        console.error('Erro ao calcular termômetro financeiro:', err.message);
        setError('Não foi possível calcular o termômetro.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && month && year) {
      calculateThermometerStatus();
    }
  }, [userId, month, year]);

  if (loading) return <Card className="text-center text-gray-500">Carregando termômetro...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card className="text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Termômetro Financeiro</h2>
      <div className="flex items-center justify-center space-x-4">
        <span className="text-5xl">{status.emoji}</span>
        <div>
          <p className="text-3xl font-bold text-gray-900">{status.text}</p>
          <p className="text-lg text-gray-600">Balanço: {formatCurrency(balance)}</p>
        </div>
      </div>
    </Card>
  );
};

export default Thermometer;
