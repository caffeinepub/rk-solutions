import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
  role: 'shop' | 'admin';
}

export default function AppShell({ children, role }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role={role} />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
