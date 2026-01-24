// src/components/settings/UserPreferences.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth'; // Reutilizamos o hook de autenticação
import { CheckIcon } from '@heroicons/react/24/outline';

const UserPreferences = ({ userId }) => {
  const [currency, setCurrency] = useState('BRL');
  const [defaultYear, setDefaultYear] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState('light'); // 'light' ou 'dark'
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preferencesId, setPreferencesId] = useState(null); // ID do registro de preferências

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Busca as preferências do usuário. Idealmente, um registro único por usuário.
        const { data, error } = await supabase
          .from('user_preferences') // Nova tabela para preferências globais
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error;
        }

        if (data) {
          setPreferencesId(data.id);
          setCurrency(data.currency || 'BRL');
          setDefaultYear(data.default_year || new Date().getFullYear());
          setTheme(data.theme || 'light');
        }
      } catch (err) {
        console.error('Erro ao buscar preferências do usuário:', err.message);
        setMessage('Erro ao carregar preferências.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [userId]);

  const handleSavePreferences = async () => {
    if (!userId) {
      setMessage('Usuário não autenticado.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const payload = {
        user_id: userId,
        currency: currency,
        default_year: parseInt(defaultYear),
        theme: theme,
      };

      if (preferencesId) {
        const { error } = await supabase
          .from('user_preferences')
          .update(payload)
          .eq('id', preferencesId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('user_preferences')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setPreferencesId(data.id);
      }

      setMessage('Preferências salvas com sucesso!');
      // Você pode querer recarregar a página ou atualizar o contexto global para aplicar o tema, etc.
    } catch (err) {
      console.error('Erro ao salvar preferências:', err.message);
      setMessage('Erro ao salvar preferências.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <Card className="text-center text-gray-500">Carregando preferências...</Card>;

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferências Gerais</h2>
      <div className="space-y-4">
        <Select
          label="Moeda Padrão"
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="BRL">BRL - Real Brasileiro</option>
          <option value="USD">USD - Dólar Americano</option>
          <option value="EUR">EUR - Euro</option>
        </Select>
        <Input
          label="Ano Padrão de Exibição"
          id="defaultYear"
          type="number"
          value={defaultYear}
          onChange={(e) => setDefaultYear(e.target.value)}
          min="2000"
          max="2100"
        />
        <Select
          label="Tema da Interface"
          id="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro (Em breve)</option>
        </Select>
      </div>
      {message && (
        <p className={`mt-4 text-sm text-center ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      <Button onClick={handleSavePreferences} disabled={isSaving} className="w-full mt-6">
        {isSaving ? 'Salvando...' : <><CheckIcon className="h-5 w-5 mr-2" /> Salvar Preferências</>}
      </Button>
    </Card>
  );
};

export default UserPreferences;
