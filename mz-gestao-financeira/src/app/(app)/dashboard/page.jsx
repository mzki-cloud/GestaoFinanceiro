        // src/app/(app)/dashboard/page.jsx
        export default function DashboardPage() {
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold">Dashboard - Logado!</h1>
              <p className="mt-4">Você está logado e no dashboard.</p>
              <a href="/settings" className="mt-4 block text-blue-600 hover:underline">Ir para Configurações</a>
            </div>
          );
        }
