// 🎯 TEST MANIACALE - 50 Conversazioni Profonde per Valutare "Collega AI Perfetto"

const fs = require('fs');
const PROD_URL = 'https://urbanova.vercel.app/api/os2/chat';
const LOCAL_URL = 'http://localhost:3112/api/os2/chat';
const USE_PROD = process.argv[2] === 'prod';
const API_URL = USE_PROD ? PROD_URL : LOCAL_URL;

// 50 PROFILI DIVERSIFICATI - Conversazioni Profonde
const PROFILI = [
  // BATCH 1-5: Fondamentali
  {
    id: 1,
    nome: 'Marco - Principiante Assoluto',
    conversazione: [
      "Ciao, sono nuovo nello sviluppo immobiliare",
      "Ho ereditato terreno Roma 3000 mq vicino metro",
      "Cosa posso farci? Non so da dove iniziare",
      "Fammi analisi completa",
      "E se costruissi 8 unità invece di 10?",
      "Trasforma in business plan dettagliato",
      "Mi serve anche sensitivity per banca",
      "Quali sono i rischi principali?"
    ],
    valuta: ['empathy', 'tool_activation', 'context', 'memory', 'proactivity']
  },
  {
    id: 2,
    nome: 'Laura - Indecisa Cronica',
    conversazione: [
      "Terreno Milano 4000 mq, non so se vendere o costruire",
      "Mostrami numeri sviluppo residential",
      "Aspetta, e se facessi uffici?",
      "No aspetta, meglio mixed-use",
      "Confronta tutte e 3 le opzioni",
      "Quale consigli tu?",
      "Ok fai business plan per mixed-use",
      "Cambia idea, facciamo residential"
    ],
    valuta: ['patience', 'context_switch', 'comparison', 'advice', 'flexibility']
  },
  {
    id: 3,
    nome: 'Giuseppe - Tecnico Esigente',
    conversazione: [
      "Terreno Firenze 5000 mq, indice 0.8, H max 18m",
      "15 unità 80 mq, costruzione 1350 €/mq vendita 3200 €/mq",
      "Terreno 400k è buon prezzo considerando zona Novoli?",
      "Fai sensitivity prezzo terreno 350k-450k step 20k",
      "Analizza impatto variazione costi costruzione ±10%",
      "IRR minimo accettabile 16%, valuta fattibilità",
      "Dammi NPV scontato al 8% e payback period"
    ],
    valuta: ['precision', 'technical', 'calculations', 'financial_metrics']
  },
  {
    id: 4,
    nome: 'Sofia - Multi-Progetto Simultaneo',
    conversazione: [
      "Gestisco 3 progetti: Roma 10 unità, Milano 5 negozi, Torino mixed-use",
      "Analisi completa progetto Roma",
      "Ok perfetto, ora passa a Milano",
      "Business plan negozi Milano",
      "Torna a Roma, quali erano ROI e margine?",
      "Confronta ROI Roma vs Milano",
      "Ora Torino: analisi mixed 12 residential + 3 commercial",
      "Quale progetto ha migliore risk-adjusted return?"
    ],
    valuta: ['multi_context', 'memory', 'comparison', 'context_switch']
  },
  {
    id: 5,
    nome: 'Alessandro - Investor Istituzionale',
    conversazione: [
      "Cerco deal IRR >18% payback <4 anni per fund immobiliare",
      "Opportunità Bologna 8000 mq luxury 25 unità €500k cadauna",
      "Analizza e dimmi se raggiunge hurdle rate 18%",
      "Sensitivity su tutti i parametri chiave",
      "Exit strategy: bulk sale vs vendita graduale",
      "Analizza impatto leveraged 70% LTV",
      "Prepara term sheet per investment committee"
    ],
    valuta: ['financial_sophistication', 'institutional', 'risk_analysis']
  },
  
  // BATCH 6-10: Comportamentali
  {
    id: 6,
    nome: 'Chiara - Input Minimali',
    conversazione: [
      "terreno",
      "milano",
      "2000 mq",
      "analisi",
      "bp",
      "sensitivity",
      "ok"
    ],
    valuta: ['clarification', 'defaults', 'inference']
  },
  {
    id: 7,
    nome: 'Roberto - Multilingual Pro',
    conversazione: [
      "Progetto Roma, serve analisi",
      "Can you switch to English? I have international investors",
      "Analyze feasibility for 15 units luxury development",
      "What's the ROI and payback?",
      "Torna italiano, devo presentare al comune",
      "Prepara documentazione italiana per permessi",
      "Switch back English for investor deck"
    ],
    valuta: ['language_switch', 'context_preservation', 'multilingual']
  },
  {
    id: 8,
    nome: 'Valentina - Emotiva e Values-Driven',
    conversazione: [
      "Questo progetto significa molto, è terreno di famiglia",
      "Voglio qualcosa speciale ma sostenibile",
      "Housing accessibile per giovani famiglie + profit, è possibile?",
      "Aiutami a bilanciare cuore e numeri",
      "60% market rate + 40% affordable housing funzionerebbe?",
      "Aggiungi pannelli solari e verde, quanto costa?",
      "Vale la pena sacrificare 2% ROI per impatto sociale?"
    ],
    valuta: ['empathy', 'values', 'balance', 'advice']
  },
  {
    id: 9,
    nome: 'Francesco - Speed Demon',
    conversazione: [
      "Veloce: Napoli 6000 mq analisi ORA",
      "BP subito",
      "Sensitivity ora",
      "Go"
    ],
    valuta: ['speed', 'efficiency', 'no_friction']
  },
  {
    id: 10,
    nome: 'Giulia - Memory Tester',
    conversazione: [
      "Progetto Green Park Residence, Milano, 20 unità eco-friendly",
      "Budget 3M, target vendita 5.2M",
      "Fai business plan completo",
      "Come funziona Urbanova? Spiegami features",
      "Torniamo al progetto, come si chiamava?",
      "Quali erano budget e target che ti ho detto?",
      "Aggiungi certificazione LEED, quanto costa?",
      "ROI finale considerando tutto?"
    ],
    valuta: ['long_term_memory', 'context_recall', 'project_tracking']
  },

  // BATCH 11-15: Casi Edge
  {
    id: 11,
    nome: 'Davide - Divagazzioni Continue',
    conversazione: [
      "Progetto Torino 4000 mq",
      "A proposito, come sta andando mercato immobiliare Italia?",
      "E i tassi interesse? Impattano i miei calcoli?",
      "Comunque torniamo al progetto, fai analisi",
      "Aspetta, mi consigli meglio Torino o Roma?",
      "Ok Torino, ma zona centrale o periferica?",
      "Va bene centrale, procedi con BP"
    ],
    valuta: ['digression_handling', 'context_recovery', 'patience']
  },
  {
    id: 12,
    nome: 'Elena - Vocale Intensive',
    conversazione: [
      "[SIMULA VOCE] Urbanova, analizza terreno Venezia 2500 metri quadri",
      "[VOCE] Quanto potrei guadagnare?",
      "[VOCE] Fai business plan",
      "[VOCE] Sensitivity su prezzi vendita",
      "Ora scrivo: dammi report completo"
    ],
    valuta: ['voice_handling', 'mode_switch', 'context_preservation']
  },
  {
    id: 13,
    nome: 'Matteo - Scenario Complesso',
    conversazione: [
      "Terreno 10000 mq + edificio esistente da demolire",
      "Costi demolizione €150k, bonifica €80k",
      "Posso fare 30 unità ma 10 devono essere social housing",
      "Incentivi comunali €200k se faccio 15% social",
      "Analizza con tutti questi vincoli",
      "E se convinco comune a ridurre social housing al 10%?",
      "Confronta i due scenari"
    ],
    valuta: ['complexity', 'constraints', 'scenarios']
  },
  {
    id: 14,
    nome: 'Francesca - Partnership Deal',
    conversazione: [
      "Terreno non è mio, accordo con proprietario: lui terreno, io sviluppo",
      "Split 40% lui 60% me sul profit",
      "Terreno vale €600k, sviluppo costa €2.1M, vendita €3.5M",
      "Analizza deal considerando partnership",
      "Proprietario vuole 45%, conviene ancora a me?",
      "E se propongo di comprare terreno invece? Serve loan €600k",
      "Confronta partnership vs acquisto con debt"
    ],
    valuta: ['partnership', 'deal_structure', 'financing']
  },
  {
    id: 15,
    nome: 'Andrea - Phased Development',
    conversazione: [
      "Terreno 15000 mq, troppo grande per fare tutto subito",
      "Fase 1: 10 unità, Fase 2: 15 unità, Fase 3: 10 unità",
      "Fasi distanti 18 mesi una dall'altra",
      "Analizza cashflow multi-fase",
      "Posso usare profit Fase 1 per finanziare Fase 2?",
      "Sensitivity su timing tra fasi (12-24 mesi)",
      "Quale timing ottimizza IRR?"
    ],
    valuta: ['phasing', 'cashflow', 'optimization']
  },

  // BATCH 16-20: Specializzazioni
  {
    id: 16,
    nome: 'Simone - Commercial Focus',
    conversazione: [
      "Centro commerciale 5000 mq, 15 negozi",
      "Affitto €250/mq/anno, yield target 7%",
      "Analizza come investment property",
      "Confronta vs vendita sfusa negozi",
      "Exit cap rate 6.5%, quanto vale a fine?",
      "NPV 10 anni holding period"
    ],
    valuta: ['commercial', 'yield', 'investment_analysis']
  },
  {
    id: 17,
    nome: 'Claudia - Luxury Segment',
    conversazione: [
      "Villa luxury Sardegna 800 mq vista mare",
      "Budget €2.5M, target vendita €4.8M",
      "Clientela internazionale, finishing top",
      "Analizza considerando luxury market dynamics",
      "Tempo vendita stimato 18-24 mesi",
      "Holding cost €15k/mese, impatto su ROI?"
    ],
    valuta: ['luxury', 'holding_costs', 'premium_segment']
  },
  {
    id: 18,
    nome: 'Paolo - Renovation Play',
    conversazione: [
      "Edificio esistente 1200 mq da ristrutturare",
      "Acquisto €800k, ristrutturazione €600k",
      "Superbonus 110% parzialmente applicabile",
      "Posso recuperare €400k con incentivi",
      "Post-ristrutturazione: 8 unità vendita €2.8M totale",
      "Analizza con incentivi fiscali",
      "Sensitivity se incentivi scendono a 90%"
    ],
    valuta: ['renovation', 'incentives', 'fiscal_optimization']
  },
  {
    id: 19,
    nome: 'Martina - Co-living Concept',
    conversazione: [
      "Voglio fare co-living per studenti/giovani professionisti",
      "Edificio 2000 mq, 40 camere + spazi comuni",
      "Affitto €600/camera/mese all-inclusive",
      "Gestione in-house vs operatore esterno",
      "Analizza come business operativo vs vendita",
      "Quale strategia massimizza long-term value?"
    ],
    valuta: ['alternative_concepts', 'operational', 'business_model']
  },
  {
    id: 20,
    nome: 'Luca - Distressed Asset',
    conversazione: [
      "NPL package: 3 progetti incompleti",
      "Acquisto tutto €1.2M (discount 60% su valore)",
      "Serve €800k per completare",
      "Vendita completati: €3.5M totale",
      "Rischio: cantieri fermi 2 anni, possibili problemi",
      "Analizza risk-adjusted return",
      "Vale il rischio per 80% upside?"
    ],
    valuta: ['distressed', 'risk_analysis', 'portfolio']
  },

  // BATCH 21-25: Situazioni Reali
  {
    id: 21,
    nome: 'Giorgio - Pre-Negoziazione',
    conversazione: [
      "Domani trattativa per terreno",
      "Proprietario chiede €850k, io offro €700k",
      "Fai analisi con entrambi i prezzi",
      "A €850k ho ROI 11%, accettabile?",
      "Sensitivity su costi costruzione, potrebbero salire",
      "Qual è mio walk-away price considerando ROI minimo 13%?",
      "Dammi 3 argomenti per giustificare €750k"
    ],
    valuta: ['negotiation_support', 'scenarios', 'strategy']
  },
  {
    id: 22,
    nome: 'Alessia - Due Diligence',
    conversazione: [
      "In due diligence su progetto, serve validare numeri venditore",
      "Venditore dichiara: costi €1.8M, vendita €2.9M, ROI 18%",
      "Verifica i calcoli",
      "Numeri sembrano ottimistici, prezzi vendita sopra mercato",
      "Rifai analisi con prezzi realistici",
      "Nuovo ROI 12%, downside risk quanto è?",
      "Consigli: procedere, rinegoziare o walk away?"
    ],
    valuta: ['validation', 'reality_check', 'advice']
  },
  {
    id: 23,
    nome: 'Riccardo - Bank Financing',
    conversazione: [
      "Banca chiede business plan per loan €1.5M",
      "Equity €500k, debt €1.5M (75% LTV)",
      "Progetto: 12 unità, vendita €2.8M",
      "Fai BP completo con leverage",
      "DSCR deve essere >1.3, ce la facciamo?",
      "Sensitivity su tassi interesse (4%-6%)",
      "Prepara executive summary per banca"
    ],
    valuta: ['financing', 'leverage', 'bank_requirements']
  },
  {
    id: 24,
    nome: 'Sabrina - Investor Pitch',
    conversazione: [
      "Devo presentare a 3 investitori domani",
      "Progetto: mixed-use Bologna €4M, ritorno atteso 22%",
      "Serve deck con: location, numeri, timeline, exit",
      "Fai analisi completa",
      "Sensitivity best/base/worst case",
      "Quali sono i 3 key selling points?",
      "Anticipa obiezioni su rischio costruzione"
    ],
    valuta: ['presentation', 'investor_relations', 'storytelling']
  },
  {
    id: 25,
    nome: 'Tommaso - Portfolio Strategy',
    conversazione: [
      "Ho €2M da investire, voglio diversificare",
      "Opzione A: 1 grande progetto €2M ROI 15%",
      "Opzione B: 2 progetti medi €1M cadauno, ROI 17% e 14%",
      "Opzione C: 3 piccoli progetti, ROI 18%, 16%, 13%",
      "Analizza risk-return trade-off",
      "Considera: concentration risk, timing, management bandwidth",
      "Quale strategia consigli e perché?"
    ],
    valuta: ['portfolio', 'strategy', 'risk_return']
  },

  // BATCH 26-30: Mercati Specifici
  {
    id: 26,
    nome: 'Federica - Mercato Turistico',
    conversazione: [
      "Appartamenti turistici Firenze centro",
      "10 unità, affitto breve vs vendita",
      "Affitto: €200/notte, occupancy 65%",
      "Vendita: €2.8M totale",
      "Analizza 10 anni holding vs vendita immediata",
      "Considera: tasse turistiche, gestione, manutenzione",
      "Regolamentazione turistica potrebbe inasprirsi, rischio?"
    ],
    valuta: ['tourist_market', 'long_term_analysis', 'regulatory_risk']
  },
  {
    id: 27,
    nome: 'Stefano - Logistica/Warehouse',
    conversazione: [
      "Capannone logistico 8000 mq hinterland Milano",
      "Tenant Amazon/DHL, affitto €65/mq/anno",
      "Build-to-suit vs speculativo",
      "Analizza con pre-lease 10 anni",
      "Yield on cost 7.5%, exit cap 6%",
      "NPV holding 15 anni"
    ],
    valuta: ['logistics', 'commercial_lease', 'long_term']
  },
  {
    id: 28,
    nome: 'Cristina - Student Housing',
    conversazione: [
      "Residenza studenti vicino università",
      "150 camere, affitto €450/mese",
      "Gestione tramite operatore specializzato",
      "Contratto gestione: fisso €30k/anno + 15% revenues",
      "Exit: vendita a REIT specializzato",
      "Analizza come business operativo"
    ],
    valuta: ['student_housing', 'operational_model', 'specialized']
  },
  {
    id: 29,
    nome: 'Marco2 - Seniors Housing',
    conversazione: [
      "Residenza assistita anziani 60 unità",
      "Modello: vendita proprietà + fee gestione",
      "Prezzo vendita €180k/unità",
      "Fee gestione €800/mese per servizi",
      "Richiede autorizzazioni sanitarie complesse",
      "Analizza con development timeline 30 mesi"
    ],
    valuta: ['healthcare', 'complex_authorization', 'hybrid_model']
  },
  {
    id: 30,
    nome: 'Veronica - Office to Residential',
    conversazione: [
      "Conversione uffici in residential (trend post-Covid)",
      "Edificio uffici 3000 mq, diventa 25 appartamenti",
      "Acquisto €2.5M, conversione €1.2M",
      "Incentivi comunali per riqualificazione €300k",
      "Analizza conversion economics",
      "Confronta vs tenere come uffici (vacancy 40%)"
    ],
    valuta: ['conversion', 'adaptive_reuse', 'market_trends']
  },

  // BATCH 31-35: Complessità Tecniche
  {
    id: 31,
    nome: 'Daniele - Bonifica Ambientale',
    conversazione: [
      "Terreno ex-industriale, richiede bonifica",
      "Analisi preliminare: bonifica €400k",
      "Risk: costi potrebbero salire 50%",
      "Post-bonifica: 18 unità vendita €3.2M",
      "Incentivi bonifica €150k",
      "Analizza con range costi bonifica €400-600k"
    ],
    valuta: ['environmental', 'risk_range', 'incentives']
  },
  {
    id: 32,
    nome: 'Silvia - Vincoli Storici',
    conversazione: [
      "Palazzo storico centro Roma, vincolo Belle Arti",
      "Ristrutturazione con vincoli: +30% costi",
      "Progetto premium: 6 unità luxury €5.5M totale",
      "Tempi autorizzazioni: 12 mesi (vs 4 standard)",
      "Tax credit restauro beni storici 40%",
      "Analizza considerando vincoli e incentivi"
    ],
    valuta: ['historical', 'constraints', 'premium']
  },
  {
    id: 33,
    nome: 'Antonio - Demolizione e Ricostruzione',
    conversazione: [
      "Edificio anni '70 da demolire e ricostruire",
      "Vecchio: 1500 mq / Nuovo: 2200 mq (bonus volumetrico)",
      "Demolizione €180k, ricostruzione €1.8M",
      "Sismic bonus + eco bonus: €350k recuperabili",
      "Vendita nuovo: €3.8M",
      "Analizza demo+rebuild vs solo ristrutturazione"
    ],
    valuta: ['demolition', 'rebuild', 'comparison']
  },
  {
    id: 34,
    nome: 'Giovanna - Consolidamento',
    conversazione: [
      "Tre lotti adiacenti, voglio consolidare",
      "Lotto A: €300k, Lotto B: €280k, Lotto C: €320k",
      "Consolidato: posso fare progetto unico 25 unità",
      "Separati: 3 progetti piccoli 6+6+7 unità",
      "Analizza economia consolidamento vs separato",
      "Proprietari vogliono premium per vendere, max quanto?"
    ],
    valuta: ['consolidation', 'land_assembly', 'negotiation']
  },
  {
    id: 35,
    nome: 'Michele - Joint Venture',
    conversazione: [
      "JV con sviluppatore esperto: io capital, lui expertise",
      "Io investo €1.5M (70%), lui €450k + gestione (30%)",
      "Management fee per lui: €80k + 20% profit oltre hurdle 15%",
      "Progetto: 15 unità, vendita stimata €3.5M",
      "Analizza returns per entrambi i partner",
      "Se progetto va male, chi perde quanto?"
    ],
    valuta: ['joint_venture', 'partnership_economics', 'waterfalls']
  },

  // BATCH 36-40: Timing e Mercato
  {
    id: 36,
    nome: 'Beatrice - Market Timing',
    conversazione: [
      "Mercato ora è alto, prezzi vendita peak",
      "Opzione A: sviluppo ora, vendita tra 18 mesi (prezzi incerti)",
      "Opzione B: aspetto 12 mesi, sviluppo se mercato tiene",
      "Opzione C: compro terreno ora, sviluppo solo se mercato ok",
      "Analizza timing strategy",
      "Considera carrying cost terreno €3k/mese"
    ],
    valuta: ['market_timing', 'strategy', 'scenarios']
  },
  {
    id: 37,
    nome: 'Filippo - Ciclo Economico',
    conversazione: [
      "Temo recessione prossimi 12-18 mesi",
      "Progetto richiede 24 mesi sviluppo",
      "Vendite inizierebbero in piena recessione (worst case)",
      "Analizza con stress test: prezzi -15%",
      "Posso hedgiare rischio? Vendita pre-costruzione?",
      "Quale % pre-vendita rende progetto sicuro?"
    ],
    valuta: ['economic_cycle', 'stress_test', 'hedging']
  },
  {
    id: 38,
    nome: 'Ilaria - Fast Exit',
    conversazione: [
      "Non voglio tenere progetto fino a fine",
      "Exit ideale: vendo cantiere a altro sviluppatore dopo 8 mesi",
      "Investito €800k, vendo work-in-progress €1.2M",
      "ROI basso ma veloce, capitale torna subito",
      "Analizza quick flip vs portare a termine",
      "Considera opportunity cost capitale"
    ],
    valuta: ['exit_strategy', 'quick_flip', 'opportunity_cost']
  },
  {
    id: 39,
    nome: 'Massimo - Holding Strategy',
    conversazione: [
      "Non voglio vendere, voglio build-to-hold",
      "12 appartamenti affitto lungo termine",
      "Affitto lordo €180k/anno, netto €145k",
      "Debito €1.2M al 4%, debt service €65k/anno",
      "Cashflow €80k/anno, ma ho appreciation",
      "Analizza 20 anni holding vs vendita anno 3"
    ],
    valuta: ['hold_strategy', 'cashflow', 'long_term_appreciation']
  },
  {
    id: 40,
    nome: 'Serena - Value-Add',
    conversazione: [
      "Compro edificio esistente sotto-performante",
      "Occupancy 60%, affitti sotto mercato",
      "Piano: ristrutturazione light + re-positioning",
      "Costo value-add €400k",
      "Post: occupancy 95%, affitti +30%",
      "Analizza value creation e exit a cap migliore"
    ],
    valuta: ['value_add', 'repositioning', 'cap_rate_compression']
  },

  // BATCH 41-45: Situazioni Critiche
  {
    id: 41,
    nome: 'Lorenzo - Problema Cantiere',
    conversazione: [
      "Progetto in corso, impresa costruttrice fallita",
      "Completato 40%, già speso €1.2M di €2.5M totali",
      "Opzioni: A) Nuova impresa (premium 15%), B) Vendere work-in-progress",
      "Buyers interessati a €800k per cantiere",
      "Analizza: continuo vs esco",
      "Sunk cost €1.2M ma non devono influenzare decisione, giusto?"
    ],
    valuta: ['crisis_management', 'sunk_cost', 'decision_analysis']
  },
  {
    id: 42,
    nome: 'Greta - Regulatory Change',
    conversazione: [
      "Nuovo regolamento comunale cambierà indici",
      "Ora: posso fare 20 unità / Dopo: max 15 unità",
      "Cambio tra 6 mesi, ho permesso entro 4 mesi se sbriglio",
      "Rush costa €50k extra ma salvo 5 unità (€600k revenue)",
      "Rischio: potrei non farcela e sprecare €50k",
      "Analizza expected value rush vs wait"
    ],
    valuta: ['regulatory', 'probability', 'expected_value']
  },
  {
    id: 43,
    nome: 'Nicola - Competing Project',
    conversazione: [
      "Competitor sta sviluppando simile 300m più in là",
      "Lui finisce 6 mesi prima di me, saturerà mercato?",
      "Mio prezzo pianificato €2800/mq, lui farà €2600/mq",
      "Devo ridurre prezzi o differenziare prodotto?",
      "Analizza impact competitive: prezzi -5% vs upgrade prodotto",
      "Quale strategia massimizza profit?"
    ],
    valuta: ['competitive_analysis', 'strategy', 'positioning']
  },
  {
    id: 44,
    nome: 'Elisa - Investor Pullout',
    conversazione: [
      "Partner doveva mettere €500k, si è ritirato",
      "Progetto già avviato, serve capitale ora",
      "Opzioni: A) Nuovo partner 50-50, B) Debt €500k al 6%, C) Riduco scope",
      "Riduco scope: da 12 a 8 unità",
      "Analizza 3 opzioni e impatto su IRR",
      "Quale minimizza dilution mantenendo fattibilità?"
    ],
    valuta: ['capital_restructuring', 'options_analysis', 'crisis']
  },
  {
    id: 45,
    nome: 'Roberto2 - Legal Issue',
    conversazione: [
      "Problema legale con vicino, contesta confini",
      "Rischio: potrei perdere 200 mq di terreno",
      "Legal dice: 60% vinco, 40% perdo",
      "Se perdo 200 mq: progetto scende da 10 a 8 unità",
      "Vicino offre settlement €80k per chiudere ora",
      "Analizza: settlement vs contenzioso (expected value)"
    ],
    valuta: ['legal_risk', 'probability_analysis', 'settlement']
  },

  // BATCH 46-50: Expert Level
  {
    id: 46,
    nome: 'Emanuela - Tax Optimization',
    conversazione: [
      "Voglio ottimizzare tassazione su profit €800k",
      "Opzione A: Vendita diretta (tassazione 26% su gain)",
      "Opzione B: Tramite SPV (tassazione società + dividendi)",
      "Opzione C: Reinvesto in altro progetto (tassazione differita)",
      "Analizza net dopo tasse per ogni opzione",
      "Quale massimizza after-tax return?"
    ],
    valuta: ['tax', 'structures', 'optimization']
  },
  {
    id: 47,
    nome: 'Giacomo - 1031 Exchange (US Style)',
    conversazione: [
      "Vendo proprietà A, capital gain €600k",
      "Voglio reinvestire in proprietà B per differire tasse",
      "Timing critico: 45 giorni identify, 180 closing",
      "Proprietà B costa €2.2M, debito €1.5M",
      "Analizza mechanics e risparmio fiscale",
      "Vale la complessità per differire €156k tasse?"
    ],
    valuta: ['advanced_tax', 'us_concepts', 'timing']
  },
  {
    id: 48,
    nome: 'Vittoria - REIT Structuring',
    conversazione: [
      "Voglio creare mini-REIT con 5 proprietà affitto",
      "Valore totale €8M, debito €4.5M, yield 6.2%",
      "Cerco investitori per €1.5M equity",
      "Distribuzione obbligatoria 90% profits",
      "Analizza cashflow e distributions",
      "Struttura è scalabile a 20+ proprietà?"
    ],
    valuta: ['reit', 'fund_structure', 'distributions']
  },
  {
    id: 49,
    nome: 'Leonardo - Mezz Financing',
    conversazione: [
      "Progetto €5M: equity €1M, senior debt €3M, gap €1M",
      "Mezz lender offre €1M al 12% + equity kicker 10%",
      "Alternate: cerco secondo equity investor (diluzione)",
      "Analizza waterfalls con mezz vs più equity",
      "IRR per me con mezz vs diluzione?",
      "Quale struttura preferibile?"
    ],
    valuta: ['mezzanine', 'capital_structure', 'waterfalls']
  },
  {
    id: 50,
    nome: 'Camilla - Portfolio Exit',
    conversazione: [
      "10 anni carriera, ho 8 proprietà affitto",
      "Cashflow totale €120k/anno, valore mercato €6.5M",
      "Voglio uscire, opzioni: A) Bulk sale, B) Vendita graduale 2 anni",
      "Bulk: sconto 10% ma tutto subito",
      "Graduale: prezzi pieni ma carrying cost + timing risk",
      "Analizza NPV entrambe strategie",
      "Considerando ho 55 anni e voglio pensione, cosa consigli?"
    ],
    valuta: ['portfolio_exit', 'life_planning', 'strategy']
  }
];

let globalResults = [];
let conversazioniComplete = [];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(userId, sessionId, message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId, message })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

async function testProfilo(profilo) {
  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`👤 ${profilo.nome} (ID: ${profilo.id})\n`);
  
  const userId = `test-user-${profilo.id}`;
  const sessionId = `session-${profilo.id}-${Date.now()}`;
  
  let conversazioneLog = {
    profilo: profilo.nome,
    userId,
    sessionId,
    messaggi: [],
    valutazioni: {}
  };
  
  for (let i = 0; i < profilo.conversazione.length; i++) {
    const msg = profilo.conversazione[i];
    const num = i + 1;
    
    console.log(`📝 ${num}/${profilo.conversazione.length}: "${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}"`);
    
    const startTime = Date.now();
    
    try {
      const result = await sendMessage(userId, sessionId, msg);
      const duration = Date.now() - startTime;
      
      const hasTools = result.functionCalls && result.functionCalls.length > 0;
      const hasSmart = result.smart === true;
      const hasArtifacts = result.artifacts && result.artifacts.length > 0;
      
      const responsePreview = result.response?.substring(0, 80) || 'Nessuna risposta';
      
      console.log(`   ⏱️  ${duration}ms | Tool: ${hasTools ? '✅' : '✗'} | Smart: ${hasSmart ? '✅' : '✗'} | Artifacts: ${hasArtifacts ? result.artifacts.length : 0}`);
      console.log(`   💬 "${responsePreview}${result.response?.length > 80 ? '...' : ''}"\n`);
      
      conversazioneLog.messaggi.push({
        num,
        input: msg,
        output: result.response,
        duration,
        toolActivation: hasTools,
        toolsUsed: result.functionCalls || [],
        smart: hasSmart,
        artifacts: result.artifacts?.length || 0
      });
      
      await sleep(1000); // Pausa tra messaggi
      
    } catch (error) {
      console.log(`   ❌ ERRORE: ${error.message}\n`);
      conversazioneLog.messaggi.push({
        num,
        input: msg,
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }
  
  // Valutazione finale profilo
  profilo.valuta.forEach(aspetto => {
    conversazioneLog.valutazioni[aspetto] = "DA_VALUTARE_MANUALMENTE";
  });
  
  conversazioniComplete.push(conversazioneLog);
  
  console.log(`✅ Completato profilo: ${profilo.nome}\n`);
}

async function testBatch(batch, batchNum) {
  console.log(`\n\n${'█'.repeat(80)}`);
  console.log(`🎯 BATCH ${batchNum}: Profili ${batch[0].id}-${batch[batch.length-1].id}`);
  console.log(`${'█'.repeat(80)}\n`);
  
  for (const profilo of batch) {
    await testProfilo(profilo);
  }
  
  // Salva risultati batch
  fs.writeFileSync(
    `test-os2-50-profili-batch-${batchNum}.json`,
    JSON.stringify(conversazioniComplete.slice(-batch.length), null, 2)
  );
  
  console.log(`\n✅ Batch ${batchNum} completato e salvato!\n`);
}

async function analisiTrend(batchNum) {
  console.log(`\n\n${'🔍'.repeat(40)}`);
  console.log(`📊 ANALISI TREND - Dopo Batch ${batchNum}`);
  console.log(`${'🔍'.repeat(40)}\n`);
  
  const ultimiBatch = conversazioniComplete.slice(-5);
  
  let toolActivationCount = 0;
  let totalMessages = 0;
  let avgDuration = 0;
  let durationCount = 0;
  let errori = 0;
  
  ultimiBatch.forEach(conv => {
    conv.messaggi.forEach(msg => {
      if (msg.error) {
        errori++;
      } else {
        totalMessages++;
        if (msg.toolActivation) toolActivationCount++;
        if (msg.duration) {
          avgDuration += msg.duration;
          durationCount++;
        }
      }
    });
  });
  
  avgDuration = durationCount > 0 ? Math.round(avgDuration / durationCount) : 0;
  const toolActivationRate = totalMessages > 0 ? (toolActivationCount / totalMessages * 100).toFixed(1) : 0;
  
  console.log(`📊 METRICHE BATCH ${batchNum}:`);
  console.log(`   • Messaggi totali: ${totalMessages}`);
  console.log(`   • Tool activation rate: ${toolActivationRate}%`);
  console.log(`   • Response time medio: ${avgDuration}ms`);
  console.log(`   • Errori: ${errori}`);
  console.log(`\n💡 PATTERN IDENTIFICATI:`);
  console.log(`   [Analisi manuale richiesta - review file JSON]\n`);
  
  // Pausa per review
  console.log(`⏸️  PAUSA - Review risultati prima di continuare...\n`);
}

async function main() {
  console.log(`\n${'🚀'.repeat(40)}`);
  console.log(`🎯 TEST MANIACALE - 50 CONVERSAZIONI PROFONDE`);
  console.log(`   Ambiente: ${USE_PROD ? 'PRODUZIONE' : 'LOCALE'}`);
  console.log(`   API: ${API_URL}`);
  console.log(`${'🚀'.repeat(40)}\n`);
  
  // Dividi in 10 batch da 5
  const batches = [];
  for (let i = 0; i < PROFILI.length; i += 5) {
    batches.push(PROFILI.slice(i, i + 5));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batchNum = i + 1;
    
    await testBatch(batches[i], batchNum);
    
    // Analisi ogni 5 test (ogni batch)
    await analisiTrend(batchNum);
    
    if (batchNum < batches.length) {
      console.log(`\n⏳ Preparazione prossimo batch...\n`);
      await sleep(3000);
    }
  }
  
  // RECAP FINALE
  console.log(`\n\n${'🏆'.repeat(40)}`);
  console.log(`📊 RECAP FINALE - 50 CONVERSAZIONI COMPLETE`);
  console.log(`${'🏆'.repeat(40)}\n`);
  
  let totalMsg = 0;
  let totalTools = 0;
  let totalDuration = 0;
  let totalErrors = 0;
  
  conversazioniComplete.forEach(conv => {
    conv.messaggi.forEach(msg => {
      if (msg.error) {
        totalErrors++;
      } else {
        totalMsg++;
        if (msg.toolActivation) totalTools++;
        if (msg.duration) totalDuration += msg.duration;
      }
    });
  });
  
  console.log(`✅ TEST COMPLETATI:`);
  console.log(`   • Profili testati: ${PROFILI.length}`);
  console.log(`   • Messaggi totali: ${totalMsg}`);
  console.log(`   • Tool activation: ${totalTools} (${(totalTools/totalMsg*100).toFixed(1)}%)`);
  console.log(`   • Response time medio: ${Math.round(totalDuration/totalMsg)}ms`);
  console.log(`   • Errori: ${totalErrors}`);
  console.log(`   • Success rate: ${((totalMsg-totalErrors)/totalMsg*100).toFixed(1)}%\n`);
  
  // Salva tutto
  fs.writeFileSync(
    'test-os2-50-profili-COMPLETE.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ambiente: USE_PROD ? 'PRODUZIONE' : 'LOCALE',
      profili: PROFILI.length,
      messaggiTotali: totalMsg,
      conversazioni: conversazioniComplete,
      metriche: {
        toolActivation: `${(totalTools/totalMsg*100).toFixed(1)}%`,
        avgResponseTime: `${Math.round(totalDuration/totalMsg)}ms`,
        successRate: `${((totalMsg-totalErrors)/totalMsg*100).toFixed(1)}%`,
        errori: totalErrors
      }
    }, null, 2)
  );
  
  console.log(`💾 Risultati completi salvati in: test-os2-50-profili-COMPLETE.json\n`);
  console.log(`🎉 TEST MANIACALE COMPLETATO!\n`);
}

main().catch(console.error);
