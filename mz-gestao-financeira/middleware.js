    // middleware.js
    // Importe createServerClient em vez de createMiddlewareClient
    import { createServerClient } from '@supabase/auth-helpers-nextjs';
    import { NextResponse } from 'next/server';

    // Use 'export default' para a função middleware, conforme a recomendação do Next.js
    export default async function middleware(req) {
      const res = NextResponse.next();
      // Use createServerClient aqui, passando as variáveis de ambiente
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { req, res }
      );

      // Atualiza a sessão do Supabase
      // Isso é crucial para que o auth-helpers funcione corretamente
      await supabase.auth.getSession();

      // --- Lógica de Redirecionamento ---

      // Rotas que exigem autenticação
      const protectedRoutes = [
        '/dashboard',
        '/months',
        '/transactions',
        '/cards',
        '/settings',
      ];

      const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

      // Se o usuário NÃO está logado E tenta acessar uma rota protegida OU a rota raiz '/'
      if (!res.locals.session && (isProtectedRoute || req.nextUrl.pathname === '/')) {
        // Redireciona para a página de login
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Rotas de autenticação (login, signup)
      const authRoutes = ['/login', '/signup'];
      const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

      // Se o usuário ESTÁ logado E tenta acessar uma rota de autenticação OU a rota raiz '/'
      if (res.locals.session && (isAuthRoute || req.nextUrl.pathname === '/')) {
        // Redireciona para o dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return res;
    }

    // Define quais rotas o middleware deve ser executado
    export const config = {
      matcher: [
        '/', // Rota raiz
        '/dashboard/:path*',
        '/months/:path*',
        '/transactions/:path*',
        '/cards/:path*',
        '/settings/:path*',
        '/login',
        '/signup',
      ],
    };
