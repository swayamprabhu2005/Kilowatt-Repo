import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, AlertCircle, ChevronDown, ChevronUp, KeyRound, ArrowLeft, Sparkles, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@orivanta.local');
  const [password, setPassword] = useState('OrivantaDemo2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setShowDemoCredentials(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-surface">
      {/* Background Image with Warm Editorial Grading & Glass Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-xs transform transition-transform duration-1000"
        style={{ backgroundImage: `url('/assets/auth-bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#181615]/75 via-[#2E2825]/60 to-[#C85A32]/25 backdrop-blur-xs" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#181615]/30 to-[#181615]/80 pointer-events-none" />

      {/* Ambient warm terracotta glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md bg-surface-card/92 backdrop-blur-xl rounded-2xl border border-surface-border/90 shadow-warm-2xl p-6 sm:p-8 gradient-border-top my-8"
      >
        {/* Navigation back to landing */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
            v1.0.0 Local WAL
          </span>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-xl shadow-warm glow-terracotta mb-3">
            O
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Orivanta PIM</h1>
          <p className="text-xs text-ink-secondary mt-1">Sign in to your Product Information Management workspace</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 bg-danger-subtle border border-danger-border rounded-lg flex items-center gap-2 text-danger text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Workspace
          </Button>
        </form>

        {/* Quick Local Evaluation Credentials Dropdown */}
        <div className="mt-6 pt-5 border-t border-surface-border">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface hover:bg-surface-subtle text-ink-secondary hover:text-ink rounded-lg border border-surface-border text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Quick Local Evaluation Credentials</span>
            </span>
            {showDemoCredentials ? (
              <ChevronUp className="w-4 h-4 text-ink-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-muted" />
            )}
          </button>

          <AnimatePresence>
            {showDemoCredentials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 p-3 bg-surface rounded-xl border border-surface-border space-y-2.5 text-xs">
                  {/* Account 1 */}
                  <div className="p-2.5 bg-surface-card rounded-lg border border-surface-border flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-ink text-[11px]">
                        <Building2 className="w-3 h-3 text-terracotta-600" />
                        <span>Orivanta Demo Workspace</span>
                        <span className="text-[10px] bg-terracotta-50 text-terracotta-700 px-1.5 py-0.2 rounded border border-terracotta-200">Owner</span>
                      </div>
                      <p className="text-[11px] font-mono text-ink-secondary mt-0.5">demo@orivanta.local</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 px-2"
                      onClick={() => handleSelectDemo('demo@orivanta.local', 'OrivantaDemo2026!')}
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-terracotta-600" />
                      Autofill
                    </Button>
                  </div>

                  {/* Account 2 */}
                  <div className="p-2.5 bg-surface-card rounded-lg border border-surface-border flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-ink text-[11px]">
                        <Building2 className="w-3 h-3 text-ink-muted" />
                        <span>Isolated Tenant B</span>
                        <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded border border-stone-200">Multi-tenant</span>
                      </div>
                      <p className="text-[11px] font-mono text-ink-secondary mt-0.5">other@tenant2.local</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 px-2"
                      onClick={() => handleSelectDemo('other@tenant2.local', 'OrivantaDemo2026!')}
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-terracotta-600" />
                      Autofill
                    </Button>
                  </div>

                  <p className="text-[10px] text-ink-muted text-center pt-1 font-mono">
                    Password: <span className="text-ink font-semibold">OrivantaDemo2026!</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Link to Sign Up */}
        <div className="mt-5 pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-ink-secondary">Need a fresh workspace?</span>
          <Link
            to="/signup"
            className="text-terracotta-600 hover:text-terracotta-700 font-semibold transition-colors"
          >
            Create New Workspace →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
