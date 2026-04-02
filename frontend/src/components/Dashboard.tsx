import React, { useEffect, useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

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

const Dashboard = ({ user, trialEnd, isTrialActive, plan, onUpdateProfile }: { user: any, trialEnd: string | null, isTrialActive: boolean, plan: string, onUpdateProfile: () => void }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [dailyPlan, setDailyPlan] = useState<PlanItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [addingGoal, setAddingGoal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileSummary, setFileSummary] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const calculateRemainingDays = () => {
    if (!trialEnd) return 30;
    const end = new Date(trialEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const remainingDays = calculateRemainingDays();
  const isTrialExpired = remainingDays <= 0;

  useEffect(() => {
    const fetchMemories = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('memory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setMemories(data);
      }
      setLoading(false);
    };

    const fetchPlan = async (isRefresh = false) => {
      if (!user) return;
      setPlanLoading(true);
      if (isRefresh) toast.info('Generating new plan...');
      try {
        const response = await fetch(getApiUrl('/api/plan'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        if (response.ok) {
          const data = await response.json();
          setDailyPlan(data.plan);
          if (isRefresh) toast.success('Plan updated!');
        } else {
          throw new Error('Failed to generate plan');
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
        toast.error('Could not generate daily plan');
      } finally {
        setPlanLoading(false);
      }
    };

    const fetchGoals = async () => {
      if (!user) return;
      setGoalsLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setGoals(data);
      }
      setGoalsLoading(false);
    };

    fetchMemories();
    fetchPlan();
    fetchGoals();
  }, [user]);

  const refreshPlan = () => {
    const fetchPlan = async () => {
      if (!user) return;
      setPlanLoading(true);
      toast.info('Generating new plan...');
      try {
        const response = await fetch(getApiUrl('/api/plan'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        if (response.ok) {
          const data = await response.json();
          setDailyPlan(data.plan);
          toast.success('Plan updated!');
        } else {
          throw new Error('Failed to generate plan');
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
        toast.error('Could not generate daily plan');
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlan();
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !user || addingGoal) return;

    setAddingGoal(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ user_id: user.id, title: newGoal, completed: false }])
        .select();

      if (error) throw error;
      if (data) {
        setGoals([...goals, data[0]]);
        setNewGoal('');
        toast.success('Goal added!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add goal');
    } finally {
      setAddingGoal(false);
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
      toast.success(completed ? 'Goal uncompleted' : 'Goal completed!');
    } catch (error: any) {
      toast.error('Failed to update goal');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    setUploading(true);
    setFileSummary(null);
    toast.info('Processing file with AI...');

    try {
      const response = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      setFileSummary(data.summary);
      toast.success('Analysis complete!');
    } catch (error: any) {
      toast.error(error.message);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const downloadSummaryPDF = async () => {
    if (!fileSummary) return;
    
    try {
      const response = await fetch(getApiUrl('/api/generate-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: fileSummary, 
          title: selectedFile?.name.split('.')[0] + ' Summary' 
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile?.name.split('.')[0]}_Summary.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercentage = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/30">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white"
            >
              Performance <span className="text-gradient">Hub</span>
            </motion.h1>
            <div className="flex items-center gap-3">
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                Personalized Growth Analytics & Strategy
              </p>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                isTrialExpired ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              )}>
                <Sparkles className="w-3 h-3" />
                {isTrialExpired ? "Trial Expired" : "Free Trial"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshPlan}
              disabled={planLoading}
              className="flex items-center gap-3 px-8 py-4 glass-card rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-lg group"
            >
              {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
              Optimize Strategy
            </motion.button>
          </div>
        </div>

        {/* Trial Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "glass-card p-6 rounded-3xl border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-6",
            isTrialExpired && "border-red-500/30 from-red-500/5 to-orange-500/5"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", isTrialExpired ? "bg-red-100 dark:bg-red-900/30" : "bg-indigo-100 dark:bg-indigo-900/30")}>
              {isTrialExpired ? <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /> : <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">{isTrialExpired ? "Trial Expired" : "Free Trial Status"}</h3>
              <p className="text-sm text-zinc-500">
                {isTrialExpired 
                  ? "Your 30-day free trial has ended. Premium features are coming soon!" 
                  : `You have ${remainingDays} days remaining in your free trial.`}
              </p>
            </div>
          </div>
          {!isTrialExpired && (
            <div className="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              {remainingDays} Days Left
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Active Goals', value: goals.filter(g => !g.completed).length, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100/50 dark:bg-indigo-900/20' },
            { label: 'Completed', value: goals.filter(g => g.completed).length, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100/50 dark:bg-purple-900/20' },
            { label: 'Total Insights', value: memories.length, icon: BrainCircuit, color: 'text-pink-600', bg: 'bg-pink-100/50 dark:bg-pink-900/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group cursor-default"
            >
              <div className={cn("p-5 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* File Intelligence Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
              <div className="w-2.5 h-10 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full" />
              File Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Card */}
            <div className="glass-card p-8 rounded-[2rem] space-y-6">
              <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl w-fit">
                <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Smart Upload</h3>
                <p className="text-sm text-zinc-500">Upload PDF or DOCX for instant AI analysis and summarization.</p>
              </div>
              
              <label className="block">
                <div className={cn(
                  "border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/50 transition-all group",
                  uploading && "opacity-50 pointer-events-none"
                )}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform">
                      {uploading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> : <FileText className="w-6 h-6 text-zinc-400" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      {uploading ? 'Processing...' : 'Choose File'}
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Summary Display */}
            <div className="lg:col-span-2 glass-card rounded-[2rem] overflow-hidden min-h-[300px] flex flex-col">
              <AnimatePresence mode="wait">
                {fileSummary ? (
                  <motion.div 
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">AI Analysis Result</span>
                      </div>
                      <button 
                        onClick={downloadSummaryPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        Export PDF
                      </button>
                    </div>
                    <div className="flex-1 prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                      <Markdown>{fileSummary}</Markdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center glass">
                      <BrainCircuit className="w-8 h-8 text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-400">No active analysis</p>
                      <p className="text-xs text-zinc-500">Upload a document to see the AI-generated summary here.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Daily Strategy Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
                <div className="w-2.5 h-10 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full" />
                Daily Strategy
              </h2>
            </div>
            
            <div className="glass-card rounded-[2rem] overflow-hidden">
              {planLoading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin relative z-10" />
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Synthesizing personalized plan...</p>
                </div>
              ) : dailyPlan.length > 0 ? (
                <div className="divide-y divide-zinc-100/50 dark:divide-zinc-800/50">
                  {dailyPlan.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-8 flex items-center gap-8 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all group"
                    >
                      <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 w-24 tracking-tighter tabular-nums">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{item.task}</p>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-3 py-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                          {item.type}
                        </span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 group-hover:bg-indigo-600 group-hover:scale-125 transition-all duration-300" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto glass">
                    <BookOpen className="w-10 h-10 text-zinc-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-zinc-500">No strategy generated for today.</p>
                    <button onClick={refreshPlan} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-500 transition-colors">Initialize Protocol</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Goals Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
                <div className="w-2.5 h-10 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                Active Goals
              </h2>
              <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                {progressPercentage}% Complete
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleAddGoal} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition-opacity" />
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Define your next milestone..."
                  className="relative w-full pl-8 pr-16 py-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-0 focus:border-indigo-500/50 transition-all shadow-lg"
                />
                <button
                  type="submit"
                  disabled={!newGoal.trim() || addingGoal}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {addingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {goalsLoading ? (
                <div className="glass-card p-24 rounded-[2rem] flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
              ) : goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal, i) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 5 }}
                      className={cn(
                        "glass-card p-6 rounded-[1.5rem] flex items-center gap-6 group transition-all cursor-default",
                        goal.completed && "opacity-60"
                      )}
                    >
                      <button
                        onClick={() => toggleGoal(goal.id, goal.completed)}
                        className={cn(
                          "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                          goal.completed 
                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" 
                            : "border-zinc-200 dark:border-zinc-700 hover:border-purple-500 hover:scale-110"
                        )}
                      >
                        {goal.completed && <Sparkles className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <p className={cn(
                          "text-base font-bold transition-all",
                          goal.completed ? "line-through text-zinc-500" : "text-zinc-800 dark:text-zinc-200"
                        )}>
                          {goal.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-24 rounded-[2rem] text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto glass">
                    <Target className="w-10 h-10 text-zinc-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500">Your journey starts with a single goal.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recent Interactions */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-4">
              <div className="w-2.5 h-10 bg-zinc-900 dark:bg-white rounded-full" />
              Recent AI Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full glass-card p-24 rounded-[2rem] flex justify-center">
                <Loader2 className="w-10 h-10 text-zinc-400 animate-spin" />
              </div>
            ) : memories.length > 0 ? (
              memories.map((memory, i) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-8 rounded-[2rem] space-y-5 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border",
                      memory.role === 'user' 
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700" 
                        : "bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50"
                    )}>
                      {memory.role}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      {new Date(memory.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                    {memory.content}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full glass-card p-24 rounded-[2rem] text-center">
                <p className="text-sm font-bold text-zinc-500">No recent interactions found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
