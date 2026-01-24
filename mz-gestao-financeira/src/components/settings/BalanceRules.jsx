// src/components/settings/BalanceRules.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth'; // Vamos criar este hook para pegar o userId
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BalanceRules = () => {
  const { user } = useAuth(); // Pega o usuário logado
  const userId = user?.id;

  const [initialIncome, setInitialIncome] = useState(2000.00);
  const [needs, setNeeds] = useState(50);
  const [wants, setWants] = useState(20);
  const [savings, setSavings] = useState(30);
  const [investment, setInvestment] = useState(0); // Novo campo para investimento
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settingsId, setSettingsId] = useState(null); // Para saber qual registro atualizar

  useEffect(() => {
    const fetchBalanceSettings = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Busca as configurações de balanço do usuário (pode ser um registro único por usuário)
        // Ou podemos buscar as configurações padrão para o ano atual, por exemplo.
        // Para simplificar, vamos buscar um registro genérico ou o mais recente.
        // O ideal seria ter uma tabela de 'user_preferences' para configurações globais.
        // Por enquanto, vamos buscar o primeiro registro de 'user_monthly_settings' para o usuário.
        const { data, error } = await supabase
          .from('user_monthly_settings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }) // Pega o mais recente
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error;
        }

        if (data) {
          setSettingsId(data.id);
          setInitialIncome(data.initial_income);
          setNeeds(data.needs_percentage * 100);
          setWants(data.wants_percentage * 100);
          setSavings(data.savings_percentage * 100);
          setInvestment(data.investment_percentage * 100);
        } else {
          // Se não houver configurações, podemos criar uma padrão ou deixar o usuário criar
          // Por enquanto, usaremos os defaults do estado.
          setSettingsId(null);
        }
      } catch (err) {
        console.error('Erro ao buscar configurações de balanço:', err.message);
        setMessage('Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceSettings();
  }, [userId]);

  const handleSaveSettings = async () => {
    if (!userId) {
      setMessage('Usuário não autenticado.');
      return;
    }

    const totalPercentage = needs + wants + savings + investment;
    if (totalPercentage !== 100) {
      setMessage('A soma das porcentagens deve ser 100%!');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const payload = {
        user_id: userId,
        initial_income: parseFloat(initialIncome),
        needs_percentage: needs / 100,
        wants_percentage: wants / 100,
        savings_percentage: savings / 100,
        investment_percentage: investment / 100,
        // Para simplificar, vamos usar o mês e ano atual para a inserção/atualização
        // O ideal seria ter uma tabela de 'user_preferences' para configurações globais
        // ou permitir que o usuário aplique essas regras a todos os meses futuros.
        month: new Date().toLocaleString('pt-BR', { month: 'short' }).slice(0, 3),
        year: new Date().getFullYear(),
      };

      if (settingsId) {
        // Atualiza o registro existente
        const { error } = await supabase
          .from('user_monthly_settings')
          .update(payload)
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        // Insere um novo registro se não houver um
        const { data, error } = await supabase
          .from('user_monthly_settings')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setSettingsId(data.id); // Salva o ID do novo registro
      }

      setMessage('Configurações de balanço salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações de balanço:', err.message);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const currentTotal = needs + wants + savings + investment;

  if (loading) return <Card className="text-center text-gray-500">Carregando configurações...</Card>;

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Regras de Balanço (50/20/30)</h2>
      <p className="text-gray-600 mb-6">Defina as porcentagens da sua renda para Necessidades, Desejos, Poupança e Investimento. A soma deve ser 100%.</p>

      <div className="space-y-4">
        <Input
          label="Renda Mensal Base (para cálculo)"
          id="initialIncome"
          type="number"
          value={initialIncome}
          onChange={(e) => setInitialIncome(parseFloat(e.target.value))}
          step="0.01"
          min="0"
        />
        <Input
          label="Necessidades (%)"
          id="needs"
          type="number"
          value={needs}
          onChange={(e) => setNeeds(parseFloat(e.target.value))}
          min="0"
          max="100"
        />
        <Input
          label="Desejos (%)"
          id="wants"
          type="number"
          value={wants}
          onChange={(e) => setWants(parseFloat(e.target.value))}
          min="0"
          max="100"
        />
        <Input
          label="Poupança (%)"
          id="savings"
          type="number"
          value={savings}
          onChange={(e) => setSavings(parseFloat(e.target.value))}
          min="0"
          max="100"
        />
        <Input
          label="Investimento (%)"
          id="investment"
          type="number"
          value={investment}
          onChange={(e) => setInvestment(parseFloat(e.target.value))}
          min="0"
          max="100"
        />

        <div className="flex justify-between items-center text-lg font-semibold mt-6 pt-4 border-t border-gray-200">
          <span>Total:</span>
          <span className={currentTotal === 100 ? 'text-green-600' : 'text-red-600'}>
            {currentTotal}%
          </span>
        </div>

        {message && (
          <p className={`mt-4 text-sm text-center ${message.includes('Erro') || currentTotal !== 100 ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <Button
          onClick={handleSaveSettings}
          disabled={isSaving || currentTotal !== 100}
          className="w-full mt-6"
        >
          {isSaving ? 'Salvando...' : <><CheckIcon className="h-5 w-5 mr-2" /> Salvar Regras</>}
        </Button>
      </div>
    </Card>
  );
};

export default BalanceRules;
