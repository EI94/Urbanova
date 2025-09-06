import { NextRequest, NextResponse } from 'next/server';

import { realEmailService } from '@/lib/realEmailService';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Feedback] Inizio elaborazione richiesta...');
    console.log('📝 [Feedback] Headers ricevuti:', Object.fromEntries(request.headers.entries()));

    const contentType = request.headers.get('content-type') || '';
    console.log('📝 [Feedback] Content-Type:', contentType);

    let feedback: any;
    let feedbackJson: string;

    // Gestisci diversi tipi di contenuto
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        console.log('✅ [Feedback] FormData parsato correttamente');
        feedbackJson = formData.get('feedback') as string;
        feedback = JSON.parse(feedbackJson);
      } catch (formDataError) {
        console.error('❌ [Feedback] Errore parsing FormData:', formDataError);
        return NextResponse.json(
          { error: 'Errore nel parsing dei dati FormData' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('application/json')) {
      try {
        feedback = await request.json();
        feedbackJson = JSON.stringify(feedback);
        console.log('✅ [Feedback] JSON parsato correttamente');
      } catch (jsonError) {
        console.error('❌ [Feedback] Errore parsing JSON:', jsonError);
        return NextResponse.json({ error: 'Errore nel parsing dei dati JSON' }, { status: 400 });
      }
    } else {
      console.error('❌ [Feedback] Content-Type non supportato:', contentType);
      return NextResponse.json(
        { error: 'Content-Type non supportato. Usa multipart/form-data o application/json.' },
        { status: 400 }
      );
    }

    console.log('📝 [Feedback] Feedback JSON ricevuto:', feedbackJson);

    if (!feedbackJson) {
      console.error('❌ [Feedback] Dati feedback mancanti');
      return NextResponse.json({ error: 'Dati feedback mancanti' }, { status: 400 });
    }

    console.log('🔍 [Feedback] Feedback ricevuto:', feedback);

    // Validazione dati
    if (
      !feedback.title ||
      !feedback.description ||
      !feedback.type ||
      !feedback.priority ||
      !feedback.userEmail
    ) {
      console.error('❌ [Feedback] Campi obbligatori mancanti:', {
        title: !!feedback.title,
        description: !!feedback.description,
        type: !!feedback.type,
        priority: !!feedback.priority,
        userEmail: !!feedback.userEmail,
      });
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti. Assicurati di essere autenticato.' },
        { status: 400 }
      );
    }

    console.log('✅ [Feedback] Validazione completata');

    // Genera un ID univoco per il feedback
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Genera email professionale per Pierpaolo
    const emailHtml = generateFeedbackEmail(feedback, feedbackId, '');

    // Invia email a Pierpaolo usando realEmailService (stesso servizio delle email funzionanti)
    let emailSuccess = false;
    try {
      console.log('📧 [Feedback] Invio email usando realEmailService...');

      // Crea la notifica email nel formato richiesto da realEmailService
      const emailNotification = {
        to: 'pierpaolo.laurito@gmail.com',
        subject: `🚨 Nuovo Feedback: ${feedback.title} - ${feedback.type.toUpperCase()}`,
        htmlContent: emailHtml,
        lands: [], // Non necessario per feedback
        summary: {
          totalFound: 0,
          averagePrice: 0,
          bestOpportunities: [],
        },
      };

      // Invia email usando realEmailService (stesso servizio delle email funzionanti)
      await realEmailService.sendEmail(emailNotification);

      emailSuccess = true;
      console.log('✅ [Feedback] Email inviata con successo tramite realEmailService');
    } catch (emailError) {
      console.error('❌ [Feedback] Errore invio email:', emailError);
      // Se le email falliscono, è un problema critico
      return NextResponse.json(
        { error: "Errore nell'invio delle email di feedback" },
        { status: 500 }
      );
    }

    // Se l'utente ha fornito email, invia conferma usando realEmailService
    if (feedback.userEmail) {
      console.log("📧 [Feedback] Invio email di conferma all'utente...");
      try {
        const confirmationHtml = generateConfirmationEmail(feedback, feedbackId);

        const confirmationNotification = {
          to: feedback.userEmail,
          subject: `✅ Feedback ricevuto - Urbanova AI`,
          htmlContent: confirmationHtml,
          lands: [],
          summary: {
            totalFound: 0,
            averagePrice: 0,
            bestOpportunities: [],
          },
        };

        await realEmailService.sendEmail(confirmationNotification);
        console.log('📧 [Feedback] Email conferma inviata con successo');
      } catch (confirmationError) {
        console.warn('⚠️ [Feedback] Email conferma non inviata:', confirmationError);
        // Non bloccare il processo se la conferma fallisce
      }
    }

    // Tentativo di salvataggio su Firebase (opzionale, non blocca il processo)
    let firebaseSuccess = false;
    try {
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { addDoc, serverTimestamp } = await import('firebase/firestore');

      const feedbackData = {
        ...feedback,
        id: feedbackId,
        attachmentUrl: '',
        createdAt: serverTimestamp(),
        status: 'new',
        assignedTo: null,
        resolvedAt: null,
        resolution: null,
        tags: [feedback.type, feedback.priority, feedback.screen].filter(Boolean),
        emailSent: emailSuccess,
        emailSentAt: serverTimestamp(),
      };

      console.log('💾 [Feedback] Tentativo salvataggio su Firebase...');
      const feedbackRef = await addDoc(safeCollection('feedback'), feedbackData);
      firebaseSuccess = true;
      console.log('✅ [Feedback] Feedback salvato su Firebase con ID:', feedbackRef.id);
    } catch (firebaseError) {
      console.warn('⚠️ [Feedback] Errore Firebase (non critico):', firebaseError);

      // Tentativo di salvataggio locale come fallback
      try {
        const { feedbackFallbackService } = await import('@/lib/feedbackFallbackService');
        if (feedbackFallbackService.isAvailable()) {
          await feedbackFallbackService.saveFeedbackLocally({
            ...feedback,
            tags: [feedback.type, feedback.priority, feedback.screen].filter(Boolean),
          });
          console.log('💾 [Feedback] Feedback salvato localmente come fallback');
        }
      } catch (fallbackError) {
        console.warn('⚠️ [Feedback] Anche il fallback locale è fallito:', fallbackError);
      }
    }

    // Log del successo
    console.log('🎉 [Feedback] Processo completato:', {
      emailSuccess,
      firebaseSuccess,
      feedbackId,
      userEmail: feedback.userEmail || 'non fornita',
    });

    // Risposta di successo
    return NextResponse.json({
      success: true,
      message: 'Feedback inviato con successo',
      feedbackId,
      emailSent: emailSuccess,
      firebaseSaved: firebaseSuccess,
    });
  } catch (error) {
    console.error('💥 [Feedback] Errore critico:', error);
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

// Genera email professionale per Pierpaolo
function generateFeedbackEmail(feedback: any, feedbackId: string, attachmentUrl: string): string {
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
  };

  const priorityLabels = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    critical: 'Critica',
  };

  const typeLabels = {
    bug: 'Bug',
    feature: 'Nuova Funzionalità',
    improvement: 'Miglioramento',
    question: 'Domanda',
    other: 'Altro',
  };

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuovo Feedback - Urbanova AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .feedback-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 12px; }
        .type-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #3B82F6; color: white; font-weight: bold; font-size: 12px; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .field-value { background: #f3f4f6; padding: 10px; border-radius: 5px; border-left: 4px solid #3B82F6; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .attachment { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🚨 Nuovo Feedback Ricevuto</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Urbanova AI - Sistema di Feedback</p>
        </div>
        
        <div class="content">
          <div class="feedback-card">
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
              <span class="type-badge">${(typeLabels as any)[feedback.type] || feedback.type}</span>
              <span class="priority-badge" style="background-color: ${(priorityColors as any)[feedback.priority] || '#6b7280'}">${(priorityLabels as any)[feedback.priority] || feedback.priority}</span>
            </div>
            
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">${feedback.title}</h2>
            
            <div class="field">
              <div class="field-label">📝 Descrizione</div>
              <div class="field-value">${feedback.description}</div>
            </div>
            
            ${
              feedback.screen
                ? `
            <div class="field">
              <div class="field-label">🖥️ Schermata</div>
              <div class="field-value">${feedback.screen}</div>
            </div>
            `
                : ''
            }
            
            ${
              feedback.category
                ? `
            <div class="field">
              <div class="field-label">🏷️ Categoria</div>
              <div class="field-value">${feedback.category}</div>
            </div>
            `
                : ''
            }
            
            <div class="field">
              <div class="field-label">👤 Dati Utente</div>
              <div class="field-value">
                <strong>Nome:</strong> ${feedback.userName || 'Non fornito'}<br>
                <strong>Cognome:</strong> ${feedback.userLastName || 'Non fornito'}<br>
                <strong>Email:</strong> ${feedback.userEmail || 'Non fornita'}<br>
                <strong>Ruolo:</strong> ${feedback.userRole || 'Non fornito'}<br>
                <strong>Azienda:</strong> ${feedback.userCompany || 'Non fornita'}
              </div>
            </div>
            
            <div class="field">
              <div class="field-label">🆔 ID Feedback</div>
              <div class="field-value">${feedbackId}</div>
            </div>
            
            <div class="field">
              <div class="field-label">⏰ Timestamp</div>
              <div class="field-value">${new Date().toLocaleString('it-IT')}</div>
            </div>
            
            ${
              feedback.userAgent
                ? `
            <div class="field">
              <div class="field-label">🌐 User Agent</div>
              <div class="field-value">${feedback.userAgent}</div>
            </div>
            `
                : ''
            }
          </div>
        </div>
        
        <div class="footer">
          <p>Questo feedback è stato inviato automaticamente dal sistema Urbanova AI.</p>
          <p>ID: ${feedbackId} | Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Genera email di conferma per l'utente
function generateConfirmationEmail(feedback: any, feedbackId: string): string {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback Ricevuto - Urbanova AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">✅ Feedback Ricevuto!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Grazie per il tuo contributo</p>
        </div>
        
        <div class="content">
          <div class="success-card">
            <div class="success-icon">🎉</div>
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">Grazie per il tuo feedback, ${feedback.userName || 'Utente'}!</h2>
            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">
              Ciao ${feedback.userName || 'Utente'}! Abbiamo ricevuto il tuo feedback e lo esamineremo attentamente per migliorare Urbanova AI.
            </p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #374151;">${feedback.title}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${feedback.description}</p>
            </div>
            <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
              ID Feedback: <strong>${feedbackId}</strong>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Urbanova AI - Trasformiamo i tuoi progetti in realtà</p>
          <p>Grazie ancora, ${feedback.userName || 'Utente'}! Questo è un messaggio automatico, non rispondere a questa email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
