    // src/components/dashboard/ExpenseChart.jsx
    'use client';

    import React, { useEffect, useState } from 'react';
    import Card from '@/components/ui/Card';
    import { supabase } from '@/lib/supabase';
    import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
    import { formatCurrency } from '@/lib/utils';

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666', '#66B2FF']; // Cores para as categorias

    const ExpenseChart = ({ userId, month, year }) => {
      const [chartData, setChartData] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        const fetchExpenseData = async () => {
          setLoading(true);
          setError(null);
          try {
            const { data, error: fetchError } = await supabase
              .from('transactions')
              .select('amount, category_id, categories(name)') // Inclui o nome da categoria
              .eq('user_id', userId)
              .eq('month', month)
              .eq('year', year)
              .eq('type', 'expense');

            if (fetchError) throw fetchError;

            // Agrupar despesas por categoria
            const groupedExpenses = data.reduce((acc, transaction) => {
              const categoryName = transaction.categories?.name || 'Outros'; // Pega o nome da categoria
              if (!acc[categoryName]) {
                acc[categoryName] = 0;
              }
              acc[categoryName] += transaction.amount;
              return acc;
            }, {});

            const formattedData = Object.keys(groupedExpenses).map((category) => ({
              name: category,
              value: groupedExpenses[category],
            }));

            setChartData(formattedData);
          } catch (err) {
            console.error('Erro ao buscar dados do gráfico de despesas:', err.message);
            setError('Não foi possível carregar o gráfico de despesas.');
          } finally {
            setLoading(false);
          }
        };

        if (userId && month && year) {
          fetchExpenseData();
        }
      }, [userId, month, year]);

      if (loading) return <Card className="text-center text-gray-500 h-80 flex items-center justify-center">Carregando gráfico...</Card>;
      if (error) return <Card className="text-center text-red-600 h-80 flex items-center justify-center">{error}</Card>;
      if (chartData.length === 0) return <Card className="text-center text-gray-500 h-80 flex items-center justify-center">Nenhuma despesa registrada para este mês.</Card>;

      return (
        <Card className="h-80 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gastos por Categoria</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      );
    };

    export default ExpenseChart;
