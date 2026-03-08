import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Eye, EyeOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AI_MODELS, IMAGE_MODELS } from '../../services/aiService';

export default function AISettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [selectedImageModel, setSelectedImageModel] = useState(IMAGE_MODELS[0]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [enableImageGen, setEnableImageGen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedModel = localStorage.getItem('selectedAIModel');
    if (storedModel) setSelectedModel(storedModel);

    const storedImageModel = localStorage.getItem('selectedImageModel');
    if (storedImageModel) setSelectedImageModel(storedImageModel);

    const keys: Record<string, string> = {};
    AI_MODELS.forEach(m => {
      const key = localStorage.getItem(`${m.provider}_API_KEY`);
      if (key) keys[m.provider] = key;
    });
    setApiKeys(keys);

    const storedAuto = localStorage.getItem('aiAutoSuggest');
    if (storedAuto) setAutoSuggest(storedAuto === 'true');

    const storedImg = localStorage.getItem('aiEnableImageGen');
    if (storedImg) setEnableImageGen(storedImg === 'true');
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('selectedAIModel', selectedModel);
    localStorage.setItem('selectedImageModel', selectedImageModel);
    localStorage.setItem('aiAutoSuggest', String(autoSuggest));
    localStorage.setItem('aiEnableImageGen', String(enableImageGen));

    Object.entries(apiKeys).forEach(([provider, key]) => {
      if (key) localStorage.setItem(`${provider}_API_KEY`, key as string);
      else localStorage.removeItem(`${provider}_API_KEY`);
    });

    window.dispatchEvent(new Event('ai-settings-changed'));
    
    setTimeout(() => {
      setIsSaving(false);
      setIsOpen(false);
    }, 600);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <Settings className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-primary)] shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">AI Settings</h2>
                  <button onClick={() => setIsOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Model Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Global AI Model</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          selectedModel === model.id
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-[var(--text-primary)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                        }`}
                      >
                        <span className="text-sm font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Model Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Image Generation Model</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {IMAGE_MODELS.map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedImageModel(model)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          selectedImageModel === model
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-[var(--text-primary)]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                        }`}
                      >
                        <span className="text-sm font-medium">{model}</span>
                        {selectedImageModel === model && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Keys */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">API Keys (Optional)</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Enter your own keys to bypass rate limits. Keys are stored locally in your browser.
                  </p>
                  {['Gemini', 'OpenAI', 'Anthropic', 'Mistral', 'Meta'].map((provider) => (
                    <div key={provider} className="space-y-1">
                      <label className="text-xs text-[var(--text-tertiary)]">{provider} API Key</label>
                      <div className="relative">
                        <input
                          type={showKeys[provider] ? 'text' : 'password'}
                          value={apiKeys[provider] || ''}
                          onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                          placeholder={`sk-...`}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 placeholder-[var(--text-tertiary)]"
                        />
                        <button
                          onClick={() => toggleKeyVisibility(provider)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Show AI suggestions automatically</span>
                    <button
                      onClick={() => setAutoSuggest(!autoSuggest)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${
                        autoSuggest ? 'bg-indigo-500' : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-[var(--bg-primary)] rounded-full transition-transform ${
                        autoSuggest ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Enable image generation</span>
                    <button
                      onClick={() => setEnableImageGen(!enableImageGen)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${
                        enableImageGen ? 'bg-indigo-500' : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-[var(--bg-primary)] rounded-full transition-transform ${
                        enableImageGen ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-colors mt-8 ${
                    isSaving 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
