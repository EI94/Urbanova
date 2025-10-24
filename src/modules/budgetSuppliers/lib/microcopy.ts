/**
 * 🌐 BUDGET SUPPLIERS MICROCOPY DATA
 * 
 * Microcopy e policy per Budget & Suppliers
 */

export const budgetSuppliersMicrocopy = {
  microcopy: {
    budgetPrivacy: {
      title: "Privacy del Budget",
      message: "Il budget non viene condiviso ai fornitori.",
      description: "I valori di budget sono utilizzati internamente per valutare le offerte ricevute, ma non vengono mai comunicati ai fornitori durante il processo di gara."
    },
    benchmarkDisclaimer: {
      title: "Disclaimer Benchmark",
      message: "I prezzi 'Benchmark Lazio 2023' sono riferimenti indicativi, non vincolanti.",
      description: "I prezzi benchmark sono calcolati su dati storici del mercato laziale e servono come riferimento orientativo. Non costituiscono prezzi vincolanti o garantiti."
    },
    offerValidation: {
      title: "Validazione Offerte",
      message: "Le offerte incomplete o con esclusioni critiche sono evidenziate.",
      description: "Il sistema evidenzia automaticamente le offerte che presentano elementi mancanti o esclusioni che potrebbero impattare significativamente sul progetto."
    },
    rfpGuidelines: {
      title: "Linee Guida RFP",
      message: "Assicurati che tutti gli items abbiano descrizioni chiare e specifiche tecniche complete.",
      description: "Una descrizione dettagliata degli items aiuta i fornitori a comprendere meglio i requisiti e a fornire offerte più accurate."
    },
    contractMilestones: {
      title: "Milestone Contratto",
      message: "Le milestone devono essere realistiche e allineate con il cronoprogramma del progetto.",
      description: "Definisci milestone che rispecchiano il reale avanzamento dei lavori e che permettano un controllo efficace del progetto."
    },
    driftAlerts: {
      title: "Alert Drift",
      message: "Gli alert di drift ti aiutano a identificare tempestivamente le deviazioni dal budget o dal cronoprogramma.",
      description: "Il sistema monitora automaticamente le variazioni e ti notifica quando superano le soglie predefinite."
    },
    vendorPortal: {
      title: "Portale Fornitori",
      message: "I fornitori possono accedere al portale tramite link sicuro e inviare le proprie offerte.",
      description: "Ogni fornitore riceve un link unico e sicuro per accedere al portale e visualizzare gli items della gara."
    },
    dataSecurity: {
      title: "Sicurezza Dati",
      message: "Tutti i dati sono protetti con crittografia end-to-end e accesso basato su ruoli.",
      description: "Il sistema implementa le migliori pratiche di sicurezza per proteggere le informazioni sensibili del progetto."
    }
  },
  policy: {
    budgetConfidentiality: {
      title: "Confidenzialità Budget",
      content: "Il budget del progetto è strettamente confidenziale e non deve essere condiviso con fornitori esterni durante il processo di gara. Questa policy garantisce la trasparenza e l'equità del processo di selezione.",
      enforcement: "Violazioni di questa policy possono comportare l'esclusione dal processo di gara."
    },
    benchmarkUsage: {
      title: "Utilizzo Benchmark",
      content: "I prezzi benchmark sono forniti come riferimento indicativo basato su dati storici del mercato. Non costituiscono prezzi vincolanti e devono essere utilizzati solo come strumento di orientamento per la valutazione delle offerte.",
      enforcement: "I benchmark non devono essere utilizzati come unico criterio di valutazione."
    },
    offerTransparency: {
      title: "Trasparenza Offerte",
      content: "Tutte le offerte devono essere complete e trasparenti. Le esclusioni devono essere chiaramente indicate e giustificate. Offerte incomplete o con esclusioni critiche non giustificate possono essere penalizzate nella valutazione.",
      enforcement: "Le offerte incomplete possono essere escluse dalla valutazione."
    },
    vendorSelection: {
      title: "Selezione Fornitori",
      content: "La selezione dei fornitori deve essere basata su criteri oggettivi e trasparenti. Il sistema supporta la valutazione multi-criterio considerando prezzo, qualità, tempi di consegna e affidabilità del fornitore.",
      enforcement: "La selezione deve essere documentata e giustificata."
    },
    contractManagement: {
      title: "Gestione Contratti",
      content: "I contratti devono essere gestiti in conformità alle normative vigenti e alle policy aziendali. Tutte le modifiche contrattuali devono essere documentate e approvate secondo i livelli di autorizzazione previsti.",
      enforcement: "Le modifiche non autorizzate non sono valide."
    },
    dataRetention: {
      title: "Conservazione Dati",
      content: "I dati del progetto devono essere conservati secondo le normative sulla privacy e le policy aziendali. I dati sensibili devono essere cancellati alla scadenza del periodo di conservazione previsto.",
      enforcement: "La conservazione dei dati deve rispettare il GDPR e le normative locali."
    }
  },
  notifications: {
    rfpCreated: {
      title: "RFP Creato",
      message: "RFP '{rfpName}' creato con successo per {itemsCount} items.",
      action: "Visualizza RFP"
    },
    offersReceived: {
      title: "Offerte Ricevute",
      message: "{offersCount} nuove offerte ricevute per RFP '{rfpName}'.",
      action: "Confronta Offerte"
    },
    contractAwarded: {
      title: "Contratto Aggiudicato",
      message: "Contratto '{contractName}' aggiudicato a {vendorName} per €{amount}.",
      action: "Visualizza Contratto"
    },
    driftDetected: {
      title: "Drift Rilevato",
      message: "Drift del {percentage}% rilevato per {itemName}.",
      action: "Gestisci Drift"
    },
    milestoneReached: {
      title: "Milestone Raggiunta",
      message: "Milestone '{milestoneName}' raggiunta per contratto '{contractName}'.",
      action: "Registra SAL"
    }
  },
  tooltips: {
    budgetColumn: "Valore di budget stimato per questo item",
    offerColumn: "Migliore offerta ricevuta per questo item",
    contractColumn: "Valore contrattuale per questo item",
    consuntivoColumn: "Valore consuntivo registrato tramite SAL",
    deltaColumn: "Variazione percentuale rispetto al budget",
    rfpStatus: "Stato attuale della gara: Attiva, Chiusa, Aggiudicata",
    offerCount: "Numero di offerte ricevute per questo RFP",
    vendorCount: "Numero di fornitori invitati alla gara",
    dueDate: "Data di scadenza per l'invio delle offerte",
    bundleIndicator: "Indica se questo contratto è un bundle di più items",
    driftIndicator: "Indica il livello di drift rispetto al budget originale"
  },
  placeholders: {
    searchItems: "Cerca items per descrizione, categoria o codice...",
    searchVendors: "Cerca fornitori per nome o email...",
    searchRfps: "Cerca RFP per nome o progetto...",
    searchContracts: "Cerca contratti per nome o fornitore...",
    itemDescription: "Inserisci una descrizione dettagliata dell'item...",
    vendorNotes: "Note aggiuntive per il fornitore...",
    contractNotes: "Note specifiche per il contratto...",
    salDescription: "Descrizione del lavoro completato...",
    variationReason: "Motivo della variazione contrattuale..."
  },
  errors: {
    rfpCreation: {
      noItemsSelected: "Seleziona almeno un item per creare l'RFP",
      noVendorsSelected: "Seleziona almeno un fornitore per l'RFP",
      invalidDueDate: "La data di scadenza deve essere futura",
      duplicateRfpName: "Esiste già un RFP con questo nome"
    },
    offerSubmission: {
      incompleteOffer: "Completa tutti i campi obbligatori",
      invalidPrice: "Il prezzo deve essere maggiore di zero",
      missingAttachments: "Allegati richiesti mancanti",
      expiredRfp: "L'RFP è scaduto"
    },
    contractCreation: {
      noItemsAwarded: "Seleziona almeno un item da aggiudicare",
      invalidMilestones: "Le milestone devono sommare al 100%",
      missingVendorInfo: "Informazioni fornitore incomplete"
    },
    salRecording: {
      invalidAmount: "L'importo deve essere maggiore di zero",
      exceedsContract: "L'importo supera il valore contrattuale",
      duplicateSal: "SAL già registrato per questo item"
    }
  },
  success: {
    rfpCreated: "RFP creato con successo",
    offersSubmitted: "Offerte inviate con successo",
    contractAwarded: "Contratto aggiudicato con successo",
    salRecorded: "SAL registrato con successo",
    variationCreated: "Variazione creata con successo",
    dataExported: "Dati esportati con successo",
    syncCompleted: "Sincronizzazione completata con successo"
  },
  warnings: {
    budgetExceeded: "Il costo contrattuale supera il budget del {percentage}%",
    scheduleDelay: "Ritardo di {days} giorni rispetto al cronoprogramma",
    qualityIssues: "Segnalazioni di qualità per {itemName}",
    vendorPerformance: "Performance del fornitore sotto la media",
    driftThreshold: "Drift superiore alla soglia del {percentage}%",
    expiringContracts: "Contratti in scadenza nei prossimi {days} giorni"
  },
  confirmations: {
    deleteRfp: {
      title: "Elimina RFP",
      message: "Sei sicuro di voler eliminare l'RFP '{rfpName}'? Questa azione non può essere annullata.",
      confirm: "Elimina",
      cancel: "Annulla"
    },
    deleteOffer: {
      title: "Elimina Offerta",
      message: "Sei sicuro di voler eliminare l'offerta di {vendorName}?",
      confirm: "Elimina",
      cancel: "Annulla"
    },
    deleteContract: {
      title: "Elimina Contratto",
      message: "Sei sicuro di voler eliminare il contratto '{contractName}'?",
      confirm: "Elimina",
      cancel: "Annulla"
    },
    closeRfp: {
      title: "Chiudi RFP",
      message: "Chiudere l'RFP impedirà l'invio di nuove offerte. Continuare?",
      confirm: "Chiudi",
      cancel: "Annulla"
    },
    syncBusinessPlan: {
      title: "Sincronizza Business Plan",
      message: "La sincronizzazione aggiornerà il Business Plan con i dati contrattuali. Continuare?",
      confirm: "Sincronizza",
      cancel: "Annulla"
    }
  },
  help: {
    gettingStarted: {
      title: "Inizia con Budget & Suppliers",
      steps: [
        "Importa o crea il tuo BoQ (Bill of Quantities)",
        "Seleziona gli items per cui vuoi lanciare una gara",
        "Invita i fornitori e crea l'RFP",
        "Raccogli e confronta le offerte ricevute",
        "Aggiudica i contratti e gestisci l'esecuzione"
      ]
    },
    bestPractices: {
      title: "Migliori Pratiche",
      tips: [
        "Mantieni sempre aggiornato il budget con i dati contrattuali",
        "Monitora regolarmente i drift per identificare problemi tempestivamente",
        "Utilizza i benchmark come riferimento, non come vincolo",
        "Documenta sempre le esclusioni e le variazioni",
        "Mantieni la trasparenza nel processo di selezione"
      ]
    },
    troubleshooting: {
      title: "Risoluzione Problemi",
      common: [
        "Se l'RFP non viene visualizzato, verifica che sia stato creato correttamente",
        "Se le offerte non arrivano, controlla che l'RFP sia attivo e non scaduto",
        "Se i contratti non si sincronizzano, verifica i dati del Business Plan",
        "Se i drift non vengono calcolati, controlla che i SAL siano registrati correttamente"
      ]
    }
  }
} as const;

