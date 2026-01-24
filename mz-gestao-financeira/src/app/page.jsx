        // src/app/page.jsx
        export default function HomePage() {
          return (
            <div className="flex min-h-screen flex-col items-center justify-center p-24">
              <h1 className="text-4xl font-bold text-center">Página Inicial Mz Gestão Financeira</h1>
              <p className="mt-4 text-lg text-gray-600">Seja bem-vindo!</p>
              <a href="/login" className="mt-8 text-blue-600 hover:underline">Ir para o Login</a>
            </div>
          );
        }
