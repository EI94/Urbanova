'use client';

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Semplice
        </h1>
        <p className="text-gray-600 mb-4">
          Questa è una pagina di test semplice per verificare che Next.js funzioni.
        </p>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-green-600 font-semibold">
            ✅ Pagina caricata correttamente!
          </p>
        </div>
      </div>
    </div>
  );
}
