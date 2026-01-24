        // src/app/login/page.jsx
        // Importe AuthForm se já o criou, ou use um HTML simples para testar
        // import AuthForm from '@/components/auth/AuthForm';

        export default function LoginPage() {
          return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
              {/* <AuthForm /> */}
              <div className="p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Página de Login</h2>
                <p className="mt-4 text-center">Formulário de login virá aqui.</p>
                <a href="/" className="mt-4 block text-blue-600 hover:underline text-center">Voltar para a Home</a>
              </div>
            </div>
          );
        }
