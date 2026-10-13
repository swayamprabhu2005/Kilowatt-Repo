import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductEditorPage } from './pages/ProductEditorPage';
import { AttributesPage } from './pages/AttributesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SyncCenterPage } from './pages/SyncCenterPage';
import { WooCommercePage } from './pages/WooCommercePage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { ActivityPage } from './pages/ActivityPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing & Auth Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Authenticated PIM Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<ProductEditorPage />} />
              <Route path="/products/:id" element={<ProductEditorPage />} />
              <Route path="/attributes" element={<AttributesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/sync" element={<SyncCenterPage />} />
              <Route path="/woocommerce" element={<WooCommercePage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/activity" element={<ActivityPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="/app" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
