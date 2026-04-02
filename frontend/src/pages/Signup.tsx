import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Account created! Please check your email for confirmation.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 shadow-2xl shadow-orange-600/10 border border-zinc-100 dark:border-zinc-800 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-600/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">JOIN LOKEY-AI</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Start your personal development journey today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none font-medium"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Min. 8 characters with symbols</p>
          </div>

          <div className="space-y-3 py-2">
            {[
              "Personal AI Mentor Access",
              "Daily Growth Planning",
              "Behavior & Mood Analysis"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <CheckCircle2 size={14} className="text-orange-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white rounded-2xl py-4 font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                Create Free Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-black hover:text-orange-700 underline decoration-2 underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>

      <div className="mt-8 flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest relative z-10">
        <Sparkles size={14} />
        <span>Join the LOKEY-AI Community</span>
      </div>
    </div>
  );
};

export default Signup;
