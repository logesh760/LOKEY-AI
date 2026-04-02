import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getApiUrl } from '../lib/api';
import { 
  User, 
  Clock, 
  Calendar, 
  Target, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  BrainCircuit, 
  Loader2, 
  RefreshCw,
  Upload,
  FileText,
  Download,
  File,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';

interface MemoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface PlanItem {
  time: string;
  task: string;
  type: string;
}

interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [dailyPlan, setDailyPlan] = useState<PlanItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileSummary, setFileSummary] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMemories(),
        fetchPlan(),
        fetchGoals()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setMemories(data);
    }
  };

  const fetchPlan = async (forceRefresh = false) => {
    setPlanLoading(true);
    try {
      // 1. Fetch memories and goals from Supabase
      const [memoryRes, goalRes] = await Promise.all([
        supabase.from('memory').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('goals').select('*').eq('user_id', user?.id).eq('completed', false)
      ]);

      if (memoryRes.error) throw memoryRes.error;
      if (goalRes.error) throw goalRes.error;

      // 2. Call Gemini directly from frontend
      const planData = await geminiService.generateDailyPlan(memoryRes.data || [], goalRes.data || []);
      setDailyPlan(planData.plan);
      
      if (forceRefresh) toast.success('Daily plan updated!');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error('Failed to generate AI plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setGoals(data);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ user_id: user.id, title: newGoal }])
        .select();

      if (error) throw error;
      if (data) setGoals([...goals, data[0]]);
      setNewGoal('');
      toast.success('Goal added!');
    } catch (error) {
      toast.error('Failed to add goal');
    }
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !completed } : g));
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    setIsUploading(true);
    setFileSummary(null);
    toast.info('Uploading and analyzing file...');

    try {
      // 1. Upload to backend to extract text
      const response = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // 2. Summarize text on the frontend
      const summary = await geminiService.summarizeText(data.fullText);
      setFileSummary(summary);
      
      toast.success('File analyzed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">DASHBOARD</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-2 shadow-sm">
              <Calendar size={18} className="text-orange-600" />
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Plan & Goals */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Plan */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                    <Target className="text-orange-600 dark:text-orange-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white">DAILY AI PLAN</h2>
                </div>
                <button 
                  onClick={() => fetchPlan(true)}
                  disabled={planLoading}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 disabled:opacity-50"
                >
                  <RefreshCw size={20} className={planLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {planLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-orange-600" size={32} />
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Generating your custom plan...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyPlan.length > 0 ? dailyPlan.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-orange-500 transition-all">
                      <div className="w-20 text-sm font-black text-orange-600 dark:text-orange-500">{item.time}</div>
                      <div className="flex-1 font-bold text-zinc-800 dark:text-zinc-200">{item.task}</div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        item.type === 'academic' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                        item.type === 'personal' ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                        item.type === 'professional' ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" :
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {item.type}
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center">
                      <p className="text-zinc-500">No plan generated yet. Start chatting to build your profile!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* File Analysis */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                  <FileText className="text-blue-600 dark:text-blue-500" size={24} />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">FILE ANALYSIS</h2>
              </div>

              <div className="space-y-6">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-all bg-zinc-50 dark:bg-zinc-800/30 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
                    ) : (
                      <Upload className="text-zinc-400 group-hover:text-orange-600 mb-2 transition-colors" size={32} />
                    )}
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      {isUploading ? "ANALYZING..." : "UPLOAD PDF OR DOCX"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">Max size 10MB</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.docx" />
                </label>

                <AnimatePresence>
                  {fileSummary && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-800/50"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-orange-600" size={20} />
                        <h3 className="font-black text-orange-900 dark:text-orange-400 uppercase tracking-wider text-sm">AI Summary</h3>
                      </div>
                      <div className="prose prose-sm prose-orange dark:prose-invert max-w-none">
                        <ReactMarkdown>{fileSummary}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Goals & Memory */}
          <div className="space-y-8">
            {/* Goals */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                  <BrainCircuit className="text-green-600 dark:text-green-500" size={24} />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">GOALS</h2>
              </div>

              <form onSubmit={handleAddGoal} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a new goal..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 pl-4 pr-12 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <div 
                    key={goal.id} 
                    onClick={() => toggleGoal(goal.id, goal.completed)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                      goal.completed 
                        ? "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800 opacity-60" 
                        : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:border-green-500"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      goal.completed ? "bg-green-500 border-green-500 text-white" : "border-zinc-300 dark:border-zinc-600"
                    )}>
                      {goal.completed && <CheckCircle2 size={14} />}
                    </div>
                    <span className={cn("font-bold text-sm", goal.completed ? "line-through text-zinc-400" : "text-zinc-700 dark:text-zinc-300")}>
                      {goal.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Memory */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                  <Clock className="text-purple-600 dark:text-purple-500" size={24} />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">MEMORY</h2>
              </div>

              <div className="space-y-4">
                {memories.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        m.role === 'user' ? "text-orange-600" : "text-purple-600"
                      )}>
                        {m.role}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 font-medium bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
