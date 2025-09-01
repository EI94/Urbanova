import { NextRequest, NextResponse } from 'next/server';

import { ReminderEmailData } from '@/lib/reminderService';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 API: Invio mail reminder...');

    const {
      emailData,
      userEmail,
    }: {
      emailData: ReminderEmailData;
      userEmail: string;
    } = await request.json();

    // Valida i dati
    if (!emailData || !userEmail) {
      return NextResponse.json({ error: "Dati mancanti per l'invio della mail" }, { status: 400 });
    }

    // Prepara il contenuto della mail
    const emailContent = generateReminderEmailContent(emailData);
    const emailSubject = `⏰ REMINDER: ${emailData.projectName} - ${emailData.reminderDate}`;

    // Invia la mail (qui integreremo con il servizio email esistente)
    // Per ora simuliamo l'invio
    console.log('📧 Mail reminder preparata:', {
      to: userEmail,
      subject: emailSubject,
      content: emailContent,
    });

    // TODO: Integrare con il servizio email esistente
    // await emailService.sendEmail({
    //   to: userEmail,
    //   subject: emailSubject,
    //   html: emailContent
    // });

    console.log('✅ Mail reminder inviata con successo a:', userEmail);

    return NextResponse.json({
      success: true,
      message: 'Reminder inviato con successo',
      reminderId: Date.now().toString(),
    });
  } catch (error) {
    console.error('❌ Errore API reminder email:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// Genera il contenuto HTML della mail del reminder
function generateReminderEmailContent(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder Progetto Urbanova</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
        }
        .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
        }
        .reminder-box { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
        }
        .project-info { 
            background: #e3f2fd; 
            border: 1px solid #bbdefb; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: #4caf50; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            font-weight: bold; 
            margin: 20px 0;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 14px;
        }
        .highlight { 
            background: #fff3cd; 
            padding: 2px 6px; 
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏰ REMINDER URBANOVA</h1>
        <p>Il tuo promemoria per il progetto</p>
    </div>
    
    <div class="content">
        <div class="reminder-box">
            <h2>📝 Il tuo promemoria</h2>
            <p><strong>Data:</strong> <span class="highlight">${data.reminderDate}</span></p>
            <p><strong>Ora:</strong> <span class="highlight">${data.reminderTime}</span></p>
            <p><strong>Nota:</strong> ${data.note}</p>
        </div>
        
        <div class="project-info">
            <h2>🏗️ Progetto: ${data.projectName}</h2>
            <p>Ecco un riepilogo del tuo progetto di fattibilità:</p>
            <pre style="white-space: pre-wrap; font-family: inherit;">${data.projectReport}</pre>
        </div>
        
        <div style="text-align: center;">
            <a href="${data.projectLink}" class="cta-button">
                🔗 APRI PROGETTO COMPLETO
            </a>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            <h3>💡 Cosa puoi fare ora?</h3>
            <ul>
                <li>Rivedere l'analisi di fattibilità</li>
                <li>Aggiornare i dati del progetto</li>
                <li>Condividere il report con il team</li>
                <li>Contattare i venditori o consulenti</li>
            </ul>
        </div>
    </div>
    
    <div class="footer">
        <p>Questo reminder è stato generato automaticamente da Urbanova AI</p>
        <p>Se hai domande, contatta il nostro team di supporto</p>
        <p>© 2024 Urbanova - Analisi di Fattibilità Intelligente</p>
    </div>
</body>
</html>
  `.trim();
}
