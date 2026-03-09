import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROVIDERS } from './AIModelSelector';
import { Sparkles } from 'lucide-react';

interface AISelectionAnimationProps {
  modelId: string | null;
  isVisible: boolean;
  onComplete?: () => void;
}

export default function AISelectionAnimation({ modelId, isVisible, onComplete }: AISelectionAnimationProps) {
  // Find model and provider details
  let selectedModel = null;
  let selectedProvider = null;
  const isSearching = !modelId || modelId === 'searching';

  if (!isSearching) {
    for (const provider of PROVIDERS) {
      const model = provider.models.find(m => m.id === modelId);
      if (model) {
        selectedModel = model;
        selectedProvider = provider;
        break;
      }
    }

    // Fallback if model not found in our list
    if (!selectedModel || !selectedProvider) {
      selectedModel = { name: modelId as string, desc: 'Advanced AI Model', cat: 'AI' };
      selectedProvider = { name: 'AI Provider', icon: '🤖', color: '#10b981' };
    }
  } else {
    selectedModel = { name: 'Analyzing...', desc: 'Determining problem complexity', cat: 'AI' };
    selectedProvider = { name: 'Smart Router', icon: '🧠', color: '#6366f1' };
  }

  const themeColor = selectedProvider.color;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsating Rings */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.5], 
                  opacity: [0.5, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.6,
                  ease: "easeOut" 
                }}
                className="absolute w-64 h-64 rounded-full border-2"
                style={{ borderColor: themeColor }}
              />
            ))}

            {/* Frequency Bars (Circular) */}
            <div className="absolute w-80 h-80 flex items-center justify-center">
              {[...Array(60)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 rounded-full"
                  style={{ 
                    height: '20px',
                    backgroundColor: themeColor,
                    transform: `rotate(${i * 6}deg) translateY(-140px)`,
                    opacity: 0.6
                  }}
                  animate={{ 
                    height: [20, Math.random() * 40 + 20, 20],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 0.5 + Math.random(), 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Central Content */}
            <motion.div
              key={isSearching ? 'searching' : modelId}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative w-48 h-48 rounded-full bg-[var(--bg-primary)] border-4 flex flex-col items-center justify-center text-center p-4 shadow-2xl z-10"
              style={{ borderColor: themeColor, boxShadow: `0 0 40px ${themeColor}44` }}
            >
              <div className="text-4xl mb-2">
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    {selectedProvider.icon}
                  </motion.div>
                ) : (
                  selectedProvider.icon
                )}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-1">
                {selectedProvider.name}
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)] leading-tight mb-1">
                {selectedModel.name}
              </div>
              <div className="text-[8px] text-[var(--text-secondary)] max-w-[120px] line-clamp-2">
                {selectedModel.desc}
              </div>
              
              {/* Sparkle effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6" style={{ color: themeColor }} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
