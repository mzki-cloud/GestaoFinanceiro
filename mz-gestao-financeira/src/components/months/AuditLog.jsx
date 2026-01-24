// src/components/months/AuditLog.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AuditLog = ({ userId, month, year }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Supondo que você tenha uma coluna 'month' e 'year' no audit_log
        // ou que você possa filtrar por um período de tempo
        // Para simplificar, vamos buscar todos os logs do usuário e filtrar no cliente
        // Em uma aplicação maior, o ideal seria filtrar no banco de dados.

        // Para filtrar no banco de dados, você precisaria de uma coluna 'month' e 'year'
        // ou 'changed_at' que possa ser convertida para mês/ano.
        // Por exemplo, se 'changed_at' for TIMESTAMP, você pode usar funções de data do PostgreSQL.
        // Ex: EXTRACT(MONTH FROM changed_at) = <month_number> AND EXTRACT(YEAR FROM changed_at) = <year>

        // Por enquanto, vamos buscar e filtrar no cliente para demonstrar
        const { data, error: fetchError } = await supabase
          .from('audit_log')
          .select('*')
          .eq('user_id', userId)
          .order('changed_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Filtrar no cliente pelo mês e ano (se o DB não tiver colunas diretas)
        const filteredLogs = data.filter(log => {
          const logDate = new Date(log.changed_at);
          const logMonth = logDate.toLocaleString('pt-BR', { month: 'short' }).slice(0, 3);
          const logYear = logDate.getFullYear();
          return logMonth === month && logYear === year;
        });

        setLogs(filteredLogs);
      } catch (err) {
        console.error('Erro ao buscar histórico de alterações:', err.message);
        setError('Não foi possível carregar o histórico de alterações.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && month && year) {
      fetchAuditLogs();
    }
  }, [userId, month, year]);

  if (loading) return <Card className="text-center text-gray-500">Carregando histórico...</Card>;
  if (error) return <Card className="text-center text-red-600">{error}</Card>;

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico de Alterações</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhuma alteração registrada para este mês.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-gray-50 rounded-md text-sm">
              <p className="font-medium text-gray-800">{log.action} - {log.entity_type} (ID: {log.entity_id?.substring(0, 8)}...)</p>
              <p className="text-gray-600">
                Em: {format(new Date(log.changed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
              {/* Você pode expandir para mostrar old_value e new_value se desejar */}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AuditLog;
