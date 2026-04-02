import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Sparkles, 
  Target, 
  BrainCircuit, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  Zap, 
  MessageSquare, 
  BarChart3 
} from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-500 text-sm font-bold mb-8 shadow-sm"
          >
            <Sparkles size={16} />
            <span>AI-Powered Personal Development</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white mb-8 tracking-tight leading-[0.9]"
          >
            GROW SMARTER<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">WITH LOKEY-AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The ultimate AI mentor for students. Master your studies, manage your stress, and build a roadmap to your dream career.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              Login to Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-4">POWERFUL FEATURES</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Everything you need to succeed in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BrainCircuit,
                title: "Behavior Detection",
                desc: "Our AI understands your mood and behavior to provide personalized guidance.",
                color: "bg-blue-500"
              },
              {
                icon: Target,
                title: "Daily Planning",
                desc: "Get a custom-tailored daily schedule based on your goals and progress.",
                color: "bg-orange-500"
              },
              {
                icon: MessageSquare,
                title: "Smart Memory",
                desc: "LOKEY-AI remembers your past conversations to provide consistent mentorship.",
                color: "bg-green-500"
              },
              {
                icon: Zap,
                title: "Voice Input",
                desc: "Talk naturally to your mentor using built-in high-accuracy voice recognition.",
                color: "bg-yellow-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is encrypted and protected. Your growth is your own business.",
                color: "bg-purple-500"
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                desc: "Visualize your academic and personal growth with detailed analytics.",
                color: "bg-red-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group shadow-sm"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", feature.color)}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-orange-600/40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">READY TO START YOUR JOURNEY?</h2>
            <p className="text-orange-100 text-xl mb-12 max-w-2xl mx-auto">
              Join thousands of students who are already using LOKEY-AI to transform their lives.
            </p>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-orange-600 rounded-2xl font-black text-xl hover:bg-orange-50 transition-all shadow-xl"
            >
              Join LOKEY-AI Now
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="text-xl font-bold dark:text-white tracking-tighter">LOKEY-AI</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link to="/about" className="hover:text-orange-600">About</Link>
            <Link to="/privacy" className="hover:text-orange-600">Privacy</Link>
            <Link to="/terms" className="hover:text-orange-600">Terms</Link>
            <Link to="/contact" className="hover:text-orange-600">Contact</Link>
          </div>
          
          <p className="text-sm text-zinc-400">© 2026 LOKEY-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
