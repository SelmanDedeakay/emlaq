'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Folder,
  Loader2,
  Users,
  Map,
  Settings,
  LogOut,
  PlusCircle,
  Bell,
  ChevronDown,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const NavItem = ({
  href,
  icon: Icon,
  children,
  isCollapsed,
}: {
  href: string;
  icon: any;
  children: ReactNode;
  isCollapsed: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={isCollapsed ? String(children) : undefined}
      className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <Icon className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} />
      {!isCollapsed && <span className="flex-1">{children}</span>}
    </Link>
  );
};

const SidebarContent = ({
  isCollapsed,
  handleLogout,
}: {
  isCollapsed: boolean;
  handleLogout: () => void;
}) => (
  <>
    <div className="h-20 flex items-center justify-center border-b border-gray-700">
      <Logo size={isCollapsed ? 'sm' : 'md'} />
    </div>
    <nav className="flex-1 px-2 py-6 space-y-2">
      <NavItem href="/dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed}>
        Gösterge Paneli
      </NavItem>
      <NavItem href="/portfolio" icon={Folder} isCollapsed={isCollapsed}>
        Portföylerim
      </NavItem>
      <NavItem href="/customers" icon={Users} isCollapsed={isCollapsed}>
        Müşterilerim
      </NavItem>
      <NavItem href="/property-owners" icon={Users} isCollapsed={isCollapsed}>
        Mal Sahipleri
      </NavItem>
      <NavItem href="/map" icon={Map} isCollapsed={isCollapsed}>
        Harita Görünümü
      </NavItem>
      <NavItem href="/locations" icon={Map} isCollapsed={isCollapsed}>
        Bölgelerim
      </NavItem>
    </nav>
    <div className="px-2 py-4 border-t border-gray-700">
      <NavItem href="/settings" icon={Settings} isCollapsed={isCollapsed}>
        Ayarlar
      </NavItem>
      <button
        onClick={handleLogout}
        className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title="Çıkış Yap"
      >
        <LogOut className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} />
        {!isCollapsed && <span>Çıkış Yap</span>}
      </button>
    </div>
  </>
);


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem('sidebarCollapsed');
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(val === 'true');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((s) => {
      const next = !s;
      try {
        localStorage.setItem('sidebarCollapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[names.length - 1][0];
      }
      return names[0][0];
    }
    return user?.email?.[0]?.toUpperCase() || 'E';
  };

  // Get user display name
  const getUserDisplayName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'Emlakçı';
  };

  // Get user role display
  const getUserRole = () => {
    if (profile?.role === 'admin') return 'Admin';
    if (profile?.role === 'agent') return 'Danışman';
    return 'Kullanıcı';
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent isCollapsed={isCollapsed} handleLogout={handleLogout} />
        <button
          onClick={toggleCollapse}
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-700 hover:bg-blue-600 text-white p-1 rounded-full focus:outline-none"
          title={isCollapsed ? 'Kenar çubuğunu aç' : 'Kenar çubuğunu daralt'}
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <SidebarContent isCollapsed={false} handleLogout={handleLogout} />
          </aside>
          <div
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black opacity-50"
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-20 flex items-center justify-between px-4 sm:px-8 border-b dark:border-gray-700">
          <div className="flex items-center">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Hoş Geldiniz!
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/portfolio"
              className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={18} />
              <span>Yeni Portföy</span>
            </Link>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              <Bell size={22} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {getUserDisplayName()}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {getUserRole()}
                </p>
              </div>
              <button className="hidden md:block">
                <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
