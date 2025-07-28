'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-base-100 to-blue-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-smooth-xl rounded-2xl overflow-hidden">
        {/* Sezione sinistra - Immagine e branding */}
        <div className="hidden md:flex flex-col justify-between bg-blue-800 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/real-estate-pattern.jpg')] bg-cover bg-center" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Urbanova</h1>
            <p className="text-blue-200 mt-2">Soluzioni immobiliari d'eccellenza</p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-semibold">Gestione e monitoraggio progetti immobiliari</h2>
            <p className="text-blue-100">
              Sviluppa, monitora e gestisci i tuoi progetti immobiliari con efficienza e precisione.
              Urbanova è la piattaforma all'avanguardia per il tuo business immobiliare.
            </p>
            
            <div className="flex items-center space-x-4 mt-8">
              <div className="h-1 w-12 bg-blue-400 rounded-full"></div>
              <div className="h-1 w-12 bg-white/30 rounded-full"></div>
              <div className="h-1 w-12 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Sezione destra - Modulo */}
        <div className="bg-white p-8 sm:p-10 md:p-12 flex flex-col">
          <div className="flex items-center justify-center mb-8 md:hidden">
            <h1 className="text-3xl font-bold text-blue-800">Urbanova</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h2>
            {subtitle && <p className="mt-2 text-neutral-600">{subtitle}</p>}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
} 