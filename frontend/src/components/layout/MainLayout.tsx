import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}

