import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema di validazione per l'offerta
const offerSchema = z.object({
  lines: z
    .array(
      z.object({
        lineId: z.string(),
        description: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        unitPrice: z.number().positive(),
        totalPrice: z.number().positive(),
        deliveryTime: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'Almeno una linea richiesta'),
  totalPrice: z.number().positive('Prezzo totale deve essere positivo'),
  totalTime: z.number().positive('Tempo di consegna deve essere positivo'),
  qualityScore: z.number().min(1).max(10, 'Punteggio qualità da 1 a 10'),
  qualityNotes: z.string().min(10, 'Note qualità minime 10 caratteri'),
  technicalNotes: z.string().min(20, 'Note tecniche minime 20 caratteri'),
  additionalInfo: z.record(z.unknown()).optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface RDOLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
  requirements: string[];
}

interface RDOData {
  id: string;
  title: string;
  description: string;
  deadline: string;
  lines: RDOLine[];
  vendorName: string;
}

/**
 * Vendor Portal - Pagina per compilazione offerte RDO
 *
 * Caratteristiche:
 * - Validazione JWT token per accesso sicuro
 * - Form dinamico basato su linee RDO
 * - Validazione Zod per dati input
 * - Calcolo automatico prezzi e totali
 * - Upload allegati sicuro
 * - Submit con feedback real-time
 */
export default function VendorPortal() {
  const router = useRouter();
  const { token } = router.query;

  const [rdoData, setRdoData] = useState<RDOData | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    mode: 'onChange',
  });

  const watchedLines = watch('lines');

  // Verifica token e carica dati RDO
  useEffect(() => {
    if (!token) return;

    const verifyTokenAndLoadRDO = async () => {
      try {
        setLoading(true);

        // Verifica token con backend
        const response = await fetch('/api/rdo/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Token non valido o scaduto');
        }

        const data = await response.json();
        setRdoData(data.rdo);
        setVendorName(data.vendorName);

        // Inizializza form con linee RDO
        const initialLines = data.rdo.lines.map((line: RDOLine) => ({
          lineId: line.id,
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          unitPrice: 0,
          totalPrice: 0,
          deliveryTime: 0,
          notes: '',
        }));

        setValue('lines', initialLines);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore di verifica token');
      } finally {
        setLoading(false);
      }
    };

    verifyTokenAndLoadRDO();
  }, [token, setValue]);

  // Calcola totali automaticamente
  useEffect(() => {
    if (!watchedLines) return;

    let totalPrice = 0;
    let totalTime = 0;

    watchedLines.forEach((line, index) => {
      if (line.quantity && line.unitPrice) {
        const lineTotal = line.quantity * line.unitPrice;
        totalPrice += lineTotal;

        // Aggiorna totale linea
        setValue(`lines.${index}.totalPrice`, lineTotal);
      }

      if (line.deliveryTime) {
        totalTime = Math.max(totalTime, line.deliveryTime);
      }
    });

    setValue('totalPrice', totalPrice);
    setValue('totalTime', totalTime);
  }, [watchedLines, setValue]);

  const onSubmit = async (data: OfferFormData) => {
    if (!token) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/rdo/submit-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          offerData: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nell'invio offerta");
      }

      setSuccess(true);

      // Redirect dopo 3 secondi
      setTimeout(() => {
        router.push('/rdo/thank-you');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'invio");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifica accesso in corso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Accesso Negato</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Offerta Inviata!</h1>
          <p className="text-gray-600 mb-4">
            La tua offerta è stata ricevuta con successo. Riceverai una conferma via email.
          </p>
          <div className="animate-pulse text-blue-600">Reindirizzamento in corso...</div>
        </div>
      </div>
    );
  }

  if (!rdoData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{rdoData.title}</h1>
              <p className="text-gray-600 mt-2">Richiesta di Offerta - {rdoData.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Vendor</div>
              <div className="font-semibold text-gray-900">{vendorName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Scadenza</div>
              <div className="text-lg font-semibold text-blue-900">
                {new Date(rdoData.deadline).toLocaleDateString('it-IT')}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Linee</div>
              <div className="text-lg font-semibold text-green-900">{rdoData.lines.length}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Stato</div>
              <div className="text-lg font-semibold text-purple-900">Aperto</div>
            </div>
          </div>
        </div>

        {/* Form Offerta */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compila la tua Offerta</h2>

          {/* Linee RDO */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Specifiche Tecniche</h3>

            {rdoData.lines.map((line, lineIndex) => (
              <div key={line.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{line.description}</h4>
                  <p className="text-sm text-gray-600 mt-1">{line.specifications}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      Quantità: {line.quantity} {line.unit}
                    </span>
                    {line.requirements.length > 0 && (
                      <span>Requisiti: {line.requirements.join(', ')}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prezzo Unitario (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`lines.${lineIndex}.unitPrice`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    {errors.lines?.[lineIndex]?.unitPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lines[lineIndex]?.unitPrice?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Totale Linea (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`lines.${lineIndex}.totalPrice`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Consegna (gg)
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register(`lines.${lineIndex}.deliveryTime`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    {errors.lines?.[lineIndex]?.deliveryTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lines[lineIndex]?.deliveryTime?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <input
                      type="text"
                      {...register(`lines.${lineIndex}.notes`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Note opzionali"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totali e Qualità */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prezzo Totale (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('totalPrice', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-lg font-semibold"
                readOnly
              />
              {errors.totalPrice && (
                <p className="text-red-500 text-xs mt-1">{errors.totalPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo Totale Consegna (gg)
              </label>
              <input
                type="number"
                min="1"
                {...register('totalTime', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-lg font-semibold"
                readOnly
              />
              {errors.totalTime && (
                <p className="text-red-500 text-xs mt-1">{errors.totalTime.message}</p>
              )}
            </div>
          </div>

          {/* Qualità e Note */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Punteggio Qualità (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('qualityScore', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8"
              />
              {errors.qualityScore && (
                <p className="text-red-500 text-xs mt-1">{errors.qualityScore.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note sulla Qualità
              </label>
              <textarea
                rows={3}
                {...register('qualityNotes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrivi i materiali, certificazioni e garanzie offerte..."
              />
              {errors.qualityNotes && (
                <p className="text-red-500 text-xs mt-1">{errors.qualityNotes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Tecniche</label>
              <textarea
                rows={4}
                {...register('technicalNotes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrivi l'approccio tecnico, metodologie e soluzioni proposte..."
              />
              {errors.technicalNotes && (
                <p className="text-red-500 text-xs mt-1">{errors.technicalNotes.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Tutti i campi obbligatori devono essere compilati
            </div>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Invio in corso...
                </>
              ) : (
                'Invia Offerta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
