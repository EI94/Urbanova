'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  BarChart3,
  FileText,
  Settings,
  Plus,
  Send,
  Bot,
  User,
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  Building2,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  BuildingIcon,
  EuroIcon,
  Euro,
  TrendingUpIcon,
  CalendarIcon,
  Users,
  Trash2,
  Bell,
  X,
} from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { dashboardService, DashboardStats } from '@/lib/dashboardService';
import { chatHistoryService, ChatSession } from '@/lib/chatHistoryService';
import { ChatMessage } from '@/types/chat';
// Dynamic imports per evitare TDZ - componenti renderizzati dopo mount
const FeedbackWidget = dynamic(
  () => import('@/components/ui/FeedbackWidget').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const WorkspaceManager = dynamic(
  () => import('@/components/workspace/WorkspaceManager').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const ProjectPreview = dynamic(
  () => import('@/components/chat/ProjectPreview').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const NotificationsPanel = dynamic(
  () => import('@/components/ui/NotificationsPanel').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const UserProfilePanelFixed = dynamic(
  () => import('@/components/ui/UserProfilePanelFixed').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const MarkdownRenderer = dynamic(
  () => import('@/components/ui/MarkdownRenderer').then(mod => ({ default: mod.default })),
  { ssr: false }
);
const GeographicSearch = dynamic(
  () => import('@/components/ui/GeographicSearch').then(mod => ({ default: mod.GeographicSearch })),
  { ssr: false }
);

import { Workspace } from '@/types/workspace';
import { ProjectPreview as ProjectPreviewType } from '@/lib/intentService';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import type { GeographicSearchResult } from '@/components/ui/GeographicSearch';
import dynamic from 'next/dynamic';
// Caricamento dinamico per evitare problemi di inizializzazione post-login
const VoiceAIChatGPT = dynamic(
  () => import('@/app/components/os2/VoiceAIChatGPT').then(mod => ({ default: mod.VoiceAIChatGPT })),
  { ssr: false }
);
// Dynamic imports per evitare problemi di inizializzazione TDZ (Audio/window non disponibili durante SSR/init)
const VoiceModeOverlay = dynamic(
  () => import('@/components/ui/VoiceModeOverlay').then(mod => ({ default: mod.VoiceModeOverlay })),
  { ssr: false }
);
const ResultMessage = dynamic(
  () => import('@/components/chat/ResultMessage').then(mod => ({ default: mod.ResultMessage })),
  { ssr: false }
);
const ConversationDeleteModal = dynamic(
  () => import('@/components/ui/ConversationDeleteModal').then(mod => ({ default: mod.ConversationDeleteModal })),
  { ssr: false }
);
const ConversationList = dynamic(
  () => import('@/components/ui/ConversationList').then(mod => ({ default: mod.ConversationList })),
  { ssr: false }
);
// Caricamento dinamico DashboardLayout per evitare problemi di inizializzazione post-login
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout').then(mod => ({ default: mod.default })),
  { ssr: false }
);
// TEMPORANEAMENTE DISABILITATO: import { InteractiveMap, MapMarker } from '@/components/map/InteractiveMap';
// TEMPORANEAMENTE DISABILITATO: import { useMapData } from '@/hooks/useMapData';

// I dati mock sono stati rimossi - ora utilizziamo dati reali dal database

// Le interfacce ChatMessage e ChatSession sono ora importate da chatHistoryService

// Interfaccia per le esecuzioni tool
interface ToolExecution {
  id: string;
  toolId: string;
  action: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  output?: any;
  error?: string;
}

export default function UnifiedDashboardPage() {
  // 🛡️ GUARD: Renderizza solo dopo mount client per evitare TDZ
  const [mounted, setMounted] = useState(false);
  
  const { t } = useLanguage();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [UnifiedDashboard] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const currentUser = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const authLoading = (authContext && typeof authContext === 'object' && 'loading' in authContext) ? authContext.loading : false;
  const { darkMode, setDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolExecutions, setActiveToolExecutions] = useState<ToolExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'analytics' | 'tools' | 'business-plan' | 'market-intelligence' | 'feasibility-analysis' | 'design-center' | 'permits-compliance' | 'project-timeline' | 'project-management' | 'marketing' | 'epc'
  >('overview');
  
  // Chat history e quick actions
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // 🎤 Voice Mode State
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  
  // Conversation deletion
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    title: string;
  }>({ isOpen: false, sessionId: '', title: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Funzioni per gestione conversazioni
  const handleDeleteConversation = async (sessionId: string) => {
    try {
      console.log('🗑️ [Chat History] INIZIO eliminazione conversazione:', sessionId);
      console.log('🗑️ [Chat History] Chat history PRIMA:', chatHistory.length, 'conversazioni');
      
      setIsDeleting(true);
      
      // Verifica che la sessione esista prima di eliminarla
      const sessionToDelete = chatHistory.find(s => s.id === sessionId);
      if (!sessionToDelete) {
        console.warn('⚠️ [Chat History] Sessione non trovata per eliminazione:', sessionId);
        setIsDeleting(false);
        return;
      }
      
      console.log('🗑️ [Chat History] Eliminando sessione:', { id: sessionToDelete.id, title: sessionToDelete.title });
      
      // Elimina dal localStorage con error handling robusto
      try {
        chatHistoryService.deleteChatSession(sessionId);
      } catch (deleteError) {
        console.error('❌ [Chat History] Errore durante eliminazione:', deleteError);
        setIsDeleting(false);
        // Mostra errore all'utente
        alert('Errore durante l\'eliminazione della conversazione. Riprova.');
        return;
      }
      
      // Aggiorna stato locale con verifica robusta
      const updatedHistory = chatHistoryService.getChatSessions();
      console.log('🗑️ [Chat History] Chat history DOPO eliminazione:', updatedHistory.length, 'conversazioni');
      console.log('🗑️ [Chat History] Conversazioni rimanenti:', updatedHistory.map(c => ({ id: c.id, title: c.title })));
      
      // Verifica che l'eliminazione sia avvenuta
      const stillExists = updatedHistory.some(s => s.id === sessionId);
      if (stillExists) {
        console.error('❌ [Chat History] ERRORE: Sessione ancora presente dopo eliminazione!');
        setIsDeleting(false);
        alert('Errore: la conversazione non è stata eliminata. Riprova.');
        return;
      }
      
      // Forza creazione di nuovo array per React
      setChatHistory([...updatedHistory]);
      
      // Se era la conversazione corrente, resetta
      if (currentSessionId === sessionId) {
        console.log('🗑️ [Chat History] Era conversazione corrente, resetto stato');
        setCurrentSessionId(null);
        setMessages([]);
      }
      
      console.log('✅ [Chat History] Conversazione eliminata con successo:', sessionId);
      
      // Mostra feedback positivo
      // TODO: Aggiungere toast notification
      
    } catch (error) {
      console.error('❌ [Chat History] Errore critico eliminazione:', error);
      alert('Errore critico durante l\'eliminazione. Contatta il supporto.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (sessionId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      sessionId,
      title: title || 'Conversazione senza titolo'
    });
  };

  const handleConfirmDelete = async () => {
    console.log('🗑️ [Chat History] CONFERMA eliminazione:', deleteModal.sessionId);
    await handleDeleteConversation(deleteModal.sessionId);
    setDeleteModal({ isOpen: false, sessionId: '', title: '' });
    console.log('🗑️ [Chat History] Modal chiuso dopo eliminazione');
  };

  // SessionId persistente per utente
  const getPersistentSessionId = useCallback(() => {
    if (currentUser?.uid) {
      return `session_${currentUser.uid}`;
    }
    return 'session_anonymous';
  }, [currentUser?.uid]);
  
  // Carica chat esistente quando l'utente torna alla dashboard
  useEffect(() => {
    if (currentUser?.uid) {
      const sessionId = getPersistentSessionId();
      const existingSession = chatHistoryService.getChatSession(sessionId);
      
      if (existingSession && existingSession.messages.length > 0) {
        console.log('📂 [Dashboard] Caricando chat esistente:', existingSession.messages.length, 'messaggi');
        setMessages(existingSession.messages);
        setCurrentSessionId(sessionId);
      }
    }
  }, [currentUser?.uid, getPersistentSessionId]);
  
  // Mappa tool names tecnici a nomi user-friendly
  const getFriendlyToolName = (toolId: string): string => {
    const friendlyNames: Record<string, string> = {
      'feasibility_analyze': 'Analisi Fattibilità',
      'business_plan_calculate': 'Business Plan',
      'business_plan_sensitivity': 'Analisi Sensibilità',
      'business_plan_export': 'Esportazione Business Plan',
      'project_save': 'Salvataggio Progetto',
      'project_create': 'Creazione Progetto',
      'project_list': 'Lista Progetti',
      'project_query': 'Ricerca Progetti',
      'conversation_general': 'Elaborazione',
      'workflow_execute': 'Workflow',
    };
    
    return friendlyNames[toolId] || toolId;
  };
  
  // Project previews from chat
  const [projectPreviews, setProjectPreviews] = useState<ProjectPreviewType[]>([]);
  
  // Result preview per mostrare risultati analisi
  // const [resultPreview, setResultPreview] = useState<{
  //   type: 'feasibility' | 'businessPlan' | 'sensitivity';
  //   data: any;
  // } | null>(null); // Rimosso - ora integrato nella chat

  // Notifications, Profile, Settings
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Stato per i dati della dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stato per ricerca geografica
  const [geographicSearchResults, setGeographicSearchResults] = useState<GeographicSearchResult[]>([]);
  const [showGeographicSearch, setShowGeographicSearch] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  
  // 🎤 Voice AI Hook - Design Johnny Ive (per compatibilità)
  // const { handleTranscription, handleSpeaking } = useVoiceAI();
  
  // 🎤 OpenAI TTS - Fallback diretto senza hook per evitare TDZ (Audio/window non disponibili durante init)
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [TTSError, setTTSError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const synthesize = useCallback(async (text: string, options?: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsTTSLoading(true);
      setTTSError(null);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ...(options || {}) }),
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const data = await response.json();
      const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Ferma audio precedente
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onplay = () => setIsTTSPlaying(true);
      audio.onended = () => {
        setIsTTSPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsTTSPlaying(false);
        setIsTTSLoading(false);
        setTTSError('Errore riproduzione audio');
      };
      
      setIsTTSLoading(false);
      await audio.play();
    } catch (error) {
      console.error('❌ [TTS] Error:', error);
      setIsTTSLoading(false);
      setTTSError(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }, []);
  
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsTTSPlaying(false);
      currentAudioRef.current = null;
    }
  }, []);
  
  // Voice mode state (rimosso duplicato)
  const isVoiceMode = isVoiceModeActive;
  
  // Speaking state (per compatibilità con VoiceAI)
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Gestione sintesi vocale (per compatibilità con VoiceAI)
  const handleSpeakingState = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
    // handleSpeaking(speaking); // Commentato per evitare errori
  }, []);
  
  // TEMPORANEAMENTE DISABILITATO: Hook per dati mappa
  // const {
  //   markers: mapMarkers,
  //   filteredMarkers,
  //   loading: mapLoading,
  //   error: mapError,
  //   getStatistics: getMapStatistics
  // } = useMapData({
  //   autoLoad: true,
  //   maxMarkers: 2000,
  //   enableClustering: true
  // });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carica dati dashboard e chat history
  useEffect(() => {
    console.log('🔍 [DEBUG CRASH] useEffect initializeDashboard - PUNTO CRITICO WEB 4');
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔒 CONTROLLO AUTENTICAZIONE: Solo se l'utente è autenticato
        if (!currentUser?.uid) {
          console.warn('⚠️ [Unified Dashboard] Utente non autenticato, skip caricamento dati');
          setLoading(false);
          return;
        }
        console.log('🔍 [DEBUG CRASH] Utente autenticato, procedo con caricamento - PUNTO CRITICO WEB 5');

        // Inizializza i dati della dashboard se necessario
        await dashboardService.initializeDashboardData();

        // Carica le statistiche iniziali
        const initialStats = await dashboardService.getDashboardStats();
        setStats(initialStats);

        // Carica la chat history persistente
        const savedChatHistory = chatHistoryService.getChatSessions();
        setChatHistory(savedChatHistory);
        console.log('✅ [Chat History] Caricate sessioni salvate:', savedChatHistory.length);

        // Carica workspace dell'utente
        if (currentUser) {
          // await loadWorkspaces(); // Temporaneamente disabilitato
          // Carica notifiche e profilo utente
          await loadUserData();
        }

        console.log('✅ [Unified Dashboard] Statistiche iniziali caricate:', initialStats);
      } catch (error) {
        console.error('❌ [Unified Dashboard] Errore inizializzazione:', error);
        setError('Impossibile caricare le statistiche della dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [currentUser?.uid]);

  // Sottoscrizione agli aggiornamenti in tempo reale
  useEffect(() => {
    if (!stats) return;

    console.log('🔄 [Unified Dashboard] Sottoscrizione aggiornamenti real-time...');

    const unsubscribe = dashboardService.subscribeToDashboardUpdates(newStats => {
      console.log('🔄 [Unified Dashboard] Aggiornamento real-time ricevuto:', newStats);
      setStats(newStats);
    }, currentUser?.uid);

    return unsubscribe;
  }, [stats]);

  // Carica dati utente (notifiche e profilo)
  const loadUserData = async () => {
    try {
      if (!currentUser?.uid) return;

      const [notificationsData, profileData] = await Promise.all([
        firebaseNotificationService.getNotifications(currentUser.uid),
        firebaseUserProfileService.getUserProfile(currentUser.uid),
      ]);

      setNotifications(notificationsData);
      setUserProfile(profileData);
      console.log('✅ [User Data] Notifiche e profilo caricati');
    } catch (error) {
      console.error('❌ [User Data] Errore caricamento dati utente:', error);
    }
  };

  // Esegue tool action tramite API
  const executeToolAction = async (toolId: string, action: string, args: any) => {
    try {
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          action,
          args,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.runId;
    } catch (error) {
      console.error('Errore nell\'esecuzione tool action:', error);
      throw error;
    }
  };

  // Simula esecuzione tool
  const simulateToolExecution = async (toolId: string, action: string, args: any) => {
    const executionId = `exec_${Date.now()}`;
    
    const execution: ToolExecution = {
      id: executionId,
      toolId,
      action,
      status: 'running',
      progress: 0,
      startTime: new Date(),
    };

    setActiveToolExecutions(prev => [...prev, execution]);

    // Simula progresso
    const interval = setInterval(() => {
      setActiveToolExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, progress: Math.min(exec.progress + 10, 100) }
            : exec
        )
      );
    }, 500);

    // Simula completamento dopo 3 secondi
    setTimeout(() => {
      clearInterval(interval);
      setActiveToolExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { 
                ...exec, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date(),
                output: { success: true, message: 'Tool execution completed successfully' }
              }
            : exec
        )
      );
    }, 3000);

    return executionId;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // 🔊 SUONO THINKING: Riproduci suono durante elaborazione (solo in modalità voce)
    if (isVoiceMode) {
      console.log('🧠 [UNIFIED] Riproduco suono thinking...');
      // TODO: Implementare suono thinking personalizzato
      // Per ora usiamo un beep semplice
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.log('⚠️ [UNIFIED] Suono thinking non disponibile:', error);
      }
    }

    try {
      // 🎯 Chiama OS 2.0 API per esperienza completa
      const response = await fetch('/api/os2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          userId: currentUser?.uid || 'anonymous',
          userEmail: currentUser?.email || 'user@urbanova.life',
          sessionId: getPersistentSessionId(), // SessionId persistente!
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        ...(data.type ? {
          intelligentData: {
            type: data.type,
            confidence: data.confidence,
            relatedData: data.relatedData,
            followUpQuestions: data.followUpQuestions || [],
            actions: data.actions || [],
            visualizations: data.visualizations || []
          }
        } : {})
      };

      // Gestisci result preview per analisi
      if (data.resultData) {
        // Aggiungi resultData al messaggio AI
        aiResponse.resultData = data.resultData;
      }
      
      // Gestisci project preview se presente
      if (data.projectPreview) {
        setProjectPreviews(prev => [data.projectPreview, ...prev]);
        console.log('✅ [Chat] Project preview aggiunto:', data.projectPreview.id);
      }

      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);
      
      // Salva chat in localStorage per persistenza
      const sessionId = getPersistentSessionId();
      chatHistoryService.saveChatSession({
        id: sessionId,
        title: `Chat ${new Date().toLocaleDateString()}`,
        preview: aiResponse.content.substring(0, 100),
        timestamp: new Date(),
        messages: finalMessages
      });
      setCurrentSessionId(sessionId);

      // 🎤 OpenAI TTS - Sintesi vocale naturale di alta qualità (SOLO in modalità voce)
      if (isVoiceMode) {
        console.log('🔊 [UNIFIED] Avvio sintesi vocale OpenAI TTS (modalità voce attiva)...');
        
        try {
          await synthesize(aiResponse.content, {
            voice: 'nova', // Voce femminile giovane e naturale per italiano
            speed: 1.0,
            hd: true // Qualità HD per massima qualità
          });
          
          console.log('✅ [UNIFIED] Sintesi vocale OpenAI TTS avviata');
        } catch (error) {
          console.error('❌ [UNIFIED] Errore sintesi vocale OpenAI TTS:', error);
        }
      } else {
        console.log('🔇 [UNIFIED] Sintesi vocale disabilitata (modalità testo)');
      }

      // Salva nella chat history persistente se è una conversazione significativa
      if (finalMessages.length > 2) {
        let sessionToUpdate: ChatSession | null = null;
        
        // Se abbiamo una sessione corrente, aggiornala
        if (currentSessionId) {
          sessionToUpdate = chatHistoryService.getChatSession(currentSessionId);
        }
        
        if (sessionToUpdate) {
          // Aggiorna sessione esistente
          sessionToUpdate.messages = finalMessages;
          sessionToUpdate.preview = aiResponse.content.substring(0, 100) + '...';
          chatHistoryService.saveChatSession(sessionToUpdate);
          console.log('✅ [Chat History] Sessione aggiornata:', sessionToUpdate.title || 'Senza titolo');
        } else {
          // Crea nuova sessione
          const newSession = chatHistoryService.createSessionFromMessages(finalMessages);
          chatHistoryService.saveChatSession(newSession);
          setCurrentSessionId(newSession.id);
          console.log('✅ [Chat History] Nuova sessione creata:', newSession.title || 'Senza titolo');
        }
        
        // Ricarica la chat history
        const updatedHistory = chatHistoryService.getChatSessions();
        setChatHistory(updatedHistory);
      }
    } catch (error) {
      console.error('❌ [Chatbot] Errore chiamata API:', error);
      
      // Fallback in caso di errore
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          `Ciao! Sono qui per aiutarti con tutto quello che riguarda lo sviluppo immobiliare. Posso supportarti nella creazione di business plan, analisi di mercato, progettazione, gestione documenti, permessi e molto altro.\n\n` +
          `Dimmi pure cosa hai in mente - magari vuoi iniziare un nuovo progetto, analizzare un terreno specifico, o hai bisogno di aiuto con la documentazione? Sono qui per rendere il tuo lavoro più semplice e efficace.`,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, fallbackResponse];
      setMessages(finalMessages);

      // Salva anche il fallback nella chat history
      if (finalMessages.length > 2) {
        let sessionToUpdate: ChatSession | null = null;
        
        if (currentSessionId) {
          sessionToUpdate = chatHistoryService.getChatSession(currentSessionId);
        }
        
        if (sessionToUpdate) {
          sessionToUpdate.messages = finalMessages;
          sessionToUpdate.preview = fallbackResponse.content.substring(0, 100) + '...';
          chatHistoryService.saveChatSession(sessionToUpdate);
        } else {
          const newSession = chatHistoryService.createSessionFromMessages(finalMessages);
          chatHistoryService.saveChatSession(newSession);
          setCurrentSessionId(newSession.id);
        }
        
        const updatedHistory = chatHistoryService.getChatSessions();
        setChatHistory(updatedHistory);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Carica workspace dell'utente
  // const loadWorkspaces = async () => { // Temporaneamente disabilitato
  //   try {
  //     if (!currentUser) return;
  //     
  //     const response = await fetch(`/api/workspace/user/${currentUser.uid}`);
  //     const data = await response.json();
  //     
  //     if (data.success) {
  //       setWorkspaces(data.workspaces);
  //       console.log('✅ [Workspace] Workspace caricati:', data.workspaces.length);
  //     }
  //   } catch (error) {
  //     console.error('❌ [Workspace] Errore caricamento workspace:', error);
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'PLANNING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard unificata...</p>
        </div>
      </div>
    );
  }

  // Loading state per auth
  if (authLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Caricamento...</p>
        </div>
      </div>
    );
  }

  // 🛡️ GUARD: Renderizza solo dopo mount client per evitare TDZ
  if (!mounted) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white shadow-lg mb-4 animate-pulse">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Urbanova</h1>
          <p className="text-slate-500 mt-2">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard">

      <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Contenuto principale OS 2.0 */}
        {activeTab === 'overview' && (
          <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
            {/* Urbanova Interface - ChatGPT/Cursor Style */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border flex-1 flex flex-col`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowChatHistory(!showChatHistory)}
                      className={`p-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Chat History"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className={`p-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Quick Actions"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  // Stato vuoto stile ChatGPT
                  <div className="flex flex-col items-center justify-center h-full space-y-8">
                    <div className="text-center">
                      <h2 className={`text-3xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                        Cosa c'è in programma oggi?
                      </h2>
                    </div>
                    
                    {/* Suggerimenti eleganti stile ChatGPT */}
                    <div className="space-y-3 w-full max-w-2xl">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                        Prova a chiedere qualcosa come:
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setInputValue('Crea un nuovo studio di fattibilità')}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          "Crea un nuovo studio di fattibilità"
                        </button>
                        <button
                          onClick={() => setShowGeographicSearch(true)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          "Cerca comuni e zone italiane"
                        </button>
                        <button
                          onClick={() => setInputValue('Crea un nuovo progetto')}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          "Crea un nuovo progetto"
                        </button>
                        <button
                          onClick={() => setShowInteractiveMap(true)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          "Visualizza mappa interattiva"
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <MarkdownRenderer content={message.content} className="text-sm leading-relaxed" />
                        
                        {/* Mostra ResultMessage se presente */}
                        {message.resultData && (
                          <div className="mt-3">
                            <ResultMessage 
                              resultData={message.resultData}
                              onActionClick={(action) => {
                                if (action.type === 'view_details') {
                                  if (message.resultData?.type === 'feasibility') {
                                    setActiveTab('feasibility-analysis');
                                  } else if (message.resultData?.type === 'businessPlan') {
                                    setActiveTab('business-plan');
                                  }
                                } else if (action.type === 'edit') {
                                  // Apri modal di modifica o naviga
                                  console.log('Edit action:', action);
                                } else if (action.type === 'export') {
                                  // Trigger export
                                  console.log('Export action:', action);
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Mostra dati intelligenti se presenti */}
                        {message.intelligentData && (
                          <div className="mt-3 space-y-2">
                            {/* Follow-up questions */}
                            {message.intelligentData.followUpQuestions.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs font-medium text-blue-700 mb-2">Domande correlate:</div>
                                <div className="space-y-1">
                                  {message.intelligentData.followUpQuestions.map((question, qIndex) => (
                                    <button
                                      key={qIndex}
                                      onClick={() => setInputValue(question)}
                                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded transition-colors"
                                    >
                                      {question}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Actions */}
                            {message.intelligentData.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {message.intelligentData.actions.map((action, aIndex) => (
                                  <button
                                    key={aIndex}
                                    onClick={() => {
                                      if (action.url) {
                                        window.open(action.url, '_blank');
                                      }
                                    }}
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs transition-colors"
                                  >
                                    {action.icon && <span>{action.icon}</span>}
                                    <span>{action.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* Confidence indicator */}
                            {message.intelligentData.confidence > 0 && (
                              <div className="text-xs text-gray-500">
                                Confidenza: {Math.round(message.intelligentData.confidence * 100)}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mostra project preview dopo l'ultimo messaggio dell'assistente */}
                    {message.type === 'assistant' && index === messages.length - 1 && projectPreviews.length > 0 && (
                      <div className="flex justify-start mt-3">
                        <div className="max-w-md">
                          {projectPreviews.map(project => (
                            <ProjectPreview
                              key={project.id}
                              project={project}
                              onViewProject={(projectId) => {
                                console.log('Visualizza progetto:', projectId);
                                // Redirect al progetto
                                window.open(project.url, '_blank');
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`bg-gradient-to-r ${isVoiceMode ? 'from-green-50 to-blue-50 border-green-200' : 'from-blue-50 to-purple-50 border-blue-200'} text-gray-900 px-4 py-3 rounded-2xl border`}>
                      <div className="flex items-center space-x-2">
                        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${isVoiceMode ? 'border-green-600' : 'border-blue-600'}`}></div>
                        <span className="text-sm font-medium">
                          {isVoiceMode ? '🎤 Sto pensando...' : 'Sto analizzando la tua richiesta...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🎤 Indicatore Registrazione Vocale */}
                {isSpeaking && (
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-gray-900 px-4 py-3 rounded-2xl border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                        </div>
                        <span className="text-sm font-medium">🎤 Sto ascoltando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🎤 Indicatore OpenAI TTS - Design Johnny Ive */}
                {isTTSPlaying && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-900 px-4 py-3 rounded-2xl border border-green-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm font-medium">🎤 Voce naturale OpenAI</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {isTTSLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 text-gray-900 px-4 py-3 rounded-2xl border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">🎤 Generazione audio...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {TTSError && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 text-gray-900 px-4 py-3 rounded-2xl border border-red-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">❌ Errore audio: {TTSError}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Quick Actions */}
              {showQuickActions && (
                <div className="p-4 border-t border-gray-200">
                </div>
              )}
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                {/* 🎤 Voice AI ChatGPT Style */}
                <VoiceAIChatGPT
                  onTranscription={(text) => {
                    console.log('🎤 [UNIFIED] Trascrizione ricevuta:', text);
                    setIsVoiceModeActive(true); // Attiva modalità voce
                    setTranscribedText(text);
                    // handleTranscription(text); // Commentato per evitare errori
                    setInputValue(text);
                    
                    // 🚀 AI NATIVE: Il componente VoiceAIChatGPT gestisce tutto
                    // Non facciamo auto-invio qui, il componente si occupa di tutto
                    console.log('🎯 [UNIFIED] Modalità AI Native attiva');
                  }}
                  onSpeaking={(speaking) => {
                    handleSpeakingState(speaking);
                    if (speaking) {
                      setShowVoiceOverlay(true); // Mostra overlay quando parla
                    }
                  }}
                  className="mr-2"
                />
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value);
                      setIsVoiceModeActive(false); // Disattiva modalità voce quando scrive
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Chiedi qualcosa..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm input-box"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ricerca Geografica */}
            {showGeographicSearch && (
              <div className="mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ricerca Geografica
                    </h3>
                    <button
                      onClick={() => setShowGeographicSearch(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <GeographicSearch
                    onResultSelect={(result) => {
                      console.log('Risultato selezionato:', result);
                      setInputValue(`Analizza il comune di ${result.nome} in ${result.provincia}, ${result.regione}`);
                      setShowGeographicSearch(false);
                    }}
                    onResultsChange={setGeographicSearchResults}
                    placeholder="Cerca comuni, zone, quartieri..."
                    showFilters={true}
                    maxResults={10}
                    includeCoordinates={true}
                    includeMetadata={true}
                  />
                  {geographicSearchResults.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {geographicSearchResults.length} risultati trovati
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mappa Interattiva */}
            {showInteractiveMap && (
              <div className="mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Mappa Interattiva Italia
                    </h3>
                    <button
                      onClick={() => setShowInteractiveMap(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* TEMPORANEAMENTE DISABILITATO: InteractiveMap
                  <InteractiveMap
                    height="400px"
                    initialCenter={[41.9028, 12.4964]} // Centro Italia
                    initialZoom={6}
                    markers={mapMarkers}
                    loading={mapLoading}
                    showSearch={true}
                    showFilters={true}
                    showLegend={true}
                    showControls={true}
                    onMarkerClick={(marker) => {
                      console.log('Marker cliccato:', marker);
                      setInputValue(`Analizza ${marker.nome} in ${marker.provincia}, ${marker.regione}`);
                    }}
                    onMapClick={(lat, lng) => {
                      console.log('Mappa cliccata:', { lat, lng });
                    }}
                  />
                  */}
                  <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      Mappa temporaneamente disabilitata per risolvere problemi di performance
                    </p>
                  </div>
                  {/* TEMPORANEAMENTE DISABILITATO: mapMarkers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {mapMarkers.length} elementi geografici caricati
                      </p>
                    </div>
                  ) */}
                </div>
              </div>
            )}

            {/* Quick Stats - Compact */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                <div className="flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-lg kpi-card-icon">
                    <BuildingIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-600 kpi-card-text">Progetti</p>
                    <p className="text-sm font-bold text-gray-900 kpi-card-value">{stats?.totalProjects || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                <div className="flex items-center">
                  <div className="p-1.5 bg-green-100 rounded-lg kpi-card-icon">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-600 kpi-card-text">Attivi</p>
                    <p className="text-sm font-bold text-gray-900 kpi-card-value">{stats?.activeProjects || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                <div className="flex items-center">
                  <div className="p-1.5 bg-yellow-100 rounded-lg kpi-card-icon">
                    <EuroIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-600 kpi-card-text">Budget</p>
                    <p className="text-sm font-bold text-gray-900 kpi-card-value">
                      €{((stats?.totalBudget || 0) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                <div className="flex items-center">
                  <div className="p-1.5 bg-purple-100 rounded-lg kpi-card-icon">
                    <TrendingUpIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-600 kpi-card-text">ROI</p>
                    <p className="text-sm font-bold text-gray-900 kpi-card-value">
                      {stats?.averageROI?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Urbanova OS 2.0</h1>
                  <p className="text-gray-600 mt-1">Assistente Intelligente con Voice AI</p>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow border border-gray-200 h-96 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Urbanova OS 2.0</span>
                  <span className="text-sm text-gray-500">• Assistente Intelligente con Voice AI</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Sto pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🎤 Indicatore OpenAI TTS - Design Johnny Ive */}
                {isTTSPlaying && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-900 px-4 py-2 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm font-medium">🎤 Voce naturale OpenAI</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {isTTSLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 text-gray-900 px-4 py-2 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">🎤 Generazione audio...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {TTSError && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 text-gray-900 px-4 py-2 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">❌ Errore audio: {TTSError}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {/* 🎤 Voice AI ChatGPT Style */}
                  <VoiceAIChatGPT
                    onTranscription={(text) => {
                      console.log('🎤 [UNIFIED-TOOLS] Trascrizione ricevuta:', text);
                      setIsVoiceModeActive(true); // Attiva modalità voce
                      // handleTranscription(text); // Commentato per evitare errori
                      setInputValue(text);
                      
                      // 🚀 AI NATIVE: Il componente VoiceAIChatGPT gestisce tutto
                      console.log('🎯 [UNIFIED-TOOLS] Modalità AI Native attiva');
                    }}
                    onSpeaking={handleSpeakingState}
                    className="mr-2"
                  />
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value);
                      setIsVoiceModeActive(false); // Disattiva modalità voce quando scrive
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Chiedi qualcosa..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-box"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Tool Executions */}
            {activeToolExecutions.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Sto elaborando...</h3>
                </div>
                <div className="p-4 space-y-3">
                  {activeToolExecutions.map(execution => (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFriendlyToolName(execution.toolId)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {execution.status === 'running' ? 'Sto elaborando...' : 'Completato'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${execution.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{execution.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solo Overview e Tools sono disponibili nella dashboard unificata */}
        {activeTab !== 'overview' && activeTab !== 'tools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Unificata</h1>
                <p className="text-gray-600 mt-1">Interfaccia principale con Urbanova OS</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Benvenuto nella Dashboard Unificata
                </h3>
                <p className="text-gray-500 mb-4">
                  Usa la sidebar per navigare alle funzionalità specifiche o interagisci con Urbanova OS.
                </p>
                <button
                  onClick={() => setActiveTab('tools')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Interagisci con Urbanova OS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat History Panel - Stile ChatGPT */}
        {showChatHistory && (
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowChatHistory(false)} />
        )}
        {showChatHistory && (
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 text-white shadow-lg border-r border-gray-700 z-50">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Conversazioni</h3>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Nuovo bottone chat */}
            <div className="p-3 border-b border-gray-700">
              <button
                onClick={() => {
                  setMessages([]);
                  setCurrentSessionId(null);
                  setShowChatHistory(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Nuova conversazione</span>
              </button>
            </div>
            
            <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-white mb-1">Nessuna conversazione</h4>
                  <p className="text-sm text-gray-400">
                    Le tue chat con Urbanova appariranno qui
                  </p>
                </div>
              ) : (
                <ConversationList
                  key={`conversation-list-${chatHistory.length}`}
                  chatHistory={chatHistory}
                  onSelectConversation={(chat) => {
                    setMessages(chat.messages);
                    setCurrentSessionId(chat.id);
                    setShowChatHistory(false);
                    console.log('✅ [Chat History] Sessione caricata:', chat.title || 'Senza titolo');
                  }}
                  onDeleteConversation={(sessionId: string, title: string) => handleDeleteClick(sessionId, title)}
                  selectedSessionId={currentSessionId || ''}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
      
      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Profile Panel */}
      <UserProfilePanelFixed
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowSettings(false)} />
      )}
      {showSettings && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Impostazioni</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 space-y-6">
            {/* Dark Mode Toggle */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Aspetto</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🌙</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Modalità Scura</p>
                    <p className="text-sm text-gray-500">Attiva il tema scuro per tutte le pagine</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notifiche */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Notifiche</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notifiche Email</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notifiche Push</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Aggiornamenti Progetti</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Privacy</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Profilo Pubblico</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Condivisione Dati</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Azioni</h4>
              <div className="space-y-2">
                <button className="w-full p-3 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Esporta Dati
                </button>
                <button className="w-full p-3 text-left text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  Cambia Password
                </button>
                <button className="w-full p-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Elimina Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Manager Modal - Temporaneamente disabilitato */}
      {/* <WorkspaceManager ... /> */}
      {/* Conversation Delete Modal */}
      <ConversationDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, sessionId: '', title: '' })}
        onConfirm={handleConfirmDelete}
        conversationTitle={deleteModal.title}
        isLoading={isDeleting}
      />

      {/* 🎤 Voice Mode Overlay */}
      <VoiceModeOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        isListening={isVoiceModeActive}
        isSpeaking={isSpeaking}
        isProcessing={false}
        transcribedText={transcribedText}
        audioLevel={0}
        onToggleMute={() => {
          // Implementa toggle mute se necessario
          console.log('🔇 [Voice] Toggle mute');
        }}
        isMuted={false}
        onExitVoiceMode={() => {
          setIsVoiceModeActive(false);
          setShowVoiceOverlay(false);
          setTranscribedText('');
        }}
      />
    </DashboardLayout>
  );
}
