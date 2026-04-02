import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  History, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Shield, 
  BrainCircuit 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewChat?: () => void;
  onClearHistory?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onNewChat, onClearHistory }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 h-16">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="text-xl font-bold dark:text-white">LOKEY-AI</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-2 bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20",
            !isOpen && "justify-center"
          )}
        >
          <Plus size={20} />
          {isOpen && <span className="font-medium">New Chat</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all group",
              location.pathname === item.path 
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              location.pathname === item.path ? "text-orange-600 dark:text-orange-500" : "group-hover:text-orange-600 dark:group-hover:text-orange-500"
            )} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={onClearHistory}
          className={cn(
            "w-full flex items-center gap-3 p-3 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-500 rounded-xl transition-all",
            !isOpen && "justify-center"
          )}
        >
          <Trash2 size={20} />
          {isOpen && <span className="font-medium">Clear History</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
