// src/components/dashboard/MonthlyGoals.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const MonthlyGoals = ({ userId, month, year }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setGoals(data);
    } catch (err) {
      console.error('Erro ao buscar metas:', err.message);
      setError('Não foi possível carregar as metas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && month && year) {
      fetchGoals();
    }
  }, [userId, month, year]);

  const handleAddGoal = async () => {
    if (!newGoalName || !newGoalTarget || isNaN(parseFloat(newGoalTarget))) {
      alert('Por favor, preencha o nome e um valor válido para a meta.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('monthly_goals')
        .insert({
          user_id: userId,
          month,
          year,
          goal_name: newGoalName,
          target_amount: parseFloat(newGoalTarget),
          current_amount: 0, // Inicia com 0
          is_completed: false,
        })
        .select();

      if (insertError) throw insertError;

      setGoals((prevGoals) => [...prevGoals, data[0]]);
      setNewGoalName('');
      setNewGoalTarget('');
      setIsAddingGoal(false);
    } catch (err) {
      console.error('Erro ao adicionar meta:', err.message);
      setError('Não foi possível adicionar a meta.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoalCompletion = async (goalId, currentStatus) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('monthly_goals')
        .update({ is_completed: !currentStatus })
        .eq('id', goalId);

      if (updateError) throw updateError;

      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === goalId ? { ...goal, is_completed: !currentStatus } : goal
        )
      );
    } catch (err) {
      console.error('Erro ao atualizar meta:', err.message);
      setError('Não foi possível atualizar o status da meta.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card className="text-center text-gray-500">Carregando metas...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Metas do Mês</h2>
      <div className="space-y-4">
        {goals.length === 0 && !isAddingGoal ? (
          <p className="text-gray-500 text-center">Nenhuma meta definida para este mês.</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <p className={`font-medium ${goal.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {goal.goal_name}
                </p>
                <p className="text-sm text-gray-600">
                  Alvo: {formatCurrency(goal.target_amount)}
                  {/* Poderíamos adicionar o progresso aqui: (current_amount / target_amount) */}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleGoalCompletion(goal.id, goal.is_completed)}
                title={goal.is_completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
              >
                {goal.is_completed ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-400 hover:text-green-500" />
                )}
              </Button>
            </div>
          ))
        )}

        {isAddingGoal && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-md">
            <Input
              label="Nome da Meta"
              id="newGoalName"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="Ex: Economizar para viagem"
            />
            <Input
              label="Valor Alvo"
              id="newGoalTarget"
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="Ex: 500.00"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setIsAddingGoal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGoal} disabled={loading}>
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {!isAddingGoal && (
          <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddingGoal(true)}>
            <PlusIcon className="h-5 w-5 mr-2" /> Adicionar Nova Meta
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MonthlyGoals;
