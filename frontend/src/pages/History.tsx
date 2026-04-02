import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  History as HistoryIcon, 
  Trash2, 
  MessageSquare, 
  Clock, 
  Loader2, 
  Search, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memory')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Fetch history error:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('memory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setChats(chats.filter(c => c.id !== id));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-600/20">
              <HistoryIcon className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">CHAT HISTORY</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">Your past conversations with LOKEY-AI</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your history..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
          />
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredChats.length > 0 ? filteredChats.map((chat) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={chat.id} 
              className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-orange-500 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    chat.role === 'user' ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  )}>
                    {chat.role === 'user' ? <MessageSquare size={18} /> : <HistoryIcon size={18} />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        chat.role === 'user' ? "text-orange-600" : "text-zinc-500"
                      )}>
                        {chat.role}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(chat.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                      {chat.content}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(chat.id)}
                  className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center">
                  <MessageSquare className="text-zinc-300" size={32} />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No records found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
