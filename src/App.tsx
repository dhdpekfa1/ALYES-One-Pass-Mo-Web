import { Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LoginPage,
  NotFoundPage,
  VerificationPage,
  ConfirmationPage,
} from './pages';
import { Toaster } from '@/shared/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

// 단계별 라우트 보호
const ProtectedRoute = ({
  children,
  requiredStep,
}: {
  children: React.ReactNode;
  requiredStep: number;
}) => {
  const currentStep = parseInt(sessionStorage.getItem('currentStep') || '0');
  const expiresAt = Number(sessionStorage.getItem('loginExpiresAt') || 0);

  if (!expiresAt || Date.now() > expiresAt) {
    const orgIdKept = sessionStorage.getItem('orgId');
    sessionStorage.clear();
    if (orgIdKept) sessionStorage.setItem('orgId', orgIdKept);
    queryClient.removeQueries({ predicate: () => true });
    return <Navigate to='/' replace />;
  }

  if (currentStep < requiredStep) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route
          path='/verification'
          element={
            <ProtectedRoute requiredStep={1}>
              <VerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/confirmation'
          element={
            <ProtectedRoute requiredStep={2}>
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
