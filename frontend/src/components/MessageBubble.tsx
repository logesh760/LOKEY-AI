import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 p-6 transition-all",
        isUser ? "bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800" : "bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800"
      )}
    >
      <div className="max-w-4xl mx-auto flex w-full gap-6">
        {/* Avatar */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          isUser ? "bg-orange-600 text-white" : "bg-zinc-800 dark:bg-zinc-700 text-white"
        )}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isUser ? 'You' : 'LOKEY-AI'}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:text-orange-500 dark:prose-code:text-orange-400">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {!isUser && (
            <div className="flex items-center gap-4 pt-2">
              <button className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all">
                <Copy size={16} />
              </button>
              <button className="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all">
                <ThumbsUp size={16} />
              </button>
              <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                <ThumbsDown size={16} />
              </button>
              <button className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                <Share2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
