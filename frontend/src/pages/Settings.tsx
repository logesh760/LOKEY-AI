import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Sparkles,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SettingsItem {
  label: string;
  value?: any;
  type: 'text' | 'toggle' | 'select' | 'button';
  onChange?: () => void;
  icon?: any;
}

interface SettingsSection {
  title: string;
  icon: any;
  items: SettingsItem[];
}

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const sections: SettingsSection[] = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { label: 'Email', value: user?.email, type: 'text' },
        { label: 'Username', value: user?.email?.split('@')[0], type: 'text' },
      ]
    },
    {
      title: 'Preferences',
      icon: SettingsIcon,
      items: [
        { 
          label: 'Dark Mode', 
          value: darkMode, 
          type: 'toggle', 
          onChange: () => setDarkMode(!darkMode),
          icon: darkMode ? Moon : Sun
        },
        { 
          label: 'Notifications', 
          value: notifications, 
          type: 'toggle', 
          onChange: () => setNotifications(!notifications),
          icon: Bell
        },
        { label: 'Language', value: 'English (US)', type: 'select', icon: Globe },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Change Password', type: 'button', icon: Lock },
        { label: 'Two-Factor Auth', type: 'button', icon: Shield },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <SettingsIcon className="text-white dark:text-zinc-900" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">SETTINGS</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">Manage your account & preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={section.title} 
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                  <section.icon className="text-zinc-500" size={20} />
                </div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-orange-500 transition-all">
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon size={18} className="text-zinc-400 group-hover:text-orange-600 transition-colors" />}
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <button 
                        onClick={item.onChange}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          item.value ? "bg-orange-600" : "bg-zinc-300 dark:bg-zinc-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          item.value ? "left-7" : "left-1"
                        )} />
                      </button>
                    ) : item.type === 'button' ? (
                      <ChevronRight size={18} className="text-zinc-400" />
                    ) : (
                      <span className="text-sm font-black text-zinc-900 dark:text-white">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-red-900 dark:text-red-400 uppercase tracking-tight">DANGER ZONE</h2>
                <p className="text-sm text-red-700 dark:text-red-500/70 font-medium">Irreversible actions for your account</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                <LogOut size={20} />
                SIGN OUT
              </button>
            </div>
          </motion.div>
        </div>

        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Sparkles size={12} />
            <span>LOKEY-AI VERSION 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
