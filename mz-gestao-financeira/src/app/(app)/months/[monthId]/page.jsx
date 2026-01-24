// src/app/(app)/months/[monthId]/page.jsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import MonthOverview from '@/components/months/MonthOverview';
import TransactionList from '@/components/months/TransactionList';
import BalanceSummary from '@/components/months/BalanceSummary';
import MonthNotes from '@/components/months/MonthNotes';
import AuditLog from '@/components/months/AuditLog'; // Vamos criar este componente
import MonthSelector from '@/components/common/MonthSelector'; // Reutilizamos o seletor de mês/ano

// Lista de meses válidos para validação da rota
const validMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default async function MonthDetailPage({ params, searchParams }) {
  const { monthId } = params;
  const currentYear = parseInt(searchParams.year || new Date().getFullYear()); // Pega o ano da URL ou o ano atual

  if (!validMonths.includes(monthId)) {
    notFound(); // Retorna 404 se o mês não for válido
  }

  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // O middleware já deve redirecionar, mas é um bom fallback
    return <p>Por favor, faça login para acessar os detalhes do mês.</p>;
  }

  const userId = session.user.id;

  // Busca as configurações mensais do usuário (para balanço, notas, etc.)
  const { data: monthlySettings, error: settingsError } = await supabase
    .from('user_monthly_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthId)
    .eq('year', currentYear)
    .single();

  // Se não houver configurações para o mês, cria uma com valores padrão
  let settings = monthlySettings;
  if (settingsError && settingsError.code === 'PGRST116') { // PGRST116 = No rows found
    const { data: newSettings, error: insertError } = await supabase
      .from('user_monthly_settings')
      .insert({
        user_id: userId,
        month: monthId,
        year: currentYear,
        // Valores padrão do blueprint
        initial_income: 2000.00,
        needs_percentage: 0.50,
        wants_percentage: 0.20,
        savings_percentage: 0.30,
        investment_percentage: 0.00,
        thermometer_status: 'No Azul 🟢',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar configurações mensais padrão:', insertError);
      return <p>Erro ao carregar as configurações do mês.</p>;
    }
    settings = newSettings;
  } else if (settingsError) {
    console.error('Erro ao buscar configurações mensais:', settingsError);
    return <p>Erro ao carregar as configurações do mês.</p>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <h1 className="text-4xl font-bold text-gray-900">
        {validMonths.find(m => m === monthId)} - {currentYear}
      </h1>

      {/* Seletor de Mês/Ano */}
      <MonthSelector initialMonth={monthId} initialYear={currentYear} />

      {/* Visão Geral do Mês (Receitas, Despesas, Balanço Rápido) */}
      <MonthOverview userId={userId} month={monthId} year={currentYear} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balanço do Mês (Regra 50/20/30) */}
        <BalanceSummary
          userId={userId}
          month={monthId}
          year={currentYear}
          monthlySettings={settings}
        />

        <div className="space-y-8">
          {/* Notas do Mês */}
          <MonthNotes
            userId={userId}
            month={monthId}
            year={currentYear}
            initialNotes={settings?.notes}
            settingsId={settings?.id}
          />

          {/* Histórico de Alterações */}
          <AuditLog userId={userId} month={monthId} year={currentYear} />
        </div>
      </div>

      {/* Seções de Transações Detalhadas */}
      <div className="space-y-8">
        <TransactionList
          userId={userId}
          month={monthId}
          year={currentYear}
          type="income"
          title="Receitas"
        />
        <TransactionList
          userId={userId}
          month={monthId}
          year={currentYear}
          type="expense"
          isFixed={true}
          title="Gastos Fixos"
        />
        <TransactionList
          userId={userId}
          month={monthId}
          year={currentYear}
          type="expense"
          isFixed={false}
          title="Gastos Variáveis"
        />
        <TransactionList
          userId={userId}
          month={monthId}
          year={currentYear}
          type="investment"
          title="Investimentos"
        />
      </div>
    </div>
  );
}
