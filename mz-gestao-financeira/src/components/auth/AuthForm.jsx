    'use client'; // Indica que este é um Client Component no Next.js App Router

    import React, { useState } from 'react';
    import { supabase } from '@/lib/supabase'; // Importa o cliente Supabase
    import { useRouter } from 'next/navigation'; // Hook para navegação

    function AuthForm() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState('');
      const router = useRouter();

      const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(`Erro ao registrar: ${error.message}`);
        } else {
          setMessage('Verifique seu e-mail para confirmar o registro! Você será redirecionado após a confirmação.');
          // O Supabase Auth envia um e-mail de confirmação.
          // Após a confirmação, o usuário pode fazer login.
        }
        setLoading(false);
      };

      const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(`Erro ao fazer login: ${error.message}`);
        } else {
          setMessage('Login realizado com sucesso! Redirecionando para o dashboard...');
          router.push('/dashboard'); // Redireciona para o dashboard após o login
        }
        setLoading(false);
      };

      const handleSignOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          setMessage(`Erro ao sair: ${error.message}`);
        } else {
          setMessage('Você foi desconectado.');
          router.push('/login'); // Redireciona para a página de login após o logout
        }
        setLoading(false);
      };

      return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800">Mz Gestão Financeira</h2>
          <p className="text-center text-gray-600">Entre ou crie sua conta</p>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          {message && <p className="text-sm text-center text-gray-700 mt-4">{message}</p>}

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 mt-4"
          >
            Sair
          </button>
        </div>
      );
    }

    export default AuthForm;
