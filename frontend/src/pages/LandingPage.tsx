import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  CheckCircle2,
  Database,
  Cpu,
  SlidersHorizontal,
  ChevronRight,
  Workflow,
  KeyRound,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'attributes' | 'variants' | 'sync' | 'ai'>('attributes');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleQuickDemo = async () => {
    setIsDemoLoading(true);
    try {
      await login('demo@orivanta.local', 'OrivantaDemo2026!');
      navigate('/overview');
    } catch {
      navigate('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F6] via-[#F6F1EA] to-[#EFE7DC] text-ink selection:bg-terracotta-200 selection:text-terracotta-900">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F6]/85 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-700 flex items-center justify-center text-white font-bold text-lg shadow-warm glow-terracotta-sm">
              O
            </div>
            <div>
              <span className="font-bold tracking-tight text-ink text-base">ORIVANTA PIM</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-ink-muted uppercase tracking-wider font-semibold border-l border-surface-border pl-2">
                Enterprise Product Hub
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-ink-secondary">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#capabilities" className="hover:text-ink transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-ink transition-colors">Architecture</a>
            <a href="#woocommerce" className="hover:text-ink transition-colors">WooCommerce</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/overview')}
                className="shadow-warm"
              >
                <span>Control Center</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-ink-secondary hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="shadow-warm hidden sm:flex"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Rich Visuals & Editorial Typography */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Ambient atmospheric terracotta orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-surface-border text-ink-secondary text-xs font-medium shadow-warm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span className="font-semibold text-terracotta-700">Orivanta PIM Platform</span>
            <span className="text-surface-border-strong">•</span>
            <span>WooCommerce Integration & Gemini Agentic AI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink max-w-4xl mx-auto leading-tight"
          >
            The Authority Layer for Multichannel E-Commerce Product Data
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base text-ink-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Harmonize fragmented specs across spreadsheets and ERPs. Define dynamic typed attributes, manage variable product matrices, audit completeness with Gemini AI, and publish idempotently to WooCommerce.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Button
              size="lg"
              variant="primary"
              onClick={handleQuickDemo}
              isLoading={isDemoLoading}
              className="shadow-warm-lg glow-terracotta"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              <span>Launch Live Demo Workspace</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="bg-surface-card/80 backdrop-blur-xs shadow-warm"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Key Value Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left"
          >
            <div className="p-3.5 bg-surface-card/90 rounded-xl border border-surface-border shadow-warm">
              <div className="text-xl font-bold text-terracotta-600">₹0 Budget</div>
              <p className="text-[11px] text-ink-secondary mt-0.5">Zero cloud hosting or database costs</p>
            </div>
            <div className="p-3.5 bg-surface-card/90 rounded-xl border border-surface-border shadow-warm">
              <div className="text-xl font-bold text-ink">SQLite WAL</div>
              <p className="text-[11px] text-ink-secondary mt-0.5">Offline-first local file persistence</p>
            </div>
            <div className="p-3.5 bg-surface-card/90 rounded-xl border border-surface-border shadow-warm">
              <div className="text-xl font-bold text-terracotta-600">Idempotent</div>
              <p className="text-[11px] text-ink-secondary mt-0.5">Zero duplicate WooCommerce syncs</p>
            </div>
            <div className="p-3.5 bg-surface-card/90 rounded-xl border border-surface-border shadow-warm">
              <div className="text-xl font-bold text-ink">Bounded AI</div>
              <p className="text-[11px] text-ink-secondary mt-0.5">Gemini audit with human approval</p>
            </div>
          </motion.div>

          {/* Hero Showcase Image */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-14 relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-surface-border shadow-warm-2xl group"
          >
            <img
              src="/assets/home-hero.jpg"
              alt="Orivanta PIM Studio Showcase"
              className="w-full h-auto object-cover max-h-[520px] transition-transform duration-700 group-hover:scale-102"
            />
            {/* Dark glass gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/80 via-[#181615]/20 to-transparent pointer-events-none" />

            {/* Floating Live Indicator Badges */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-500/90 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-warm">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold tracking-tight">Active Live WooCommerce Sync</h3>
                  <p className="text-[11px] text-stone-300">Target: https://kilowatt-repo.local • 6 Products Linked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-mono font-semibold">
                  REST API v3 Connected
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Interactive Capabilities Section */}
      <section id="capabilities" className="py-20 bg-surface border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">Core Features</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1">
              Engineered for Enterprise Product Information Workflows
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary mt-2">
              Explore the four core pillars that make Orivanta PIM the reliable backbone for modern retail.
            </p>
          </div>

          {/* Capability Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'attributes', label: 'Dynamic Attributes', icon: SlidersHorizontal },
              { id: 'variants', label: 'Variant Matrix', icon: Layers },
              { id: 'sync', label: 'WooCommerce Sync', icon: RefreshCwIcon },
              { id: 'ai', label: 'Gemini AI Agent', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-terracotta-500 text-white shadow-warm glow-terracotta-sm scale-102'
                    : 'bg-surface-card hover:bg-surface-subtle text-ink-secondary hover:text-ink border border-surface-border'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-card rounded-2xl border border-surface-border shadow-warm-lg p-6 sm:p-8"
            >
              {activeTab === 'attributes' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-terracotta-50 text-terracotta-700 text-xs font-semibold rounded-md border border-terracotta-200">
                      Typed Schema Engine
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-3">Dynamic Product Attributes Without Migrations</h3>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      Define typed attribute definitions on the fly: text, number, boolean, single select, multiselect, and date. Enforce custom validation rules, regex patterns, and assign eligibility for variant generation.
                    </p>
                    <div className="mt-6 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-terracotta-600" />
                        <span>Hybrid Relational + Validated JSON persistence for agile schemas</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-terracotta-600" />
                        <span>Strict pre-sync validation prevents invalid records from reaching WooCommerce</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-terracotta-600" />
                        <span>Faceted filtering and attribute-based catalogue search</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-surface-border font-mono text-xs text-ink space-y-3">
                    <div className="text-[11px] text-ink-muted uppercase font-semibold">Live Attribute Schema Definition</div>
                    <pre className="p-3 bg-surface-card rounded-lg border border-surface-border overflow-x-auto text-[11px]">
{`{
  "code": "switch_type",
  "name": "Switch Type",
  "dataType": "select",
  "isVariantParam": true,
  "options": ["Tactile Brown", "Linear Red", "Clicky Blue"],
  "isRequired": true
}`}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-md border border-amber-200">
                      Matrix Combinatorics
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-3">Multi-Attribute Variant Permutations</h3>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      Handle complex variable products with dozens of variants. Automatically generate Cartesian combinations (e.g., Switch Type × Chassis Color) and manage discrete pricing, stock levels, and SKUs.
                    </p>
                    <div className="mt-6 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Simple and Variable product lifecycle states</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Duplicate attribute collision prevention and SKU uniqueness guards</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-surface-border font-mono text-xs text-ink">
                    <div className="text-[11px] text-ink-muted uppercase font-semibold mb-2">Variant Matrix Preview</div>
                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 bg-surface-card rounded border border-surface-border flex justify-between">
                        <span>KEY-PREC-01-BRN (Tactile Brown)</span>
                        <span className="text-terracotta-600 font-semibold">$149.00 • 25 in stock</span>
                      </div>
                      <div className="p-2 bg-surface-card rounded border border-surface-border flex justify-between">
                        <span>KEY-PREC-01-RED (Linear Red)</span>
                        <span className="text-terracotta-600 font-semibold">$149.00 • 30 in stock</span>
                      </div>
                      <div className="p-2 bg-surface-card rounded border border-surface-border flex justify-between">
                        <span>KEY-PREC-01-BLU (Clicky Blue)</span>
                        <span className="text-terracotta-600 font-semibold">$149.00 • 15 in stock</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sync' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200">
                      Channel Synchronisation
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-3">Idempotent Synchronisation Engine</h3>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      Publish products to WooCommerce with strict idempotency. External ID tracking ensures records are never duplicated, while explicit state transitions guarantee data integrity.
                    </p>
                    <div className="mt-6 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Tracks remote IDs: not_synced → pending → syncing → synced / failed</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Simulated failure toggle for reliable testing of retry workflows</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-surface-border font-mono text-xs text-ink">
                    <div className="text-[11px] text-ink-muted uppercase font-semibold mb-2">Sync State Machine Transitions</div>
                    <div className="p-3 bg-surface-card rounded-lg border border-surface-border text-[11px] space-y-1.5">
                      <div className="text-terracotta-600 font-semibold">1. Pre-Sync Validation Passed</div>
                      <div>2. Dispatch REST API payload (Basic Auth HTTPS)</div>
                      <div>3. Receive WooCommerce Product ID #11</div>
                      <div className="text-emerald-700 font-bold">4. State Updated: 'synced' in SQLite WAL</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-800 text-xs font-semibold rounded-md border border-purple-200">
                      Gemini 2.5 Flash
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-3">Server-Controlled Agentic AI Assistant</h3>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      Empower operators with AI audits, attribute enrichment, and channel diagnostics. Runs in a bounded server tool loop (max 6 turns) with strict human approval boundaries.
                    </p>
                    <div className="mt-6 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span>Zero autonomous DB mutations: operators review field diffs before commit</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span>Deterministic MockGeminiProvider fallback when offline or no API key</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-surface-border font-mono text-xs text-ink">
                    <div className="text-[11px] text-ink-muted uppercase font-semibold mb-2">AI Completeness Audit Output</div>
                    <div className="p-3 bg-surface-card rounded-lg border border-surface-border text-[11px] space-y-1">
                      <div className="text-purple-700 font-semibold">Score: 92/100 (Sync Ready)</div>
                      <div className="text-ink-secondary">• Missing: Warranty attribute value</div>
                      <div className="text-ink-secondary">• Suggestion: Add 24-month manufacturer coverage</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Feature Showcase Grid with Architectural Photography */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-surface-border shadow-warm-lg">
            <img
              src="/assets/home-feature.jpg"
              alt="Orivanta PIM Workbench"
              className="w-full h-full object-cover min-h-[380px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181615]/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="text-[10px] font-mono uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded">
                Editorial Design System
              </span>
              <h3 className="text-sm font-bold mt-1.5">Artisanal Craft Meets Production Engineering</h3>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-surface-card rounded-xl border border-surface-border shadow-warm">
              <ShieldCheck className="w-6 h-6 text-terracotta-600 mb-2.5" />
              <h4 className="text-sm font-bold text-ink">Application-Layer Isolation</h4>
              <p className="text-xs text-ink-secondary mt-1">
                Robust multi-tenancy enforced in every query without relying on PostgreSQL RLS.
              </p>
            </div>

            <div className="p-5 bg-surface-card rounded-xl border border-surface-border shadow-warm">
              <Database className="w-6 h-6 text-terracotta-600 mb-2.5" />
              <h4 className="text-sm font-bold text-ink">Zero-Cost SQLite WAL</h4>
              <p className="text-xs text-ink-secondary mt-1">
                Runs locally via better-sqlite3 with repeatable seeders and versioned migrations.
              </p>
            </div>

            <div className="p-5 bg-surface-card rounded-xl border border-surface-border shadow-warm">
              <Cpu className="w-6 h-6 text-terracotta-600 mb-2.5" />
              <h4 className="text-sm font-bold text-ink">Bounded Tool Loops</h4>
              <p className="text-xs text-ink-secondary mt-1">
                Server-side safety guards prevent infinite AI recursion and runaway API calls.
              </p>
            </div>

            <div className="p-5 bg-surface-card rounded-xl border border-surface-border shadow-warm">
              <Workflow className="w-6 h-6 text-terracotta-600 mb-2.5" />
              <h4 className="text-sm font-bold text-ink">Human-in-the-Loop</h4>
              <p className="text-xs text-ink-secondary mt-1">
                Every AI-suggested title, description, or attribute proposal requires operator confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-terracotta-700 via-terracotta-600 to-terracotta-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/30 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Take Control of Your Multichannel Catalogue
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-terracotta-100 max-w-xl mx-auto">
            Experience high-fidelity attribute management, variant permutations, and reliable WooCommerce synchronisation today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={handleQuickDemo}
              isLoading={isDemoLoading}
              className="bg-white text-terracotta-700 hover:bg-stone-50 border-white shadow-warm-lg"
            >
              <span>Explore Demo Workspace</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup')}
              className="bg-transparent text-white border-white/60 hover:bg-white/10"
            >
              <span>Create Free Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-10 bg-surface border-t border-surface-border text-xs text-ink-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-terracotta-500 text-white font-bold flex items-center justify-center text-xs">
              O
            </div>
            <span className="font-semibold text-ink">Orivanta PIM</span>
            <span className="text-ink-muted">• Product Information Management Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-ink-muted">
            <span>SQLite Local Persistence</span>
            <span>•</span>
            <span>WooCommerce REST v3</span>
            <span>•</span>
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Mini inline icon helper
const RefreshCwIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
