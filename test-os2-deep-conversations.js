/**
 * 🧪 TEST MANIACALE URBANOVA OS 2.0 - 50 CONVERSAZIONI PROFONDE
 * 
 * Test con 50 profili utente diversi e conversazioni lunghe
 * per valutare:
 * - Context awareness
 * - Tool activation
 * - Collaborazione e empatia
 * - Gestione dati Urbanova
 * - Workflow multi-step
 */

const axios = require('axios');
const fs = require('fs');

// Configurazione
const API_URL = 'http://localhost:3112/api/os2/chat';
const BATCH_SIZE = 5; // Analisi ogni 5 test

// 50 Profili Utente Diversi con Conversazioni Profonde
const USER_PROFILES = [
  // BATCH 1: Sviluppatori Principianti (1-5)
  {
    id: 1,
    name: "Marco - Sviluppatore Principiante",
    email: "marco.rossi@gmail.com",
    conversation: [
      "Ciao, sono nuovo nello sviluppo immobiliare",
      "Ho un terreno a Roma di 3000 mq, cosa posso farci?",
      "Quanto costerebbe costruire appartamenti?",
      "Puoi farmi un'analisi di fattibilità?",
      "E se invece costruissi solo 6 unità invece di 10?",
      "Trasforma questa analisi in un business plan completo",
      "Quali sono i rischi maggiori?",
      "Salvami tutto e inviami un report"
    ]
  },
  {
    id: 2,
    name: "Laura - Investitrice Novice",
    email: "laura.bianchi@outlook.com",
    conversation: [
      "Salve, ho ereditato un terreno e non so cosa farne",
      "È a Milano, zona Porta Nuova, circa 2000 mq",
      "Conviene venderlo o costruire?",
      "Fammi vedere i numeri di un eventuale sviluppo",
      "Quanto tempo ci vorrebbe per vedere un ritorno?",
      "E se affittassi invece di vendere?",
      "Mostrami tutti gli scenari possibili",
      "Prepara una presentazione per la mia banca"
    ]
  },
  {
    id: 3,
    name: "Giuseppe - Architetto Esplorativo",
    email: "giuseppe.verdi@architettura.it",
    conversation: [
      "Buongiorno, sto valutando un progetto residenziale",
      "Terreno 5000 mq a Firenze, zona semicentrale",
      "Vorrei costruire ville di lusso",
      "Fai un'analisi preliminare",
      "Ok, ora fammi vedere cosa cambia se costruisco villette a schiera",
      "Confronta i due scenari per ROI e payback",
      "Quale consigli?",
      "Perfetto, procedi con un business plan per lo scenario migliore"
    ]
  },
  {
    id: 4,
    name: "Sofia - Project Manager Organizzata",
    email: "sofia.colombo@pmi.com",
    conversation: [
      "Ciao, gestisco 3 progetti contemporaneamente",
      "Mostrami tutti i miei progetti",
      "Voglio concentrarmi su quello di Bologna",
      "Fai sensitivity analysis sul business plan",
      "Cosa succede se i costi di costruzione aumentano del 15%?",
      "E se i prezzi di vendita scendono del 10%?",
      "Dammi il worst case scenario",
      "Condividi questa analisi con mario@team.com"
    ]
  },
  {
    id: 5,
    name: "Alessandro - Developer Veloce",
    email: "alessandro.ferrari@fast.dev",
    conversation: [
      "Voglio fare tutto velocemente",
      "Terreno Torino 4000 mq",
      "Analisi, business plan, sensitivity, export, tutto!",
      "Vai!",
      "Perfetto, ora mostrami solo il summary esecutivo",
      "Quali sono i 3 numeri chiave che devo sapere?",
      "OK salvami il progetto come 'Torino Residenziale 2025'",
      "Grazie!"
    ]
  },

  // BATCH 2: Professionisti Avanzati (6-10)
  {
    id: 6,
    name: "Francesco - CFO Dettagliato",
    email: "francesco.romano@cfo.com",
    conversation: [
      "Serve un'analisi finanziaria molto dettagliata",
      "Progetto 20 unità a Roma, target high-end",
      "Prezzo vendita medio 4500 €/mq",
      "Costo costruzione stimato 1800 €/mq",
      "Terreno disponibile a 600 €/mq, 6000 mq totali",
      "Calcola VAN, TIR, DSCR per scenari ottimistico, base, pessimistico",
      "Fai sensitivity su tutti i parametri chiave",
      "Voglio vedere break-even point e cash flow mensile",
      "Export tutto in formato presentazione"
    ]
  },
  {
    id: 7,
    name: "Chiara - Sustainability Expert",
    email: "chiara.green@ecodev.com",
    conversation: [
      "Ciao, lavoro su progetti sostenibili",
      "Ho un terreno a Bologna per housing sociale",
      "40 unità, mix sociale e libero mercato",
      "Considera costi superiori del 20% per certificazioni green",
      "Ma anche incentivi fiscali del 15%",
      "Fammi un business plan che tenga conto di questi fattori",
      "E se aggiungessi pannelli solari?",
      "Calcola payback con ricavi da energia",
      "Confronta scenario green vs tradizionale"
    ]
  },
  {
    id: 8,
    name: "Roberto - Negotiator Strategico",
    email: "roberto.negotiator@deals.com",
    conversation: [
      "Domani ho una trattativa importante",
      "Terreno Milano 3500 mq, chiedono 800 €/mq",
      "È un prezzo giusto?",
      "Fammi un'analisi rapida con questo prezzo",
      "E se nego a 650 €/mq?",
      "Mostrami la differenza di ROI tra i due scenari",
      "Qual è il prezzo massimo che posso pagare per ROI >25%?",
      "Preparami gli argomenti chiave per la negoziazione",
      "Invia tutto a me e al mio commercialista roberto.commer@studio.it"
    ]
  },
  {
    id: 9,
    name: "Valentina - Multi-project Manager",
    email: "valentina.multi@projects.com",
    conversation: [
      "Gestisco un portfolio di 8 progetti",
      "Mostra tutti i miei progetti",
      "Quali sono i 3 con ROI più alto?",
      "Fai sensitivity su ognuno dei top 3",
      "Confrontali side-by-side",
      "Su quale dovrei concentrare risorse ora?",
      "Crea un piano di prioritizzazione",
      "Aggiungi timeline suggerite per ciascuno",
      "Export report portfolio completo"
    ]
  },
  {
    id: 10,
    name: "Luca - Risk Manager",
    email: "luca.risk@safe.dev",
    conversation: [
      "Mi occupo di risk assessment",
      "Progetto Napoli, zona periferica in riqualificazione",
      "12 unità, mercato incerto",
      "Identifica tutti i rischi del progetto",
      "Quantifica l'impatto di ciascun rischio",
      "Cosa succede se le vendite ritardano di 12 mesi?",
      "E se i costi aumentano del 25%?",
      "Dammi il worst case scenario completo",
      "Suggerisci strategie di mitigazione",
      "Salva tutto come 'Napoli Risk Analysis'"
    ]
  },

  // BATCH 3: Scenari Complessi (11-15)
  {
    id: 11,
    name: "Elena - Developer con Terreno Complesso",
    email: "elena.complex@terrain.com",
    conversation: [
      "Ho un terreno molto irregolare",
      "8000 mq ma solo 60% edificabile",
      "Vincoli paesaggistici e altezza max 12m",
      "Posso fare solo 2 piani",
      "Considera questi vincoli nell'analisi",
      "Quale mix abitativo è più profittevole?",
      "2 locali, 3 locali o mix?",
      "Fai simulazioni per 3 scenari diversi",
      "Mostrami quale massimizza il VAN"
    ]
  },
  {
    id: 12,
    name: "Davide - Partnership Deal",
    email: "davide.partner@collab.com",
    conversation: [
      "Sto per entrare in partnership su un progetto",
      "Terreno Verona, io metto terreno, partner costruisce",
      "Split 40% me (terreno) 60% partner (costruzione)",
      "Terreno vale 1.2M, costruzione stimata 3.5M",
      "Vendite previste 6.5M",
      "È un deal equo?",
      "Calcola IRR per me e per il partner",
      "Quali condizioni dovrei negoziare?",
      "Preparami term sheet"
    ]
  },
  {
    id: 13,
    name: "Simona - Timing Strategist",
    email: "simona.timing@market.com",
    conversation: [
      "Il market timing è tutto",
      "Progetto Genova, 15 unità",
      "Se inizio ora, consegna in 24 mesi",
      "Ma mercato locale è in crescita 8% annuo",
      "Conviene aspettare 6 mesi prima di iniziare?",
      "Modellizza scenari: start now vs start +6 mesi vs start +12 mesi",
      "Considera anche evoluzione tassi mutui",
      "Qual è il timing ottimale?",
      "Dammi un piano temporale dettagliato"
    ]
  },
  {
    id: 14,
    name: "Andrea - Luxury Developer",
    email: "andrea.luxury@highend.com",
    conversation: [
      "Sviluppo solo high-end luxury",
      "Terreno Portofino, vista mare, 2500 mq",
      "4 ville indipendenti, budget illimitato",
      "Prezzi vendita 8000-12000 €/mq",
      "Costi costruzione 3500 €/mq (finiture premium)",
      "Analizza questo progetto luxury",
      "Considera anche servizi comuni: piscina, spa, concierge",
      "Aggiungi costi gestione decennale",
      "ROI atteso con questo posizionamento?",
      "Business plan ultra-dettagliato"
    ]
  },
  {
    id: 15,
    name: "Marta - Green Developer",
    email: "marta.green@ecobuild.com",
    conversation: [
      "Focus totale su sostenibilità",
      "Progetto carbon-neutral a Padova",
      "25 unità, classe energetica A4",
      "Geotermico, fotovoltaico, recupero acque",
      "Costi green +30% vs tradizionale",
      "Ma incentivi fiscali ed ecomo bonus",
      "Plus vendita stimato +15% per certificazioni",
      "Analizza fattibilità progetto sostenibile",
      "Confronta con scenario tradizionale",
      "Mostra breakeven punto verde vs tradizionale",
      "Calcola anche impatto CO2 risparmiata"
    ]
  },

  // BATCH 4: Situazioni Problematiche (16-20)
  {
    id: 16,
    name: "Paolo - Progetto in Difficoltà",
    email: "paolo.trouble@rescue.com",
    conversation: [
      "Ho un progetto che sta andando male",
      "Palermo, 18 unità, vendute solo 4 in 8 mesi",
      "Costi già sforati del 12%",
      "Banca preoccupata, serve piano di recupero",
      "Analizza la situazione attuale",
      "Quali azioni immediate posso prendere?",
      "Conviene scontare per vendere velocemente?",
      "O meglio aspettare e ridurre costi?",
      "Modellizza 3 strategie di recovery",
      "Dammi raccomandazione con reasoning dettagliato"
    ]
  },
  {
    id: 17,
    name: "Giulia - Permessi Bloccati",
    email: "giulia.permits@blocked.com",
    conversation: [
      "Il comune ha bloccato il mio progetto",
      "Chiedono modifiche sostanziali",
      "Riduzione unità da 20 a 15",
      "E altezza massima da 15m a 12m",
      "Questo distrugge la mia analisi originale",
      "Ricalcola tutto con i nuovi vincoli",
      "Quanto perdo in termini di VAN?",
      "Conviene ancora o meglio vendere terreno?",
      "Fai analisi comparativa: procedi vs vendi",
      "Considera anche tempi persi (6 mesi già passati)"
    ]
  },
  {
    id: 18,
    name: "Stefano - Partner Litigation",
    email: "stefano.legal@issues.com",
    conversation: [
      "Sono in disputa con un socio",
      "Progetto Trieste, co-investimento 50/50",
      "Lui vuole uscire ora, io voglio continuare",
      "Progetto a metà: fondamenta fatte, costi 1.8M spesi",
      "Completamento richiede altri 2.5M",
      "Vendite previste 6M totali",
      "Quanto vale la sua quota oggi?",
      "Calcola fair value per buy-out",
      "Considera anche rischio continui da solo",
      "Analisi pro/contro buy-out vs liquidazione vs nuovo partner"
    ]
  },
  {
    id: 19,
    name: "Francesca - Cash Flow Crisis",
    email: "francesca.cashflow@urgent.com",
    conversation: [
      "Emergenza cash flow",
      "Progetto Brescia, 22 unità in costruzione",
      "Serve liquidità immediata: 800k€",
      "Opzioni: 1) vendita anticipata 5 unità, 2) bridge loan, 3) nuovo investitore",
      "Analizza impatto di ogni opzione su VAN finale",
      "Se vendo 5 unità ora a sconto 15%, cosa succede?",
      "Calcola il costo reale del bridge loan al 9%",
      "E con nuovo investitore equity 20%?",
      "Dammi la soluzione ottimale",
      "Prepara pitch deck per investitore"
    ]
  },
  {
    id: 20,
    name: "Michele - Market Crash Scenario",
    email: "michele.crash@scenario.com",
    conversation: [
      "Temo un crollo del mercato immobiliare",
      "Progetto Venezia quasi completato, vendite non partite",
      "Se mercato crolla -20% sono nei guai",
      "Analizza resilienza del mio progetto",
      "Stress test: -10%, -20%, -30% prezzi",
      "A che punto vado in perdita?",
      "Posso convertire in affitti se mercato crolla?",
      "Calcola anche scenario rental yield",
      "Dammi piano B e piano C",
      "Quale azione prendere questa settimana?"
    ]
  },

  // BATCH 5: Profili Internazionali (21-25)  
  {
    id: 21,
    name: "Giovanni - Expat Developer",
    email: "giovanni.expat@international.com",
    conversation: [
      "Vivo all'estero ma investo in Italia",
      "Terreno Como, zona turistica lago",
      "Voglio fare residence turistico, 10 unità",
      "Considera redditività affitti brevi vs vendita",
      "Airbnb occupancy stimata 65% anno",
      "Tariffe medie €150/notte",
      "Costi gestione e manutenzione",
      "Confronta: vendita diretta vs rental income 10 anni",
      "Include anche tassazione expat",
      "Quale strategia è più profittevole?"
    ]
  },
  {
    id: 22,
    name: "Elisa - Family Business",
    email: "elisa.family@business.com",
    conversation: [
      "Business di famiglia, 3 generazioni",
      "Abbiamo 5 terreni in portfolio",
      "Vogliamo svilupparne 2 quest'anno",
      "Aiutami a decidere quali",
      "Criteri: ROI, tempi, rischio basso",
      "Analizza tutti e 5 velocemente",
      "Ranking per priorità sviluppo",
      "Per i top 2, fai business plan completi",
      "Considera anche skills interne famiglia",
      "Piano sviluppo pluriennale 2025-2027"
    ]
  },
  {
    id: 23,
    name: "Matteo - Urban Regeneration",
    email: "matteo.urban@regen.com",
    conversation: [
      "Lavoro su riqualificazioni urbane",
      "Ex area industriale Bari, 15000 mq",
      "Destinazione mista: residenziale + commerciale + verde pubblico",
      "120 unità abitative + 2000 mq commerciali",
      "Contributo comune per verde: 500k€",
      "Timeline lunga: 4 anni totali",
      "Phasing: Fase 1 commerciale, Fase 2 residenziale",
      "Analizza questo progetto complesso multi-fase",
      "Cash flow per ogni fase",
      "Rischi specifici progetti grandi"
    ]
  },
  {
    id: 24,
    name: "Sara - Student Housing Specialist",
    email: "sara.student@housing.com",
    conversation: [
      "Specializzata in student housing",
      "Terreno Pisa vicino università, 2500 mq",
      "80 monolocali piccoli (25 mq ciascuno)",
      "Target affitti studenti €400/mese",
      "Occupancy garantita 10 mesi/anno",
      "Yield rental atteso?",
      "Confronta vs vendita unità",
      "Include gestione dedicata student housing",
      "Business model: hold 15 anni vs sell after 5 anni",
      "ROI comparato dei due scenari"
    ]
  },
  {
    id: 25,
    name: "Diego - Co-living Developer",
    email: "diego.coliving@modern.com",
    conversation: [
      "Faccio co-living moderno",
      "Palermo, 4000 mq, 25 camere + spazi comuni",
      "Modello: affitti mensili flessibili",
      "Target digital nomads e professionisti",
      "Spazi comuni: coworking, gym, lounge",
      "Canone medio €600/camera all-inclusive",
      "Costi gestione superiori: cleaning, utilities, wifi, community manager",
      "Analizza viability modello co-living",
      "Confronta vs apartamenti tradizionali",
      "Breakeven occupancy rate?"
    ]
  },

  // BATCH 6: Innovatori (26-30)
  {
    id: 26,
    name: "Federica - Modular Construction",
    email: "federica.modular@innovation.com",
    conversation: [
      "Uso costruzioni modulari prefabbricate",
      "Riduco tempi 50% e costi 20%",
      "Progetto Modena, 30 unità modulari",
      "Consegna in 12 mesi invece di 24",
      "Come impatta questo su VAN e IRR?",
      "Vantaggio time-to-market",
      "Calcola benefit finanziario velocità",
      "Include anche costi prefabbricazione",
      "Business plan modular construction",
      "Confronta vs costruzione tradizionale"
    ]
  },
  {
    id: 27,
    name: "Antonio - Retrofit Specialist",
    email: "antonio.retrofit@renovation.com",
    conversation: [
      "Non costruisco nuovo, ristrutturo",
      "Palazzo storico Siena centro, 12 appartamenti",
      "Vincoli soprintendenza molto stretti",
      "Costi ristrutturazione premium",
      "Ma prezzi vendita anche +40% per location",
      "Analizza fattibilità retrofit luxury",
      "Tempi permessi: 8-12 mesi",
      "Rischi lavori su edificio storico",
      "Contingency budget suggerito?",
      "Business plan ristrutturazione completa"
    ]
  },
  {
    id: 28,
    name: "Carla - Senior Housing",
    email: "carla.senior@silver.homes",
    conversation: [
      "Mercato senior housing",
      "Residenza assistita Merano, 40 unità",
      "Mix vendita + servizi assistenza",
      "Vendita appartamenti + contratto servizi",
      "Ricavi: vendita immobili + fee mensili assistenza",
      "Modello complesso: CAPEX + OPEX continuativo",
      "Analizza sia vendita che gestione 20 anni",
      "Cash flow misto: una tantum + ricorrente",
      "Business plan senior housing completo",
      "Valuta anche opzione REIT structure"
    ]
  },
  {
    id: 29,
    name: "Riccardo - Build-to-Rent",
    email: "riccardo.btr@institutional.com",
    conversation: [
      "Build-to-rent per investitori istituzionali",
      "Torino, 80 unità, nessuna vendita, solo affitto",
      "Target yield 5.5% netto",
      "Gestione professionale in-house",
      "Tenant mix: 70% famiglie, 30% professionisti",
      "Hold period: perpetual (vendita asset dopo 15+ anni)",
      "Analizza come investment property",
      "DCF con exit yield 4.8% anno 15",
      "IRR atteso per investitore istituzionale?",
      "Structuring: fondi, SICAF o direct ownership?"
    ]
  },
  {
    id: 30,
    name: "Silvia - Mixed-Use Visionary",
    email: "silvia.mixed@vision.dev",
    conversation: [
      "Progetti mixed-use complessi",
      "Pescara waterfront, 20000 mq",
      "Piano terra: retail 3000 mq",
      "Piano 1-2: uffici 4000 mq",
      "Piano 3-8: residential 80 unità",
      "Rooftop: ristorante e sky lounge",
      "Ogni use ha economics diversi",
      "Analizza viability mixed-use",
      "Phasing ottimale costruzione",
      "Master business plan integrato",
      "Sinergie tra different uses"
    ]
  },

  // BATCH 7: Collaborazione (31-35)
  {
    id: 31,
    name: "Lorenzo - Team Collaboration",
    email: "lorenzo.team@collab.works",
    conversation: [
      "Lavoro con team di 5 persone",
      "Condividi questo progetto con tutto il team",
      "mario@team.com, anna@team.com, luca@team.com",
      "Prepara presentazione per meeting",
      "Evidenzia punti chiave: ROI, rischi, timeline",
      "Formatta per non-esperti finanziari",
      "Aggiungi visual dashboard numbers",
      "Export in PDF e PowerPoint",
      "Invia a tutti con email riepilogativa"
    ]
  },
  {
    id: 32,
    name: "Isabella - Investor Relations",
    email: "isabella.ir@investors.com",
    conversation: [
      "Gestisco relazioni con 12 investitori",
      "Serve monthly update su tutti i progetti",
      "Mostra portfolio completo",
      "Status ogni progetto",
      "Performance vs budget",
      "Milestone raggiunti questo mese",
      "Rischi emersi e mitigazioni",
      "Prepara investor update report",
      "Professional formatting",
      "Invia a lista investitori"
    ]
  },
  {
    id: 33,
    name: "Tommaso - Vendor Management",
    email: "tommaso.vendor@procurement.com",
    conversation: [
      "Gestisco fornitori e appalti",
      "Progetto Ancona, serve RDO per costruzione",
      "Specifiche: 15 unità, standard medio-alto",
      "Deadline offerte: 15 giorni",
      "Prepara RDO professionale",
      "Include specifiche tecniche",
      "Criteri valutazione: 40% prezzo, 30% tempi, 30% qualità",
      "Lista fornitori qualificati zona Marche",
      "Template email invio RDO",
      "Invia a 8 costruttori selezionati"
    ]
  },
  {
    id: 34,
    name: "Beatrice - Municipal Approvals",
    email: "beatrice.approvals@permits.com",
    conversation: [
      "Gestisco iter autorizzativi",
      "Progetto Prato, zona PRG in variazione",
      "Serve documentazione per permesso di costruire",
      "Relazione tecnica dettagliata",
      "Analisi costi-benefici per comune",
      "Impatto urbanistico positivo",
      "Genera tutti i documenti necessari",
      "Formatta secondo standard regionali Toscana",
      "Include anche piano parcheggi e verde",
      "Export package completo per comune"
    ]
  },
  {
    id: 35,
    name: "Gabriele - Bank Presentation",
    email: "gabriele.bank@financing.com",
    conversation: [
      "Devo presentare progetto in banca per mutuo",
      "Serve package finanziario super solido",
      "Progetto Udine, 18 unità, valore 4.8M",
      "Chiedo mutuo 70% (3.36M)",
      "Banca vuole DSCR >1.3",
      "Calcola DSCR con vari scenari financing",
      "Dimostra sostenibilità debt service",
      "Sensitivity su vendite e costi",
      "Worst case mantiene DSCR >1.2?",
      "Prepara bank presentation professionale"
    ]
  },

  // BATCH 8: Scenari Avanzati (36-40)
  {
    id: 36,
    name: "Claudia - Data-Driven Developer",
    email: "claudia.data@analytics.com",
    conversation: [
      "Mi baso solo sui dati",
      "Raccogli market data Bologna ultimi 3 anni",
      "Trend prezzi vendita per zona",
      "Velocity vendite per tipologia",
      "Individua zona con miglior ROI potenziale",
      "Suggerisci location e product type",
      "Basati su data analysis",
      "Poi fai business plan per suggerimento migliore",
      "Include confidence level raccomandazione",
      "Mostra anche data sources usati"
    ]
  },
  {
    id: 37,
    name: "Emanuele - Adaptive Reuse",
    email: "emanuele.adaptive@reuse.com",
    conversation: [
      "Conversione ex edificio industriale",
      "Bergamo, ex fabbrica 8000 mq",
      "Voglio fare loft residenziali industrial-chic",
      "Mantengo struttura portante e caratteristiche",
      "Ma riconversione costa +40% vs nuovo",
      "Però posso vendere a premium +25%",
      "Analizza economics adaptive reuse",
      "Considera anche incentivi riqualificazione",
      "Confronta vs demolizione e nuovo",
      "Business plan riconversione industriale"
    ]
  },
  {
    id: 38,
    name: "Daniela - PropTech Integration",
    email: "daniela.proptech@tech.dev",
    conversation: [
      "Integro tecnologia in ogni progetto",
      "Smart building Padova, 30 unità",
      "Domotica completa, IoT, app gestione",
      "Costi tech +€8k per unità",
      "Ma premium vendita +€15k per 'smart ready'",
      "Plus operational: -30% costi gestione",
      "Analizza ROI investimento tech",
      "Payback periodo tecnologia",
      "Business model smart building",
      "Include recurring revenue da servizi digitali"
    ]
  },
  {
    id: 39,
    name: "Marco - Crowdfunding Platform",
    email: "marco.crowd@platform.com",
    conversation: [
      "Finanziamento tramite crowdfunding",
      "Progetto Rimini, 12 unità beach-side",
      "Target raccolta: 2M€ da small investors",
      "Ticket minimo €10k, rendimento promesso 12% IRR",
      "Come strutturare l'offering?",
      "Calcola returns per investitori",
      "Fee platform 3% + 15% carry",
      "Economics per developer after fees",
      "Business plan per piattaforma crowdfunding",
      "Materiale marketing per investitori retail"
    ]
  },
  {
    id: 40,
    name: "Nicoletta - Fractional Ownership",
    email: "nicoletta.fractional@shared.com",
    conversation: [
      "Modello fractional ownership innovativo",
      "Ville luxury Toscana, 8 ville",
      "Ogni villa venduta in fractions (8 owners per villa)",
      "Ogni owner: 6 settimane/anno utilizzo",
      "Prezzo fraction: €180k (vs €1.2M villa intera)",
      "Gestione centralizzata professionale",
      "Analizza economics fractional model",
      "Revenue da vendita fractions",
      "Plus gestione e servizi",
      "Business plan fractional ownership"
    ]
  },

  // BATCH 9: Edge Cases (41-45)
  {
    id: 41,
    name: "Alessio - Scenario Assurdo",
    email: "alessio.crazy@test.com",
    conversation: [
      "asdfasdf qwerty 12345",
      "terreno luna marte giove",
      "voglio costruire castelli volanti",
      "budget infinito, tempo zero",
      "fai analisi seria",
      "ok scusa, terreno Roma 1000 mq vero",
      "aiutami davvero",
      "analisi fattibilità normale"
    ]
  },
  {
    id: 42,
    name: "Ginevra - Minimal Info",
    email: "ginevra.minimal@sparse.com",
    conversation: [
      "terreno",
      "roma",
      "analisi",
      "si",
      "ok",
      "quanto?",
      "va bene",
      "salva"
    ]
  },
  {
    id: 43,
    name: "Filippo - Over-Talkative",
    email: "filippo.talk@verbose.com",
    conversation: [
      "Allora ti spiego tutta la situazione perché è molto complessa e articolata e ci sono molti fattori da considerare e non so da dove iniziare quindi ti racconto tutto dall'inizio quando ho comprato questo terreno 5 anni fa era un'altra epoca e il mercato era diverso e adesso voglio costruire ma non so se conviene perché i costi sono alti e i prezzi non so se reggono e poi c'è la questione del mutuo e della banca e dei permessi e del comune che è lento e non so davvero cosa fare aiutami tu che sei esperto",
      "quindi fammi vedere i numeri",
      "si ma considera anche che magari il mercato cambia",
      "va bene procedi con analisi completa"
    ]
  },
  {
    id: 44,
    name: "Viola - Context Switcher",
    email: "viola.switch@topics.com",
    conversation: [
      "Ciao come stai?",
      "Analisi terreno Milano",
      "Aspetta no, prima business plan",
      "Anzi mostrami i miei progetti",
      "Torniamo all'analisi Milano",
      "Aggiungi sensitivity",
      "No aspetta, voglio Firenze non Milano",
      "Ok perfect procedi con Firenze"
    ]
  },
  {
    id: 45,
    name: "Emma - Perfectionist",
    email: "emma.perfect@details.com",
    conversation: [
      "Voglio tutto perfetto nei minimi dettagli",
      "Analisi terreno Bergamo 4200 mq",
      "No aspetta, sono 4187 mq esatti",
      "Costo costruzione 1247 €/mq non 1200",
      "Prezzo vendita medio zona 3142 €/mq",
      "Margine lordo deve essere minimo 28.3%",
      "Ricalcola tutto con numeri precisi",
      "Arrotondamenti massimo 1 decimale",
      "Voglio precisione assoluta",
      "Business plan ultra-dettagliato"
    ]
  },

  // BATCH 10: Stress Test (46-50)
  {
    id: 46,
    name: "Simone - Speed Test",
    email: "simone.speed@fast.com",
    conversation: [
      "Vai velocissimo",
      "Terreno Roma 5000mq analisi ora subito",
      "Fatto? Business plan subito",
      "Fatto? Sensitivity ora",
      "Export tutto PDF immediato",
      "Inviami tutto ora",
      "Bene, altro progetto Milano stesso flow",
      "Tutto in 2 minuti totali possibile?"
    ]
  },
  {
    id: 47,
    name: "Teresa - Memory Test",
    email: "teresa.memory@context.com",
    conversation: [
      "Il mio progetto si chiama 'Aurora Tower'",
      "È a Firenze, 25 unità luxury",
      "Ricordatelo",
      "Ok, ora parliamo d'altro, come funziona Urbanova?",
      "Interessante, torniamo al mio progetto",
      "Come si chiamava?",
      "Esatto! Fai business plan per Aurora Tower",
      "Include i dettagli che ti ho dato prima",
      "Usa il contesto della conversazione precedente"
    ]
  },
  {
    id: 48,
    name: "Daniele - Multi-Language",
    email: "daniele.lang@international.com",
    conversation: [
      "Ciao, ho un progetto a Roma",
      "Sorry, can you switch to English?",
      "Actually no, continua in italiano per favore",
      "Grazie. Terreno 3000 mq zona Parioli",
      "Fai analisi dettagliata",
      "E business plan completo",
      "Tutto in italiano però, è importante",
      "Perfetto, salva tutto"
    ]
  },
  {
    id: 49,
    name: "Cristina - Emotional Connection",
    email: "cristina.emotion@heart.dev",
    conversation: [
      "Questo progetto significa molto per me",
      "È il terreno dove giocavo da bambina",
      "Voglio costruire qualcosa di speciale",
      "Non solo profitto, anche impatto sociale",
      "Housing accessibile per giovani famiglie",
      "Puoi aiutarmi a bilanciare cuore e numeri?",
      "Analizza scenario profit vs social impact",
      "Come massimizzare entrambi?",
      "Suggerisci mix abitativo ottimale",
      "Business plan che fa bene e fa anche guadagnare"
    ]
  },
  {
    id: 50,
    name: "Alberto - Everything Test",
    email: "alberto.everything@ultimate.com",
    conversation: [
      "Voglio testare tutto Urbanova",
      "Crea analisi fattibilità terreno Torino",
      "Trasformala in business plan",
      "Aggiungi sensitivity analysis",
      "Mostrami tutti i miei progetti",
      "Confronta performance progetti",
      "Prepara report investor-grade",
      "Genera RDO per costruzione",
      "Invia tutto al mio team",
      "Salva snapshot completo stato progetti",
      "Dammi summary esecutivo finale"
    ]
  }
];

// Funzione per eseguire una conversazione
async function runConversation(profile) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n👤 PROFILO #${profile.id}: ${profile.name}`);
  console.log(`📧 Email: ${profile.email}`);
  console.log(`💬 Messaggi nella conversazione: ${profile.conversation.length}\n`);
  
  const sessionId = `session_${profile.id}_${Date.now()}`;
  const conversationHistory = [];
  const results = [];
  
  for (let i = 0; i < profile.conversation.length; i++) {
    const message = profile.conversation[i];
    console.log(`\n📝 Messaggio ${i + 1}/${profile.conversation.length}: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(API_URL, {
        message,
        userId: `user_${profile.id}`,
        userEmail: profile.email,
        sessionId,
        conversationHistory,
      }, {
        timeout: 30000
      });
      
      const duration = Date.now() - startTime;
      
      const result = {
        message,
        response: response.data.response,
        duration,
        smart: response.data.smart,
        success: response.data.success,
        toolsActivated: response.data.plan?.length || 0,
      };
      
      results.push(result);
      
      // Aggiungi a history
      conversationHistory.push({ role: 'user', content: message });
      conversationHistory.push({ role: 'assistant', content: response.data.response });
      
      console.log(`✅ Risposta ricevuta (${duration}ms)`);
      console.log(`📊 Smart: ${response.data.smart ? 'Sì' : 'No'} | Tools: ${result.toolsActivated}`);
      console.log(`💬 Risposta: ${response.data.response?.substring(0, 100)}...`);
      
      // Pausa tra messaggi per simulare conversazione reale
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Errore messaggio ${i + 1}:`, error.message);
      results.push({
        message,
        error: error.message,
        duration: 0,
        success: false,
      });
    }
  }
  
  // Analisi conversazione
  const avgDuration = results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;
  const successRate = results.filter(r => r.success).length / results.length;
  const toolActivationRate = results.filter(r => r.toolsActivated > 0).length / results.length;
  
  console.log(`\n📊 ANALISI CONVERSAZIONE:`);
  console.log(`   • Messaggi totali: ${results.length}`);
  console.log(`   • Success rate: ${(successRate * 100).toFixed(1)}%`);
  console.log(`   • Tool activation: ${(toolActivationRate * 100).toFixed(1)}%`);
  console.log(`   • Durata media: ${avgDuration.toFixed(0)}ms`);
  
  return {
    profile,
    results,
    metrics: {
      avgDuration,
      successRate,
      toolActivationRate,
      conversationLength: results.length,
    }
  };
}

// Funzione principale
async function main() {
  console.log('🚀 AVVIO TEST MANIACALE CONVERSAZIONI PROFONDE URBANOVA OS 2.0\n');
  console.log(`📍 Endpoint: ${API_URL}`);
  console.log(`👥 Profili da testare: ${USER_PROFILES.length}`);
  console.log(`📦 Batch size: ${BATCH_SIZE} (analisi ogni ${BATCH_SIZE} test)\n`);
  
  const allResults = [];
  
  // Esegui in batches
  for (let batch = 0; batch < Math.ceil(USER_PROFILES.length / BATCH_SIZE); batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, USER_PROFILES.length);
    const batchProfiles = USER_PROFILES.slice(batchStart, batchEnd);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n📦 BATCH ${batch + 1}/${Math.ceil(USER_PROFILES.length / BATCH_SIZE)}: Profili ${batchStart + 1}-${batchEnd}`);
    console.log(`${'='.repeat(80)}\n`);
    
    const batchResults = [];
    
    // Esegui conversazioni del batch
    for (const profile of batchProfiles) {
      const result = await runConversation(profile);
      batchResults.push(result);
      allResults.push(result);
      
      // Pausa tra conversazioni
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Analisi batch
    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n📊 ANALISI BATCH ${batch + 1}\n`);
    
    const batchAvgSuccess = batchResults.reduce((sum, r) => sum + r.metrics.successRate, 0) / batchResults.length;
    const batchAvgDuration = batchResults.reduce((sum, r) => sum + r.metrics.avgDuration, 0) / batchResults.length;
    const batchAvgToolActivation = batchResults.reduce((sum, r) => sum + r.metrics.toolActivationRate, 0) / batchResults.length;
    
    console.log(`📈 Metriche Batch:`);
    console.log(`   • Success Rate Medio: ${(batchAvgSuccess * 100).toFixed(1)}%`);
    console.log(`   • Tool Activation Medio: ${(batchAvgToolActivation * 100).toFixed(1)}%`);
    console.log(`   • Durata Media Risposta: ${batchAvgDuration.toFixed(0)}ms`);
    
    // Identifica pattern
    console.log(`\n💡 PATTERN IDENTIFICATI:`);
    if (batchAvgSuccess < 0.9) {
      console.log(`   ⚠️  Success rate basso: ottimizzare error handling`);
    }
    if (batchAvgToolActivation < 0.7) {
      console.log(`   ⚠️  Tool activation basso: migliorare system prompt`);
    }
    if (batchAvgDuration > 8000) {
      console.log(`   ⚠️  Durata alta: ottimizzare performance`);
    }
    
    console.log(`\n${'='.repeat(80)}\n`);
    
    // Salva risultati batch
    fs.writeFileSync(
      `test-os2-batch-${batch + 1}-results.json`,
      JSON.stringify(batchResults, null, 2)
    );
  }
  
  // ANALISI FINALE
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n🎯 ANALISI FINALE - 50 CONVERSAZIONI PROFONDE\n`);
  console.log(`${'='.repeat(80)}\n`);
  
  const totalMessages = allResults.reduce((sum, r) => sum + r.results.length, 0);
  const totalSuccess = allResults.reduce((sum, r) => sum + r.results.filter(m => m.success).length, 0);
  const avgSuccessRate = totalSuccess / totalMessages;
  const avgDuration = allResults.reduce((sum, r) => sum + r.metrics.avgDuration, 0) / allResults.length;
  const avgToolActivation = allResults.reduce((sum, r) => sum + r.metrics.toolActivationRate, 0) / allResults.length;
  
  console.log(`📊 METRICHE GLOBALI:`);
  console.log(`   • Profili testati: ${allResults.length}`);
  console.log(`   • Messaggi totali: ${totalMessages}`);
  console.log(`   • Success rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
  console.log(`   • Tool activation: ${(avgToolActivation * 100).toFixed(1)}%`);
  console.log(`   • Durata media: ${avgDuration.toFixed(0)}ms`);
  
  // Salva tutto
  fs.writeFileSync(
    'test-os2-deep-conversations-results.json',
    JSON.stringify(allResults, null, 2)
  );
  
  console.log(`\n✅ Risultati salvati in test-os2-deep-conversations-results.json`);
  console.log(`\n🎉 TEST COMPLETATI!\n`);
}

main().catch(console.error);


