// Test diretto del servizio di fattibilità
const { feasibilityService } = require('./src/lib/feasibilityService.ts');

async function testFeasibilityDirect() {
  try {
    console.log('🔄 Test diretto servizio fattibilità...');
    
    // Test 1: Carica tutti i progetti
    console.log('\n📊 Test 1: Caricamento tutti i progetti');
    const allProjects = await feasibilityService.getAllProjects();
    console.log(`✅ Progetti totali: ${allProjects.length}`);
    
    if (allProjects.length > 0) {
      console.log('\n📋 Primi 5 progetti:');
      allProjects.slice(0, 5).forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name || 'Senza nome'} (${project.createdBy || 'Nessun utente'})`);
      });
    }
    
    // Test 2: Filtra per pierpaolo.laurito@gmail.com
    console.log('\n👤 Test 2: Progetti per pierpaolo.laurito@gmail.com');
    const userProjects = allProjects.filter(project => 
      project.createdBy === 'pierpaolo.laurito@gmail.com'
    );
    console.log(`✅ Progetti per pierpaolo.laurito@gmail.com: ${userProjects.length}`);
    
    if (userProjects.length > 0) {
      console.log('\n📋 Progetti utente:');
      userProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name || 'Senza nome'}`);
        console.log(`     ID: ${project.id}`);
        console.log(`     Indirizzo: ${project.address || 'Nessuno'}`);
        console.log(`     Creato: ${project.createdAt}`);
        console.log(`     Status: ${project.status || 'Nessuno'}`);
      });
    }
    
    // Test 3: Cerca "Ciliegie"
    console.log('\n🍒 Test 3: Ricerca progetto "Ciliegie"');
    const ciliegieProject = allProjects.find(project => 
      project.name && project.name.toLowerCase().includes('ciliegie')
    );
    
    if (ciliegieProject) {
      console.log('✅ TROVATO PROGETTO CILIEGIE!');
      console.log('📋 Dettagli progetto Ciliegie:');
      console.log(`  Nome: ${ciliegieProject.name}`);
      console.log(`  ID: ${ciliegieProject.id}`);
      console.log(`  Indirizzo: ${ciliegieProject.address || 'Nessuno'}`);
      console.log(`  Creato da: ${ciliegieProject.createdBy}`);
      console.log(`  Creato il: ${ciliegieProject.createdAt}`);
      console.log(`  Status: ${ciliegieProject.status || 'Nessuno'}`);
      console.log('📊 Dati completi:', JSON.stringify(ciliegieProject, null, 2));
    } else {
      console.log('❌ Progetto Ciliegie non trovato');
    }
    
    // Test 4: Statistiche
    console.log('\n📈 Test 4: Statistiche');
    const stats = await feasibilityService.getStatistics();
    console.log('✅ Statistiche caricate:', stats);
    
    console.log('\n✅ Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

// Esegui il test
testFeasibilityDirect();
