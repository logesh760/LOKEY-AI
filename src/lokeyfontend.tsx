import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, GraduationCap, Target, BookOpen, Menu, X, LogOut, Mail, Lock, ArrowRight, LayoutDashboard, MessageSquare, Sun, Moon, Trash2, Plus, History, Settings, ChevronLeft, ChevronRight, Mic, MicOff, Volume2, FileText, Shield, BrainCircuit, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Auth Component
const Auth = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message === 'Email not confirmed') {
            setError('Please confirm your email address before signing in. Check your inbox for a verification link.');
            return;
          }
          throw error;
        }
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created! Please check your email for a verification link.');
        setIsLogin(true); // Switch to login after signup
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      toast.success('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
      >
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-indigo-600 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <BrainCircuit className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
              LOKEY<span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              {isLogin ? 'Sign in to continue your growth journey' : 'Join LOKEY-AI to start your personal development'}
            </p>
          </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl space-y-3">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
              {error.includes('confirm your email') && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  Resend Confirmation Email
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Chat Component
const Chat = ({ session, trialEnd, isTrialActive, onUpdateProfile }: { session: Session, trialEnd: string | null, isTrialActive: boolean, onUpdateProfile: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm LOKEY-AI, your Student Personal Development Mentor. I'm here to help you grow academically and personally. How can I support you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const calculateRemainingDays = () => {
    if (!trialEnd) return 30;
    const end = new Date(trialEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const remainingDays = calculateRemainingDays();
  const isTrialExpired = remainingDays <= 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto send if transcript is long enough or just let user review
        toast.info(`Transcribed: "${transcript}"`);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Speech recognition not supported in this browser.');
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening...');
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTypingText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          userId: session?.user?.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch response from AI');
      }
      
      const data = await response.json();
      const fullResponse = data.response || "I'm sorry, I couldn't generate a response.";

      // Update profile to get new chat count
      onUpdateProfile();

      // Typing animation
      let currentText = '';
      const words = fullResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setTypingText(currentText);
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 15));
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTypingText('');
      
      // Optional: Auto-speak AI response
      // speak(fullResponse);
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast.error(error.message || "Failed to get AI response");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (messages.length < 3) {
      toast.error('Not enough conversation to summarize yet.');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      setSummary(data.summary);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error('Failed to summarize conversation');
    } finally {
      setIsSummarizing(false);
    }
  };

  const clearChat = async () => {
    if (messages.length <= 1) return;
    if (!window.confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) return;
    
    try {
      const response = await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id })
      });

      if (response.ok) {
        setMessages([messages[0]]);
        setSummary(null);
        toast.success('Conversation history cleared');
      } else {
        throw new Error('Failed to reset chat');
      }
    } catch (error) {
      toast.error('Failed to clear conversation history');
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
          {messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id}
              className={cn(
                "flex gap-4 sm:gap-6 group",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110",
                message.role === 'user' 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                  : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
              )}>
                {message.role === 'user' 
                  ? <User className="w-5 h-5 text-white" /> 
                  : <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                }
              </div>
              <div className={cn(
                "flex-1 space-y-2",
                message.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block p-5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-full glass-card",
                  message.role === 'user' 
                    ? "bg-indigo-600/10 text-zinc-800 dark:text-zinc-100 border-indigo-500/20 rounded-tr-none" 
                    : "bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                )}>
                  <div className={cn(
                    "prose prose-sm max-w-none prose-zinc dark:prose-invert",
                    message.role === 'user' ? "text-indigo-900 dark:text-indigo-100" : ""
                  )}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.role === 'assistant' && (
                    <button 
                      onClick={() => speak(message.content)}
                      className="p-1 hover:text-indigo-600 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Typing Animation */}
          {typingText && (
            <div className="flex gap-4 sm:gap-6 mr-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl rounded-tl-none shadow-sm text-sm text-zinc-800 dark:text-zinc-200">
                  <div className="prose prose-sm max-w-none prose-zinc dark:prose-invert">
                    <ReactMarkdown>{typingText}</ReactMarkdown>
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 bg-indigo-600 ml-1 translate-y-0.5"
                  />
                </div>
              </div>
            </div>
          )}

          {isLoading && !typingText && (
            <div className="flex gap-4 sm:gap-6 mr-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-4">
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div 
                      key={delay}
                      animate={{ y: [0, -6, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay }} 
                      className="w-2 h-2 bg-indigo-600 rounded-full" 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">LOKEY is thinking</span>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 rounded-3xl border-indigo-500/30 relative group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">Conversation Insights</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/generate-pdf', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              content: summary, 
                              title: 'LOKEY-AI Conversation Summary' 
                            }),
                          });
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `LOKEY_AI_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          toast.error('Failed to generate PDF');
                        }
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSummary(null)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none prose-zinc dark:prose-invert">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-10" />
        </div>
      </div>

      {/* Sticky Input Area */}
      <div className="sticky bottom-0 w-full bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50/90 dark:via-zinc-950/90 to-transparent pt-12 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSummarize}
              disabled={isSummarizing || messages.length < 3 || isTrialExpired}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all disabled:opacity-30 shadow-sm"
            >
              {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Summarize Chat
            </motion.button>
          </div>

          <div className="relative group">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isTrialExpired ? "Free trial expired. Premium coming soon." : "Ask LOKEY anything..."}
                disabled={isTrialExpired}
                className={cn(
                  "w-full pl-6 pr-28 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm text-zinc-900 dark:text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-400 font-medium",
                  isTrialExpired && "opacity-50 cursor-not-allowed"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={toggleListening}
                  disabled={isTrialExpired}
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    isListening 
                      ? "bg-red-100 text-red-600 animate-pulse" 
                      : "text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    isTrialExpired && "opacity-30"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isLoading || isTrialExpired}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </div>
          
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isTrialExpired ? "bg-red-500" : "bg-green-500")} />
                {isTrialExpired ? "Free Trial Expired" : "Free Trial Active"}
              </p>
              {!isTrialExpired && (
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                  {remainingDays} days left
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={clearChat}
                className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Gate Component
const AdminGate = ({ userId, email, onBack }: { userId: string, email: string, onBack: () => void }) => {
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Strict check for email and master password
    if (email === 'logeshm15112005@gmail.com' && password === '12345678') {
      setIsVerified(true);
      setError(false);
      toast.success('Admin access granted');
    } else {
      setError(true);
      toast.error('Invalid admin credentials');
    }
  };

  if (isVerified) {
    return <AdminDashboard userId={userId} onBack={onBack} />;
  }

  return (
    <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-indigo-600 rounded-2xl mb-2 shadow-lg shadow-indigo-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Admin Verification</h2>
          <p className="text-sm text-zinc-500">Please enter the master password to proceed.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Master Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800/50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                )}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Verify Identity
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 font-bold text-xs rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main App Component
export default function LokeyFrontend() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      setIsAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
        setUserRole(null);
        setTrialEnd(null);
        setIsTrialActive(true);
        setPlan('free');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, trial_end, is_trial_active, plan')
        .eq('id', userId)
        .single();
      
      const email = session?.user?.email;

      if (!error && data) {
        setTrialEnd(data.trial_end);
        setIsTrialActive(data.is_trial_active);
        setPlan(data.plan || 'free');

        // Exclusive Admin Check
        if (email === 'logeshm15112005@gmail.com') {
          if (data.role !== 'admin') {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
          }
          setUserRole('admin');
        } else {
          // Force everyone else to 'user' role for maximum security
          if (data.role === 'admin') {
            await supabase.from('profiles').update({ role: 'user' }).eq('id', userId);
            setUserRole('user');
          } else {
            setUserRole(data.role);
          }
        }
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const role = email === 'logeshm15112005@gmail.com' ? 'admin' : 'user';
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            email, 
            role, 
            trial_end: trialEndDate.toISOString().split('T')[0],
            is_trial_active: true,
            plan: 'free' 
          }])
          .select('role, trial_end, is_trial_active, plan')
          .single();
        if (!createError && newProfile) {
          setUserRole(newProfile.role);
          setTrialEnd(newProfile.trial_end);
          setIsTrialActive(newProfile.is_trial_active);
          setPlan(newProfile.plan);
        } else if (createError) {
          toast.error("Failed to initialize user profile");
        }
      } else if (error) {
        toast.error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      toast.error("An unexpected error occurred while loading your profile");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-hidden">
          <Toaster position="top-right" richColors />
          
          {!session ? (
            <div className="flex-1 overflow-y-auto">
              <Auth onAuthSuccess={() => {}} />
            </div>
          ) : (
            <>
              {/* Desktop Sidebar */}
              <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="hidden lg:flex flex-col bg-zinc-900 text-zinc-300 border-r border-zinc-800 overflow-hidden glass"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <BrainCircuit className="w-6 h-6 text-white relative z-10" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">LOKEY<span className="text-indigo-400">AI</span></span>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 w-full p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-500/20 mb-8"
                  >
                    <Plus className="w-5 h-5" />
                    New Mentor Session
                  </motion.button>

                  <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-3 mb-4">Main Menu</p>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm font-medium group">
                      <MessageSquare className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
                      AI Mentor
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm font-medium group">
                      <LayoutDashboard className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
                      Dashboard
                    </Link>

                    {userRole === 'admin' && session?.user?.email === 'logeshm15112005@gmail.com' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm font-medium group text-purple-400">
                        <Shield className="w-5 h-5 text-purple-500 group-hover:text-purple-300" />
                        Admin Panel
                      </Link>
                    )}
                    
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-3 mt-10 mb-4">Recent Insights</p>
                    <div className="space-y-1">
                      {['Career Strategy', 'Focus Session', 'Study Roadmap'].map((chat, i) => (
                        <button key={i} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm text-left truncate group">
                          <History className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                          <span className="truncate">{chat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-zinc-800 space-y-2">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm font-medium">
                      <Settings className="w-5 h-5 text-zinc-500" />
                      Preferences
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-zinc-800 transition-all text-sm font-medium text-red-400 hover:text-red-300">
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.aside>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Navigation / Mobile Menu */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl lg:bg-transparent lg:border-none">
                  <div className="flex items-center gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="hidden lg:flex p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-zinc-500 shadow-sm"
                    >
                      {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </motion.button>
                    <div className="lg:hidden flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-black tracking-tighter text-indigo-600 dark:text-white">LOKEY</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">{session.user.email?.split('@')[0]}</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Premium Member</span>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm"
                    >
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                  </div>
                </header>

                <main className="flex-1 overflow-hidden">
                  <Routes>
                    <Route path="/" element={
                      <Chat 
                        session={session} 
                        trialEnd={trialEnd} 
                        isTrialActive={isTrialActive} 
                        onUpdateProfile={() => fetchUserRole(session.user.id)} 
                      />
                    } />
                    <Route path="/dashboard" element={
                      <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-5xl mx-auto">
                          <Dashboard 
                            user={session.user} 
                            trialEnd={trialEnd} 
                            isTrialActive={isTrialActive} 
                            plan={plan} 
                            onUpdateProfile={() => fetchUserRole(session.user.id)} 
                          />
                        </div>
                      </div>
                    } />
                    <Route path="/admin" element={
                      userRole === 'admin' && session.user.email === 'logeshm15112005@gmail.com' ? (
                        <AdminGate 
                          userId={session.user.id} 
                          email={session.user.email} 
                          onBack={() => window.history.back()} 
                        />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    } />
                  </Routes>
                </main>
              </div>
            </>
          )}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
