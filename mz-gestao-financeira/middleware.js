    // middleware.js
    import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
    import { NextResponse } from 'next/server';

    // Use 'export default' para a função middleware.
    // Esta forma é geralmente mais robusta contra problemas de reconhecimento.
    export default async function middleware(req) {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Rotas protegidas: se não há sessão e tenta acessar uma rota protegida, redireciona para /login
      const protectedRoutes = [
        '/dashboard',
        '/months',
        '/transactions',
        '/cards',
        '/settings',
      ];

      const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

      if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Rotas de autenticação: se há sessão e tenta acessar /login ou /signup, redireciona para /dashboard
      const authRoutes = ['/login', '/signup'];
      const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

      if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Se o usuário acessar a rota raiz '/' e não estiver logado, redireciona para /login
      if (!session && req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Se o usuário acessar a rota raiz '/' e estiver logado, redireciona para /dashboard
      if (session && req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return res;
    }

    // O matcher deve incluir todas as rotas que o middleware deve interceptar
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
