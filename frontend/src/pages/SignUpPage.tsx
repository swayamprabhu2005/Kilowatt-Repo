import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, User, Building, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, workspaceName);
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-surface">
      {/* Background Image with Warm Editorial Grading & Glass Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-xs transform transition-transform duration-1000"
        style={{ backgroundImage: `url('/assets/signup-bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#181615]/75 via-[#2E2825]/60 to-[#C85A32]/25 backdrop-blur-xs" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#181615]/30 to-[#181615]/80 pointer-events-none" />

      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-lg bg-surface-card/92 backdrop-blur-xl rounded-2xl border border-surface-border/90 shadow-warm-2xl p-6 sm:p-8 gradient-border-top my-8"
      >
        {/* Top bar back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
            Live Store Mode
          </span>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-xl shadow-warm glow-terracotta mb-3">
            O
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Create Your PIM Workspace</h1>
          <p className="text-xs text-ink-secondary mt-1 max-w-xs">
            Start cataloguing with dynamic attributes, matrix variants, and live WooCommerce sync
          </p>
        </div>

        {/* Feature badges banner */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-surface rounded-xl border border-surface-border text-[11px] text-ink-secondary">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
            <span>Live Store Mode</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
            <span>Zero-RLS Isolation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
            <span>Gemini AI Audits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
            <span>Local SQLite WAL</span>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="Sarah Chen"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="sarah@yourstore.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Workspace / Store Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="e.g. Modern Craft Supplies (Optional)"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface rounded-lg border border-surface-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-3" isLoading={isLoading}>
            Create Workspace & Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-ink-secondary">Already have a workspace?</span>
          <Link
            to="/login"
            className="text-terracotta-600 hover:text-terracotta-700 font-semibold transition-colors"
          >
            Sign In to Existing Account →
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-terracotta-600" />
          <span>Passwords secured via Argon2id. Single SQLite database persistence.</span>
        </div>
      </motion.div>
    </div>
  );
};
