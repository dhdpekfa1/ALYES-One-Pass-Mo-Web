import { Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LoginPage,
  NotFoundPage,
  VerificationPage,
  ConfirmationPage,
} from './pages';

// QueryClient 인스턴스 생성
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/verification' element={<VerificationPage />} />
        <Route path='/confirmation' element={<ConfirmationPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
