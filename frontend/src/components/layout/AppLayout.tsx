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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AppLayout: React.FC = () => {
  const { user, activeWorkspace, workspaces, switchWorkspace, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDemoUser = user?.email === 'demo@orivanta.local' && activeWorkspace?.id === 'ws_default';

  const navItems = [
    { label: 'Overview', to: '/overview', icon: LayoutDashboard },
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
      {/* Mobile Menu Backdrop & Drawer */}
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

              {/* Navigation Items (Positioned on top) */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
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

              {/* Bottom Block: Active Workspace + Integration Mode + Account */}
              <div className="p-4 border-t border-surface-border bg-surface-subtle/50 space-y-3">
                {/* Active Workspace */}
                <div>
                  <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
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

                {/* Integration Mode Badge */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-ink-secondary text-[11px]">Integration:</span>
                  {isDemoUser ? (
                    <Badge variant="terracotta" className="font-mono text-[10px]">
                      MOCK MODE
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE MODE
                    </span>
                  )}
                </div>

                {/* User Card */}
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

      {/* Desktop Sidebar (Collapsible with Hamburger Toggle) */}
      <aside
        className={`hidden md:flex flex-col border-r border-surface-border bg-surface-muted/95 backdrop-blur-xs select-none transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand identity header with Hamburger/Collapse button */}
        <div className={`p-4 border-b border-surface-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-sm shadow-warm glow-terracotta-sm shrink-0">
                O
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-ink tracking-tight truncate">ORIVANTA PIM</h1>
                <span className="text-[9px] text-ink-muted uppercase tracking-wider font-semibold block truncate">Enterprise Product Hub</span>
              </div>
            </div>
          ) : (
            <div
              title="Orivanta PIM"
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-sm shadow-warm glow-terracotta-sm cursor-pointer"
              onClick={() => setIsCollapsed(false)}
            >
              O
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors ml-1"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (Moved to the Top!) */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-terracotta-50 via-terracotta-50/90 to-amber-50/40 text-terracotta-700 font-semibold shadow-warm border border-terracotta-200/90 border-l-4 border-l-terracotta-500'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section: Active Workspace + Integration Mode + User Account */}
        <div className={`border-t border-surface-border bg-surface-subtle/60 ${isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-3'}`}>
          {!isCollapsed ? (
            <>
              {/* Active Workspace Selector */}
              <div>
                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                  Active Workspace
                </label>
                <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-lg border border-surface-border">
                  <Building className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                  <select
                    value={activeWorkspace?.id || ''}
                    onChange={(e) => switchWorkspace(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-ink focus:outline-none cursor-pointer truncate"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Integration Status Badge */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-ink-secondary text-[11px]">Integration:</span>
                {isDemoUser ? (
                  <Badge variant="terracotta" className="font-mono text-[10px]">
                    MOCK MODE
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE MODE
                  </span>
                )}
              </div>

              {/* User Account Info */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-ink truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-ink-muted truncate font-mono">{user?.email}</p>
                </div>
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-1.5 text-ink-muted hover:text-danger rounded-lg hover:bg-surface-card transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Compact Collapsed Footer */
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                title={`Active Workspace: ${activeWorkspace?.name || 'Default'}`}
                className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-terracotta-600"
              >
                <Building className="w-4 h-4" />
              </div>

              <div
                title={isDemoUser ? 'Mode: Mock Integration' : 'Mode: Live WooCommerce'}
                className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDemoUser ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
              </div>

              <button
                onClick={() => logout()}
                title={`Log out (${user?.email})`}
                className="w-8 h-8 rounded-lg text-ink-muted hover:text-danger hover:bg-surface-card flex items-center justify-center transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-surface-border bg-gradient-to-r from-surface-card via-terracotta-50/20 to-surface-card px-4 sm:px-6 flex items-center justify-between shrink-0 gradient-border-top shadow-warm">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile Drawer & Desktop Collapse Toggle */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className="p-2 text-ink-secondary hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Toggle navigation menu"
              title="Toggle sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-ink-muted hidden sm:inline">Workspace:</span>
              <span className="font-semibold text-ink">{activeWorkspace?.name}</span>
              {isDemoUser ? (
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.2 rounded border border-amber-200 ml-1">
                  Mock Mode
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Store
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/products/new')}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden xs:inline sm:inline">Create Product</span>
            </Button>
          </div>
        </header>

        {/* Page Content Viewport */}
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
