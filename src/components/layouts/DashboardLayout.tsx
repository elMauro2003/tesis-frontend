"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/estudiantes');
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClassName = (href: string) => {
    const active = isActive(href);

    return active
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-primary-selected)] text-primary border-l-4 border-primary transition-all group'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-surface-container-low transition-all group';
  };

  const navIconClassName = (href: string) => {
    return isActive(href)
      ? 'material-symbols-outlined text-primary'
      : 'material-symbols-outlined text-outline group-hover:text-primary';
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body w-full">
      {/* Sidebar Navigation */}
      <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-xl bg-surface-container-lowest shadow-[0_20px_40px_rgba(0,55,176,0.06)] flex flex-col h-[calc(100vh-2rem)] p-4 z-50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-[var(--color-primary-dark)] leading-none">Residencias</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Digital Concierge</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard/reports" className={navLinkClassName('/dashboard/reports')}>
            <span className={navIconClassName('/dashboard/reports')}>analytics</span>
            <span className="font-medium text-sm">Reports</span>
          </Link>
          <Link href="/dashboard/sedes" className={navLinkClassName('/dashboard/sedes')}>
            <span className={navIconClassName('/dashboard/sedes')}>location_city</span>
            <span className="font-medium text-sm">Sedes</span>
          </Link>
          <Link href="/dashboard/edificios" className={navLinkClassName('/dashboard/edificios')}>
             <span className={navIconClassName('/dashboard/edificios')}>domain</span>
             <span className="font-medium text-sm">Edificios</span>
          </Link>
          <Link href="/dashboard/cuartos" className={navLinkClassName('/dashboard/cuartos')}>
             <span className={navIconClassName('/dashboard/cuartos')}>bed</span>
             <span className="font-medium text-sm">Cuartos</span>
          </Link>
          <Link href="/dashboard" className={navLinkClassName('/dashboard')}>
            <span className={navIconClassName('/dashboard')} style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <span className="font-semibold text-sm">Estudiantes</span>
          </Link>
          <Link href="/dashboard/quejas" className={navLinkClassName('/dashboard/quejas')}>
            <span className={navIconClassName('/dashboard/quejas')}>emergency_home</span>
            <span className="font-medium text-sm">Quejas</span>
          </Link>
          <Link href="/dashboard/anuncios" className={navLinkClassName('/dashboard/anuncios')}>
            <span className={navIconClassName('/dashboard/anuncios')}>campaign</span>
            <span className="font-medium text-sm">Anuncios</span>
          </Link>
        </nav>
        
        <div className="pt-4 mt-4 border-t border-outline-variant/15 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all group">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">settings</span>
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-error-container/50 transition-all group">
            <span className="material-symbols-outlined text-outline group-hover:text-error">logout</span>
            <span className="font-medium text-sm group-hover:text-error">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Canvas */}
      <main className="ml-72 mr-8 pt-8 pb-12">
        {children}
      </main>
    </div>
  );
}
