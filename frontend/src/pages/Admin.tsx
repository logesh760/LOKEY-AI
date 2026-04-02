import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getApiUrl } from '../lib/api';
import { 
  Shield, 
  Trash2, 
  MessageSquare, 
  User, 
  Clock, 
  Loader2, 
  Search, 
  Filter, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.role === 'admin') {
        setIsAdmin(true);
        fetchChats();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memory')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Fetch chats error:', error);
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

  const filteredChats = chats.filter(chat => {
    const matchesSearch = 
      chat.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      chat.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || chat.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-6">
          <Shield className="text-red-600" size={40} />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight uppercase">ACCESS DENIED</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md font-medium">
          You do not have administrative privileges to access this area. If you believe this is an error, please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="text-white dark:text-zinc-900" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">ADMIN CENTER</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">System Management & Oversight</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <span className="text-sm font-black text-orange-600 dark:text-orange-500 uppercase tracking-wider">
                {filteredChats.length} MESSAGES
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages or users..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors" size={20} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none transition-all"
            >
              <option value="all">ALL ROLES</option>
              <option value="user">USER MESSAGES</option>
              <option value="assistant">AI RESPONSES</option>
            </select>
          </div>
        </div>

        {/* Chat Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">User</th>
                  <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
                  <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Content</th>
                  <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Timestamp</th>
                  <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filteredChats.length > 0 ? filteredChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                          <User size={18} className="text-zinc-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-white">{chat.profiles?.email.split('@')[0]}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{chat.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        chat.role === 'user' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                      )}>
                        {chat.role}
                      </span>
                    </td>
                    <td className="p-6 max-w-md">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 font-medium">{chat.content}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Clock size={14} />
                        <span className="text-xs font-bold">
                          {new Date(chat.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleDelete(chat.id)}
                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center">
                          <MessageSquare className="text-zinc-300" size={32} />
                        </div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No chat records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
