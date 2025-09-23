'use client';

import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Stile di default per tutti i toast
        className: 'backdrop-blur bg-white/90 shadow-smooth-md',
        duration: 5000,
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(240, 253, 244, 0.95)',
            color: '#065f46',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(254, 242, 242, 0.95)',
            color: '#991b1b',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#0ea5e9',
            secondary: '#ffffff',
          },
          style: {
            background: 'rgba(240, 249, 255, 0.95)',
            color: '#0c4a6e',
            border: '1px solid rgba(14, 165, 233, 0.2)',
          },
        },
      }}
    />
  );
}
