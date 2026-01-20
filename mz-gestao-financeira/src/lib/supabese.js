    import { createClient } from '@supabase/supabase-js';

    // Certifique-se de que estas variáveis de ambiente estão definidas
    // no seu arquivo .env.local (para desenvolvimento)
    // e nas configurações da Vercel (para produção)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem ser definidas.');
      // Em um ambiente de produção, você pode querer lançar um erro ou ter um fallback.
      // Por enquanto, apenas um console.error é suficiente para desenvolvimento.
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
