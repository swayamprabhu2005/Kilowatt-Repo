import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Store,
  History,
  LogOut,
  Plus,
  Building,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AppLayout: React.FC = () => {
  const { user, activeWorkspace, workspaces, switchWorkspace, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Attributes', to: '/attributes', icon: SlidersHorizontal },
    { label: 'Categories', to: '/categories', icon: Layers },
    { label: 'Sync Center', to: '/sync', icon: RefreshCw },
    { label: 'WooCommerce', to: '/woocommerce', icon: Store },
    { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles },
    { label: 'Activity Log', to: '/activity', icon: History },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#FAF8F6] via-[#F6F1EA] to-[#EFE7DC] overflow-hidden">
      {/* Mobile Menu Backdrop & Drawer via Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 md:hidden"
            />

            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface-card/95 backdrop-blur-md z-50 flex flex-col border-r border-surface-border md:hidden shadow-warm-lg select-none"
            >
              <div className="p-5 border-b border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-sm shadow-warm glow-terracotta-sm">
                    O
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-ink tracking-tight">ORIVANTA PIM</h1>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Enterprise Product Hub</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-ink-muted hover:text-ink rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-surface-border">
                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                  Active Workspace
                </label>
                <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-surface-border">
                  <Building className="w-4 h-4 text-terracotta-600 shrink-0" />
                  <select
                    value={activeWorkspace?.id || ''}
                    onChange={(e) => switchWorkspace(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-ink focus:outline-none cursor-pointer"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-terracotta-50 via-terracotta-50/90 to-amber-50/40 text-terracotta-700 font-semibold shadow-warm border border-terracotta-200/90 border-l-4 border-l-terracotta-500'
                          : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-surface-border bg-surface-subtle/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">Integration:</span>
                  <Badge variant="terracotta" className="font-mono text-[10px]">
                    MOCK MODE
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Log out"
                    className="p-1.5 text-ink-muted hover:text-danger rounded-lg hover:bg-surface-card transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-surface-border bg-surface-muted/90 backdrop-blur-xs select-none">
        {/* Brand identity */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-sm shadow-warm glow-terracotta-sm">
              O
            </div>
            <div>
              <h1 className="text-sm font-bold text-ink tracking-tight">ORIVANTA PIM</h1>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">Enterprise Product Hub</span>
            </div>
          </div>
        </div>

        {/* Workspace selector */}
        <div className="px-4 py-3 border-b border-surface-border">
          <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
            Active Workspace
          </label>
          <div className="flex items-center gap-2 bg-surface-card p-2 rounded-lg border border-surface-border">
            <Building className="w-4 h-4 text-terracotta-600 shrink-0" />
            <select
              value={activeWorkspace?.id || ''}
              onChange={(e) => switchWorkspace(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-ink focus:outline-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-terracotta-50 via-terracotta-50/90 to-amber-50/40 text-terracotta-700 font-semibold shadow-warm border border-terracotta-200/90 border-l-4 border-l-terracotta-500'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mode pill & User profile footer */}
        <div className="p-4 border-t border-surface-border bg-surface-subtle/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary">Integration:</span>
            <Badge variant="terracotta" className="font-mono text-[10px]">
              MOCK MODE
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-border">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1.5 text-ink-muted hover:text-danger rounded-lg hover:bg-surface-card transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-surface-border bg-gradient-to-r from-surface-card via-terracotta-50/20 to-surface-card px-4 sm:px-6 flex items-center justify-between shrink-0 gradient-border-top shadow-warm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink-secondary hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted">
              <span>Workspace:</span>
              <span className="font-semibold text-ink">{activeWorkspace?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/products/new')}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Create Product</span>
            </Button>
          </div>
        </header>

        {/* Page Content Viewport with Responsive Padding & Warm Linear Gradient */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#FAF8F6]/95 via-[#F6F1EA]/90 to-[#EFE7DC]/80">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
