import '@/styles/reset.css';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';

import '@/lib/globalErrorInterceptor'; // GLOBAL ERROR INTERCEPTOR - DEVE ESSERE PRIMO
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            style: {
              border: '1px solid #10B981',
            },
          },
          error: {
            style: {
              border: '1px solid #EF4444',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
