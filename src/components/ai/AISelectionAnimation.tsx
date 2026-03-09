import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROVIDERS } from './AIModelSelector';
import { Sparkles, Brain, Zap, ShieldCheck, Cpu, Globe } from 'lucide-react';

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
    // Try to find exact match first
    for (const provider of PROVIDERS) {
      const model = provider.models.find(m => m.id === modelId);
      if (model) {
        selectedModel = model;
        selectedProvider = provider;
        break;
      }
    }

    // If no exact match, try to extract model ID from descriptive string like "Provider (model-id) [Complexity: X/10]"
    if (!selectedModel && modelId) {
      const match = modelId.match(/\(([^)]+)\)/);
      const extractedId = match ? match[1] : null;
      
      if (extractedId) {
        for (const provider of PROVIDERS) {
          const model = provider.models.find(m => m.id === extractedId);
          if (model) {
            selectedModel = model;
            selectedProvider = provider;
            break;
          }
        }
      }
    }

    // Fallback if model still not found in our list
    if (!selectedModel || !selectedProvider) {
      // Try to extract provider name from the start of the string
      const providerNameMatch = modelId?.match(/^([^(]+)/);
      const providerName = providerNameMatch ? providerNameMatch[1].trim() : 'AI Provider';
      
      selectedModel = { name: modelId as string, desc: 'Advanced AI Model', cat: 'AI' };
      selectedProvider = { name: providerName, icon: <Cpu className="w-6 h-6" />, color: '#10b981' };
    }
  } else {
    selectedModel = { name: 'Analyzing Complexity', desc: 'Routing to optimal compute unit', cat: 'AI' };
    selectedProvider = { name: 'Smart Router', icon: <Brain className="w-6 h-6" />, color: '#6366f1' };
  }

  const themeColor = selectedProvider.color;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            {/* Background Glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
              style={{ background: `radial-gradient(circle, ${themeColor}33 0%, transparent 70%)` }}
            />

            {/* Orbiting Particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                className="absolute"
                style={{ width: 300 + i * 60, height: 300 + i * 60 }}
              >
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="w-2 h-2 rounded-full absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
                />
              </motion.div>
            ))}

            {/* Rotating Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[340px] h-[340px] border border-dashed border-white/10 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[300px] h-[300px] border border-white/5 rounded-full"
            />

            {/* Scanning Lines (Circular) */}
            <div className="absolute w-80 h-80 flex items-center justify-center">
              {[...Array(72)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[1px] rounded-full origin-bottom"
                  style={{ 
                    height: '15px',
                    backgroundColor: themeColor,
                    transform: `rotate(${i * 5}deg) translateY(-150px)`,
                    opacity: 0.2
                  }}
                  animate={isSearching ? { 
                    height: [15, 30, 15],
                    opacity: [0.2, 0.6, 0.2],
                    backgroundColor: [themeColor, '#fff', themeColor]
                  } : {
                    height: 15,
                    opacity: 0.3
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    delay: i * 0.02,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Central Orb */}
            <motion.div
              key={isSearching ? 'searching' : modelId}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center text-center p-8 z-10 overflow-hidden"
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                border: `1px solid ${themeColor}33`,
                boxShadow: `0 0 80px ${themeColor}33, inset 0 0 30px ${themeColor}11`
              }}
            >
              {/* Particle Burst on Selection */}
              {!isSearching && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: themeColor }}
                />
              )}

              {/* Inner Glow */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 70%)` }}
              />

              <motion.div 
                animate={isSearching ? {
                  y: [0, -8, 0],
                  scale: [1, 1.15, 1],
                  filter: [`drop-shadow(0 0 5px ${themeColor})`, `drop-shadow(0 0 20px ${themeColor})`, `drop-shadow(0 0 5px ${themeColor})`]
                } : {
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4 relative"
                style={{ color: themeColor }}
              >
                <div className="relative z-10">
                  {typeof selectedProvider.icon === 'string' ? (
                    <span className="text-5xl">{selectedProvider.icon}</span>
                  ) : (
                    <div className="scale-150">{selectedProvider.icon}</div>
                  )}
                </div>
                <motion.div 
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ backgroundColor: themeColor }}
                />
              </motion.div>

              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-mono mb-2"
                >
                  {selectedProvider.name}
                </motion.div>
                
                <motion.h3 
                  layoutId="model-name"
                  className="text-xl font-bold text-white tracking-tight leading-tight mb-2"
                >
                  {selectedModel.name}
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[11px] text-white/50 max-w-[180px] mx-auto leading-relaxed font-medium"
                >
                  {selectedModel.desc}
                </motion.p>
              </div>

              {/* Scanning Beam (Searching Only) */}
              {isSearching && (
                <motion.div 
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm z-20"
                />
              )}

              {/* Progress Bar (Bottom) */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: isSearching ? 10 : 2, ease: "linear" }}
                  className="h-full"
                  style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                />
              </div>
            </motion.div>

            {/* Floating Status Labels */}
            <AnimatePresence>
              {isSearching && (
                <>
                  <StatusLabel 
                    text="Latency: 42ms" 
                    icon={<Zap size={10} />} 
                    delay={0.1} 
                    x={-180} 
                    y={-80} 
                    color={themeColor}
                  />
                  <StatusLabel 
                    text="Security: Verified" 
                    icon={<ShieldCheck size={10} />} 
                    delay={0.3} 
                    x={180} 
                    y={-40} 
                    color={themeColor}
                  />
                  <StatusLabel 
                    text="Region: Global" 
                    icon={<Globe size={10} />} 
                    delay={0.5} 
                    x={-160} 
                    y={100} 
                    color={themeColor}
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusLabel({ text, icon, delay, x, y, color }: { text: string, icon: React.ReactNode, delay: number, x: number, y: number, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md"
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-[9px] font-mono text-white/70 uppercase tracking-wider whitespace-nowrap">{text}</span>
    </motion.div>
  );
}

