import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-28 pb-20 px-4 container mx-auto max-w-6xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
