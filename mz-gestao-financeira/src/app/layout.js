    import './globals.css'; // Importa os estilos globais, incluindo Tailwind

    export const metadata = {
      title: 'Mz Gestão Financeira',
      description: 'Sistema completo para controle financeiro mensal.',
    };

    export default function RootLayout({ children }) {
      return (
        <html lang="pt-BR">
          <body>{children}</body>
        </html>
      );
    }
