import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    console.log('✅ [Feedback] Validazione completata, tentativo salvataggio su Firebase...');

    // Genera un ID temporaneo per il feedback
    const tempFeedbackId = `temp_${Date.now()}`;

    // Salva feedback su Firebase (con gestione errori)
    let feedbackId = tempFeedbackId;
    let firebaseSuccess = false;
    
    try {
      const feedbackData = {
        ...feedback,
        attachmentUrl: '',
        createdAt: serverTimestamp(),
        status: 'new',
        assignedTo: null,
        resolvedAt: null,
        resolution: null,
        tags: [feedback.type, feedback.priority, feedback.screen].filter(Boolean)
      };

      console.log('💾 [Feedback] Dati da salvare:', feedbackData);

      const feedbackRef = await addDoc(collection(db, 'feedback'), feedbackData);
      feedbackId = feedbackRef.id;
      firebaseSuccess = true;
      
      console.log('✅ [Feedback] Feedback salvato su Firebase con ID:', feedbackId);
    } catch (firebaseError) {
      console.warn('⚠️ [Feedback] Errore Firebase, continuo con email:', firebaseError);
      // Continua con l'invio email anche se Firebase fallisce
    }

    // Genera email professionale per Pierpaolo
    const emailHtml = generateFeedbackEmail(feedback, feedbackId, '');
    
    // Invia email a Pierpaolo se Resend è disponibile
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
        
        console.log('✅ [Feedback] Email inviate con successo');
      } catch (emailError) {
        console.warn('⚠️ [Feedback] Errore invio email:', emailError);
        throw new Error(`Email non inviata: ${emailError instanceof Error ? emailError.message : 'Errore sconosciuto'}`);
      }
    } else {
      console.warn('⚠️ [Feedback] Resend non configurato, email non inviate');
      throw new Error('Servizio email non configurato');
    }

    console.log('✅ [Feedback] Feedback elaborato con successo:', feedbackId);

    return NextResponse.json({
      success: true,
      feedbackId,
      firebaseSaved: firebaseSuccess,
      message: firebaseSuccess ? 'Feedback inviato e salvato con successo' : 'Feedback inviato via email (salvataggio Firebase fallito)'
    });

  } catch (error) {
    console.error('❌ [Feedback] Errore invio feedback:', error);
    console.error('❌ [Feedback] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Errore sconosciuto' },
      { status: 500 }
    );
  }
}

function generateFeedbackEmail(feedback: any, feedbackId: string, attachmentUrl: string): string {
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444'
  };

  const typeIcons = {
    bug: '🐛',
    improvement: '💡',
    feature: '⭐',
    other: '📝'
  };

  const priorityLabels = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    critical: 'Critica'
  };

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuovo Feedback - Urbanova AI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .feedback-card { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid ${priorityColors[feedback.priority]}; }
        .feedback-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .feedback-type { font-size: 24px; }
        .feedback-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0; }
        .feedback-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
        .meta-item { background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .meta-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
        .meta-value { font-size: 14px; color: #1f2937; font-weight: 500; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; background-color: ${priorityColors[feedback.priority]}; }
        .description { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
        .description h3 { margin: 0 0 12px 0; color: #1f2937; font-size: 16px; }
        .description p { margin: 0; color: #4b5563; line-height: 1.6; }
        .attachment { display: none; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 0 8px; }
        .btn:hover { background-color: #2563eb; }
        .btn-secondary { background-color: #6b7280; }
        .btn-secondary:hover { background-color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Nuovo Feedback Ricevuto</h1>
          <p>Urbanova AI - Sistema di Feedback</p>
        </div>
        
        <div class="content">
          <div class="feedback-card">
            <div class="feedback-header">
              <span class="feedback-type">${typeIcons[feedback.type]}</span>
              <h2 class="feedback-title">${feedback.title}</h2>
            </div>
            
            <div class="feedback-meta">
              <div class="meta-item">
                <div class="meta-label">Tipo</div>
                <div class="meta-value">${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Priorità</div>
                <div class="meta-value"><span class="priority-badge">${priorityLabels[feedback.priority]}</span></div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Schermata</div>
                <div class="meta-value">${feedback.screen || 'Non specificata'}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">ID Feedback</div>
                <div class="meta-value">#${feedbackId}</div>
              </div>
            </div>
            
            <div class="description">
              <h3>Descrizione Dettagliata</h3>
              <p>${feedback.description.replace(/\n/g, '<br>')}</p>
            </div>
            
            ${feedback.userEmail ? `
              <div class="meta-item">
                <div class="meta-label">Email Utente</div>
                <div class="meta-value">${feedback.userEmail}</div>
              </div>
            ` : ''}
            

            
            <div class="meta-item">
              <div class="meta-label">Informazioni Tecniche</div>
              <div class="meta-value">
                <strong>User Agent:</strong> ${feedback.userAgent}<br>
                <strong>Timestamp:</strong> ${new Date(feedback.timestamp).toLocaleString('it-IT')}
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <a href="https://urbanova-ai.vercel.app/dashboard/feedback" class="btn">📊 Visualizza Dashboard</a>
            <a href="mailto:${feedback.userEmail || 'noreply@urbanova.ai'}?subject=Re: Feedback #${feedbackId}" class="btn btn-secondary">✉️ Rispondi</a>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; color: #92400e;">💡 Prossimi Passi Suggeriti</h3>
            <ul style="margin: 0; color: #92400e; padding-left: 20px;">
              <li>Analizza la priorità e l'impatto del feedback</li>
              <li>Valuta la fattibilità tecnica dell'implementazione</li>
              <li>Stima il tempo di sviluppo necessario</li>
              <li>Pianifica la roadmap di implementazione</li>
              <li>Aggiorna lo stato del feedback nella dashboard</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Questo feedback è stato inviato automaticamente dal sistema di feedback di Urbanova AI</p>
          <p>Feedback ID: #${feedbackId} | ${new Date().toLocaleString('it-IT')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateConfirmationEmail(feedback: any, feedbackId: string): string {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback Ricevuto - Urbanova AI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; text-align: center; }
        .success-icon { font-size: 64px; margin: 20px 0; }
        .message { background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .message h2 { margin: 0 0 16px 0; color: #166534; }
        .message p { margin: 0; color: #166534; line-height: 1.6; }
        .feedback-details { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: left; }
        .feedback-details h3 { margin: 0 0 16px 0; color: #1f2937; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #1f2937; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Feedback Ricevuto!</h1>
          <p>Grazie per il tuo contributo a Urbanova AI</p>
        </div>
        
        <div class="content">
          <div class="success-icon">🎉</div>
          
          <div class="message">
            <h2>Grazie di cuore per il tuo feedback!</h2>
            <p>Il tuo contributo è fondamentale per migliorare Urbanova AI e renderla sempre più utile per tutti i nostri utenti.</p>
          </div>
          
          <div class="feedback-details">
            <h3>📋 Dettagli del Feedback</h3>
            <div class="detail-row">
              <span class="detail-label">ID Feedback:</span>
              <span class="detail-value">#${feedbackId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priorità:</span>
              <span class="detail-value">${feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Schermata:</span>
              <span class="detail-value">${feedback.screen || 'Non specificata'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data:</span>
              <span class="detail-value">${new Date(feedback.timestamp).toLocaleString('it-IT')}</span>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #92400e;">🔄 Cosa succede ora?</h3>
            <ul style="margin: 0; color: #92400e; padding-left: 20px; text-align: left;">
              <li>Il nostro team analizzerà il tuo feedback entro 24 ore</li>
              <li>Valuteremo la priorità e la fattibilità dell'implementazione</li>
              <li>Ti aggiorneremo sullo stato del feedback</li>
              <li>Se hai fornito la tua email, riceverai notizie sui progressi</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Hai altre idee o hai notato altri problemi? Non esitare a inviare altro feedback!
          </p>
        </div>
        
        <div class="footer">
          <p>Urbanova AI - Trasformiamo i tuoi progetti in realtà</p>
          <p>Feedback ID: #${feedbackId} | ${new Date().toLocaleString('it-IT')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
