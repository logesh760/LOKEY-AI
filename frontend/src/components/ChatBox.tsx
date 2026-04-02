import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Plus, Trash2, Mic, MicOff, Volume2, FileText, Shield, BrainCircuit, Download, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../lib/api';
import { supabase } from '../lib/supabase';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';
import { detectBehavior, detectLanguage } from '../lib/aiUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('memory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at)
        })));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load chat history');
    }
  };

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setTypingText('');

    try {
      // 1. Detect behavior and language
      const behavior = detectBehavior(messageText);
      const language = detectLanguage(messageText);

      // 2. Construct context from last 15 messages
      const context = messages.slice(-15).map(m => `${m.role}: ${m.content}`).join("\n");

      // 3. Call Gemini directly from frontend
      const aiResponse = await geminiService.generateChatResponse(messageText, context, behavior, language);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 4. Save to Supabase (via backend or directly)
      // Let's keep a backend route for saving memory to keep it simple
      await fetch(getApiUrl('/api/chat/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userMessage: messageText,
          aiMessage: aiResponse
        }),
      });

      if (behavior !== 'neutral') {
        toast.info(`Behavior detected: ${behavior}`, {
          description: `LOKEY-AI is responding to your ${behavior} state.`
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error('Failed to get response from LOKEY-AI');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    
    try {
      const { error } = await supabase
        .from('memory')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      setMessages([]);
      toast.success('Conversation history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100">LOKEY-AI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-zinc-500 font-medium">Online & Ready</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleClearHistory}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Clear history"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-3xl flex items-center justify-center mb-4">
              <Sparkles className="text-orange-600 dark:text-orange-500" size={40} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Welcome to LOKEY-AI</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Your personal development mentor. How can I help you grow today?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                "How can I stop procrastinating?",
                "Create a study plan for me",
                "I'm feeling overwhelmed",
                "Explain quantum physics simply"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, suggestion)}
                  className="p-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-500 dark:hover:border-orange-500 hover:bg-white dark:hover:bg-zinc-800 transition-all group"
                >
                  {suggestion}
                  <Plus size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((m) => (
              <MessageBubble 
                key={m.id} 
                role={m.role} 
                content={m.content} 
                timestamp={m.timestamp} 
              />
            ))}
            {isTyping && (
              <div className="flex w-full gap-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto flex w-full gap-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 dark:bg-zinc-700 text-white flex items-center justify-center shrink-0">
                    <Bot size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 transition-all shadow-sm"
          >
            <VoiceInput onTranscript={(text) => setInput(text)} disabled={isLoading} />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message LOKEY-AI..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 py-3 px-2"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-3 rounded-xl transition-all shadow-lg",
                input.trim() && !isLoading
                  ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
          <p className="text-[10px] text-center text-zinc-400 mt-3 font-medium uppercase tracking-wider">
            LOKEY-AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
