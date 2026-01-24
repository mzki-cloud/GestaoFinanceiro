// src/components/months/MonthNotes.jsx
'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

const MonthNotes = ({ userId, month, year, initialNotes, settingsId }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveNotes = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('user_monthly_settings')
        .update({ notes: notes })
        .eq('id', settingsId)
        .eq('user_id', userId);

      if (error) throw error;
      setMessage('Notas salvas com sucesso!');
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar notas:', err.message);
      setMessage('Erro ao salvar notas.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000); // Limpa a mensagem após 3 segundos
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Notas do Mês</h2>
        {isEditing ? (
          <Button onClick={handleSaveNotes} disabled={loading} size="sm">
            {loading ? 'Salvando...' : <><CheckIcon className="h-5 w-5 mr-2" /> Salvar</>}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
            <PencilIcon className="h-5 w-5 mr-2" /> Editar
          </Button>
        )}
      </div>
      {isEditing ? (
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione suas notas e observações para este mês..."
        />
      ) : (
        <div className="min-h-25 p-3 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
          {notes || <p className="text-gray-500 italic">Nenhuma nota para este mês.</p>}
        </div>
      )}
      {message && <p className={`mt-2 text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </Card>
  );
};

export default MonthNotes;
