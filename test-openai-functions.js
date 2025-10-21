// Test diretto OpenAI Function Calling
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testFunctionCalling() {
  console.log('🧪 Test OpenAI Function Calling\n');

  const functions = [
    {
      name: 'feasibility_analyze',
      description: 'Analizza la fattibilità economica di un progetto immobiliare',
      parameters: {
        type: 'object',
        properties: {
          landArea: {
            type: 'number',
            description: 'Superficie del terreno in mq'
          },
          location: {
            type: 'string',
            description: 'Località del progetto'
          },
          constructionCost: {
            type: 'number',
            description: 'Costo di costruzione per mq in euro'
          }
        },
        required: ['landArea']
      }
    }
  ];

  try {
    console.log('📤 Invio richiesta a OpenAI...\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente immobiliare. Quando l\'utente chiede di fare un\'analisi, DEVI chiamare la function feasibility_analyze. NON rispondere con testo.'
        },
        {
          role: 'user',
          content: 'Analizza fattibilità terreno Roma 3000 mq'
        }
      ],
      functions: functions,
      function_call: 'auto',
      temperature: 0.1,
    });

    console.log('📥 Risposta OpenAI:\n');
    const message = response.choices[0].message;
    
    if (message.function_call) {
      console.log('✅ FUNCTION CALL ATTIVATA!');
      console.log(`   Nome: ${message.function_call.name}`);
      console.log(`   Argomenti: ${message.function_call.arguments}`);
    } else {
      console.log('❌ NESSUNA FUNCTION CALL');
      console.log(`   Risposta testuale: ${message.content}`);
    }

    console.log('\n📊 Response completa:', JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testFunctionCalling();

