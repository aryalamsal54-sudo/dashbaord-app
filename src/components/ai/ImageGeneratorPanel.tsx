import React, { useState, useRef, useEffect } from 'react';
import { Image, Download, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/aiService';

interface ImageGeneratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
}

export default function ImageGeneratorPanel({ isOpen, onClose, subject }: ImageGeneratorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Diagram');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await aiService.generateImage(prompt, style);
      setImageUrl(url);
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
            className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card-bg)] border border-[var(--border-primary)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Image className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI Visualizer</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Generate concepts for {subject}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                      Concept Prompt
                    </label>
                    <textarea
                      ref={inputRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="e.g. A detailed circuit diagram of a full-wave rectifier... (Cmd/Ctrl + Enter to generate)"
                      className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                      Visual Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Diagram', 'Illustration', 'Realistic', 'Sketch'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            style === s
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        Generate Visualization
                      </>
                    )}
                  </button>
                </div>

                {/* Preview */}
                <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] flex items-center justify-center relative group overflow-hidden min-h-[300px]">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Generated"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <a
                          href={imageUrl}
                          download={`ai-visual-${Date.now()}.png`}
                          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-[var(--text-tertiary)]" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Your generated visualization will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
