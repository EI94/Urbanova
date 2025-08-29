// Test script per l'API feedback
const testFeedback = async () => {
  try {
    console.log('🧪 Test API Feedback...');
    
    const formData = new FormData();
    const feedbackData = {
      type: 'bug',
      title: 'Test Bug',
      description: 'Questo è un test del sistema di feedback',
      priority: 'medium',
      screen: 'Dashboard',
      userAgent: 'Test Script',
      timestamp: new Date().toISOString(),
      userEmail: 'test@example.com'
    };
    
    formData.append('feedback', JSON.stringify(feedbackData));
    
    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: formData
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successo:', result);
    } else {
      const error = await response.text();
      console.error('❌ Errore:', error);
    }
    
  } catch (error) {
    console.error('💥 Errore di connessione:', error);
  }
};

// Esegui il test
testFeedback();
