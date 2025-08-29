import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Usa la stessa chiave API che funziona in realEmailService.ts
const resend = new Resend('re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k');

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Feedback] Inizio elaborazione richiesta...');
    
    const formData = await request.formData();
    const feedbackJson = formData.get('feedback') as string;
    
    console.log('📝 [Feedback] Feedback JSON ricevuto:', feedbackJson);

    if (!feedbackJson) {
      console.error('❌ [Feedback] Dati feedback mancanti');
      return NextResponse.json(
        { error: 'Dati feedback mancanti' },
        { status: 400 }
      );
    }

    const feedback = JSON.parse(feedbackJson);
    console.log('🔍 [Feedback] Feedback parsato:', feedback);
    
    // Validazione dati
    if (!feedback.title || !feedback.description || !feedback.type || !feedback.priority) {
      console.error('❌ [Feedback] Campi obbligatori mancanti:', { title: !!feedback.title, description: !!feedback.description, type: !!feedback.type, priority: !!feedback.priority });
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    console.log('✅ [Feedback] Validazione completata');

    // Genera un ID univoco per il feedback
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Genera email professionale per Pierpaolo
    const emailHtml = generateFeedbackEmail(feedback, feedbackId, '');
    
    // Invia email a Pierpaolo - PRIORITÀ ASSOLUTA
    let emailSuccess = false;
    if (resend) {
      try {
        console.log('📧 [Feedback] Invio email a Pierpaolo...');
        await resend.emails.send({
          from: 'Urbanova AI <feedback@urbanova.ai>',
          to: 'pierpaolo.laurito@gmail.com',
          subject: `🚨 Nuovo Feedback: ${feedback.title} - ${feedback.type.toUpperCase()}`,
          html: emailHtml,
          replyTo: feedback.userEmail || 'noreply@urbanova.ai'
        });

        // Se l'utente ha fornito email, invia conferma
        if (feedback.userEmail) {
          console.log('📧 [Feedback] Invio email di conferma all\'utente...');
          const confirmationHtml = generateConfirmationEmail(feedback, feedbackId);
          await resend.emails.send({
            from: 'Urbanova AI <feedback@urbanova.ai>',
            to: feedback.userEmail,
            subject: '✅ Feedback ricevuto - Urbanova AI',
            html: confirmationHtml
          });
        }
        
        emailSuccess = true;
        console.log('✅ [Feedback] Email inviate con successo');
      } catch (emailError) {
        console.error('❌ [Feedback] Errore critico invio email:', emailError);
        // Se le email falliscono, è un problema critico
        return NextResponse.json(
          { error: 'Errore nell\'invio delle email di feedback' },
          { status: 500 }
        );
      }
    } else {
      console.error('❌ [Feedback] Servizio email non configurato');
      return NextResponse.json(
        { error: 'Servizio email non configurato' },
        { status: 500 }
      );
    }

    // Tentativo di salvataggio su Firebase (opzionale, non blocca il processo)
    let firebaseSuccess = false;
    try {
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
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
        emailSentAt: serverTimestamp()
      };

      console.log('💾 [Feedback] Tentativo salvataggio su Firebase...');
      const feedbackRef = await addDoc(collection(db, 'feedback'), feedbackData);
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
            tags: [feedback.type, feedback.priority, feedback.screen].filter(Boolean)
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
      userEmail: feedback.userEmail || 'non fornita'
    });

    // Risposta di successo
    return NextResponse.json({
      success: true,
      message: 'Feedback inviato con successo',
      feedbackId,
      emailSent: emailSuccess,
      firebaseSaved: firebaseSuccess
    });

  } catch (error) {
    console.error('💥 [Feedback] Errore critico:', error);
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
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
    critical: '#DC2626'
  };

  const priorityLabels = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    critical: 'Critica'
  };

  const typeLabels = {
    bug: 'Bug',
    feature: 'Nuova Funzionalità',
    improvement: 'Miglioramento',
    question: 'Domanda',
    other: 'Altro'
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
              <span class="type-badge">${typeLabels[feedback.type] || feedback.type}</span>
              <span class="priority-badge" style="background-color: ${priorityColors[feedback.priority] || '#6b7280'}">${priorityLabels[feedback.priority] || feedback.priority}</span>
            </div>
            
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">${feedback.title}</h2>
            
            <div class="field">
              <div class="field-label">📝 Descrizione</div>
              <div class="field-value">${feedback.description}</div>
            </div>
            
            ${feedback.screen ? `
            <div class="field">
              <div class="field-label">🖥️ Schermata</div>
              <div class="field-value">${feedback.screen}</div>
            </div>
            ` : ''}
            
            ${feedback.category ? `
            <div class="field">
              <div class="field-label">🏷️ Categoria</div>
              <div class="field-value">${feedback.category}</div>
            </div>
            ` : ''}
            
            ${feedback.userEmail ? `
            <div class="field">
              <div class="field-label">📧 Email Utente</div>
              <div class="field-value">${feedback.userEmail}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="field-label">🆔 ID Feedback</div>
              <div class="field-value">${feedbackId}</div>
            </div>
            
            <div class="field">
              <div class="field-label">⏰ Timestamp</div>
              <div class="field-value">${new Date().toLocaleString('it-IT')}</div>
            </div>
            
            ${feedback.userAgent ? `
            <div class="field">
              <div class="field-label">🌐 User Agent</div>
              <div class="field-value" style="font-size: 12px; word-break: break-all;">${feedback.userAgent}</div>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">📋 Azioni Raccomandate</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Analizza il feedback entro 24 ore</li>
              <li>Assegna priorità e responsabilità</li>
              <li>Aggiorna lo stato nella dashboard feedback</li>
              <li>Comunica con l'utente se necessario</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Questo feedback è stato inviato automaticamente dal sistema Urbanova AI</p>
          <p>ID: ${feedbackId} | ${new Date().toISOString()}</p>
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
            <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
            <h2 style="margin: 0 0 15px 0; color: #059669;">Grazie per il tuo feedback!</h2>
            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px;">
              Il tuo contributo è fondamentale per migliorare Urbanova AI. 
              Il nostro team analizzerà il tuo feedback e ti terrà aggiornato sui progressi.
            </p>
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">📋 Dettagli del Feedback</h3>
              <p style="margin: 5px 0; color: #0c4a6e;"><strong>Tipo:</strong> ${feedback.type}</p>
              <p style="margin: 5px 0; color: #0c4a6e;"><strong>Priorità:</strong> ${feedback.priority}</p>
              <p style="margin: 5px 0; color: #0c4a6e;"><strong>ID:</strong> ${feedbackId}</p>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
              Hai altre domande o suggerimenti? Non esitare a contattarci!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Urbanova AI - Trasformiamo i tuoi progetti in realtà</p>
          <p>ID Feedback: ${feedbackId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
