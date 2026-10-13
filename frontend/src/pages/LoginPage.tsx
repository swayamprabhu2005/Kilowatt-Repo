import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@orivanta.local');
  const [password, setPassword] = useState('OrivantaDemo2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-[#F6F1EA] to-[#EFE7DC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient warm terracotta glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 w-full max-w-md bg-surface-card/95 backdrop-blur-sm rounded-2xl border border-surface-border shadow-warm-lg p-8 animate-enter gradient-border-top">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-xl shadow-warm glow-terracotta mb-3">
            O
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Orivanta PIM</h1>
          <p className="text-xs text-ink-secondary mt-1">Sign in to your Product Information Management workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-subtle border border-danger-border rounded-lg flex items-center gap-2 text-danger text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
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

        <div className="mt-8 pt-6 border-t border-surface-border text-center">
          <p className="text-[11px] text-ink-muted mb-2 font-medium">Quick Local Evaluation Credentials:</p>
          <div className="inline-block bg-surface-muted px-3 py-2 rounded-lg border border-surface-border text-[11px] font-mono text-ink">
            <span>demo@orivanta.local</span> / <span>OrivantaDemo2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
