import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
}

export default function AIChatDrawer({ isOpen, onClose, subject }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: `Hi! I'm your AI tutor for ${subject}. Ask me anything about derivations, concepts, or problems!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.generateText(input, `You are an expert tutor in ${subject}. Be concise and helpful.`);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Tutor</h2>
                  <p className="text-xs text-indigo-400">{subject}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed relative group ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-100 rounded-tr-none border border-indigo-500/20' 
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-tl-none border border-[var(--border-primary)]'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute -right-10 top-2 p-1.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-3 rounded-2xl rounded-tl-none border border-[var(--border-primary)] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="relative flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
                  className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 placeholder-[var(--text-tertiary)] resize-none min-h-[44px] max-h-[120px]"
                  rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[44px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
