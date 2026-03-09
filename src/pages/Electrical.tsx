import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Menu, X, Sparkles, BookOpen, Sigma, Calculator, Cpu, FileText, Globe, AlertTriangle, Send } from 'lucide-react';
import { aiService } from '../services/aiService';
import AISelectionAnimation from '../components/ai/AISelectionAnimation';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface ElectricalTopic {
  id: string;
  title: string;
  overview: string;
  sections: Record<string, string>;
  customQA: { q: string; a: string }[];
}

const SECTIONS = [
  { id: 'theory', title: 'Theory & Explanation', icon: BookOpen },
  { id: 'formulas', title: 'Key Formulas & Equations', icon: Sigma },
  { id: 'example', title: 'Step-by-step Solved Example', icon: Calculator },
  { id: 'circuit', title: 'Circuit Diagram Description', icon: Cpu },
  { id: 'ioe', title: 'IOE Exam Questions', icon: FileText },
  { id: 'realworld', title: 'Real-world Applications', icon: Globe },
  { id: 'mistakes', title: 'Common Mistakes to Avoid', icon: AlertTriangle }
];

export default function Electrical() {
  const [topics, setTopics] = useState<ElectricalTopic[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [loadingQA, setLoadingQA] = useState(false);
  const [showSelectionAnim, setShowSelectionAnim] = useState(false);
  const [animModelId, setAnimModelId] = useState<string | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'notes' | 'questions'>('notes');
  const [customQ, setCustomQ] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('electrical_topics');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTopics(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse saved topics', e);
      }
    }
  }, []);

  const saveTopics = (newTopics: ElectricalTopic[]) => {
    setTopics(newTopics);
    localStorage.setItem('electrical_topics', JSON.stringify(newTopics));
  };

  // Key rotation logic
  const GEMINI_KEYS = [
    localStorage.getItem('Gemini_API_KEY') || '',
    // Add more fallback keys here if needed
  ].filter(Boolean);
  
  let currentKeyIndex = 0;
  const getNextKey = () => {
    if (GEMINI_KEYS.length === 0) return '';
    const key = GEMINI_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    return key;
  };

  const generateElectricalContent = async (prompt: string) => {
    // Trigger animation immediately
    setAnimModelId('searching');
    setShowSelectionAnim(true);

    const apiKey = getNextKey();
    const response = await fetch('/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': apiKey,
      },
      body: JSON.stringify({
        questionId: 'ee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        question: prompt,
        provider: 'Gemini',
        model: 'gemini-2.0-flash',
        topic: 'General Chat',
        forceRefresh: true
      })
    });

    if (!response.ok) {
      setShowSelectionAnim(false);
      throw new Error('Failed to generate content');
    }
    const data = await response.json();
    
    if (data.modelUsed && !data.cached) {
      setAnimModelId(data.modelUsed);
      // Keep animation visible for a bit to show the selected model
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSelectionAnim(false);
    } else {
      setShowSelectionAnim(false);
    }
    
    return data.solution;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingOverview(true);
    try {
      const prompt = `You are an expert IOE Nepal Electrical & Electronics professor. Provide a clear, concise definition and overview of "${searchQuery}". 
      
      Format the output using Markdown. 
      Use LaTeX for all mathematical equations and symbols ($ for inline, $$ for block).
      Use headings, bullet points, and bold text for clarity.`;
      
      const overview = await generateElectricalContent(prompt);
      
      const newTopic: ElectricalTopic = {
        id: Date.now().toString(),
        title: searchQuery,
        overview,
        sections: {},
        customQA: []
      };
      
      const newTopics = [newTopic, ...topics];
      saveTopics(newTopics);
      setActiveId(newTopic.id);
      setSearchQuery('');
      setActiveTab('notes');
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadSection = async (sectionId: string, sectionTitle: string) => {
    if (!activeId) return;
    
    setLoadingSection(sectionId);
    try {
      const topic = topics.find(t => t.id === activeId);
      if (!topic) return;

      const prompt = `You are an expert IOE Nepal Electrical & Electronics professor. Provide the "${sectionTitle}" for the topic "${topic.title}". 
      
      Format the output using Markdown. 
      Use LaTeX for all mathematical equations and symbols ($ for inline, $$ for block).
      Use headings, bullet points, and bold text for clarity.`;
      
      const content = await generateElectricalContent(prompt);
      
      const newTopics = topics.map(t => {
        if (t.id === activeId) {
          return {
            ...t,
            sections: { ...t.sections, [sectionId]: content }
          };
        }
        return t;
      });
      
      saveTopics(newTopics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSection(null);
    }
  };

  const askCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQ.trim() || !activeId) return;

    setLoadingQA(true);
    const questionToAsk = customQ;
    setCustomQ('');
    
    try {
      const topic = topics.find(t => t.id === activeId);
      if (!topic) return;

      const prompt = `You are an expert IOE Nepal Electrical & Electronics professor. Answer this student's question about "${topic.title}": "${questionToAsk}". 
      
      Format the output using Markdown. 
      Use LaTeX for all mathematical equations and symbols ($ for inline, $$ for block).
      Use headings, bullet points, and bold text for clarity.`;
      
      const answer = await generateElectricalContent(prompt);
      
      const newTopics = topics.map(t => {
        if (t.id === activeId) {
          return {
            ...t,
            customQA: [...t.customQA, { q: questionToAsk, a: answer }]
          };
        }
        return t;
      });
      
      saveTopics(newTopics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingQA(false);
    }
  };

  const activeTopic = topics.find(t => t.id === activeId);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-r border-[var(--border-primary)] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-[var(--border-primary)]">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 -ml-3 mb-4 rounded-lg text-[11px] font-medium uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <h1 className="font-serif text-xl text-[var(--text-primary)] mb-1">Electrical & Electronics</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">ENEX 101 · TU IOE</p>
        </div>
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-[var(--text-tertiary)] font-mono">Saved Topics</div>
          {topics.length === 0 && (
            <div className="px-4 py-4 text-xs text-[var(--text-tertiary)] italic">No topics saved yet.</div>
          )}
          {topics.map((topic) => (
            <button 
              key={topic.id}
              onClick={() => { setActiveId(topic.id); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-3 ${activeId === topic.id ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
            >
              <span className="truncate">{topic.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative transition-colors duration-300">
        {/* Topbar */}
        <header className="h-[60px] border-b border-[var(--border-primary)] flex items-center px-6 gap-4 bg-[var(--bg-primary)]/80 backdrop-blur-md z-10 transition-colors duration-300">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 text-[var(--text-secondary)]">
            <Menu size={20} />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Ask AI Topic Teacher (e.g. Thevenin's Theorem)..." 
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg pl-9 pr-10 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-[var(--text-tertiary)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loadingOverview}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
              <Sparkles size={14} className={loadingOverview ? "animate-pulse text-amber-500" : ""} />
            </div>
            {searchQuery && !loadingOverview && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] hidden sm:block">
            AI Topic Teacher
          </div>
        </header>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24">
          {loadingOverview && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <p className="text-[var(--text-secondary)] animate-pulse">Generating topic overview...</p>
            </div>
          )}

          {!loadingOverview && !activeTopic && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-tertiary)] mb-6 border border-[var(--border-primary)]">
                <Sparkles size={28} />
              </div>
              <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-2">AI Topic Teacher</h2>
              <p className="text-[var(--text-secondary)] max-w-md">
                Type any Electrical & Electronics topic in the search bar above to instantly generate a comprehensive study guide.
              </p>
            </div>
          )}

          {!loadingOverview && activeTopic && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 border-b border-[var(--border-primary)] pb-6">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">{activeTopic.title}</h1>
                
                <div className="flex gap-4 mb-2">
                  <button 
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'notes' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    Topic Notes
                  </button>
                  <button 
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'questions' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    Questions & Q&A
                  </button>
                </div>
              </div>

              {activeTab === 'notes' && (
                <div className="space-y-10">
                  {/* Overview */}
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: activeTopic.overview }} />
                  </div>

                  {/* Interactive Menu */}
                  <div>
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Interactive Learning Menu</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {SECTIONS.map(section => {
                        const isLoaded = !!activeTopic.sections[section.id];
                        const isLoading = loadingSection === section.id;
                        const Icon = section.icon;
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => !isLoaded && loadSection(section.id, section.title)}
                            disabled={isLoaded || isLoading}
                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                              isLoaded 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-[var(--text-primary)] cursor-default' 
                                : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-amber-500/30 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isLoaded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--bg-primary)] text-[var(--text-tertiary)]'}`}>
                              <Icon size={16} />
                            </div>
                            <span className="text-sm font-medium flex-1">{section.title}</span>
                            {isLoading && <Sparkles size={14} className="animate-pulse text-amber-500" />}
                            {isLoaded && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rendered Sections */}
                  <div className="space-y-12 pt-8">
                    {SECTIONS.map(section => {
                      if (!activeTopic.sections[section.id]) return null;
                      return (
                        <div key={section.id} className="border-t border-[var(--border-primary)] pt-8">
                          <div className="flex items-center gap-2 mb-6 text-amber-500">
                            <section.icon size={20} />
                            <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">{section.title}</h2>
                          </div>
                          <div className="prose dark:prose-invert max-w-none">
                            <MarkdownRenderer content={activeTopic.sections[section.id]} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-8">
                  {/* IOE Past Questions */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl text-[var(--text-primary)] flex items-center gap-2">
                        <FileText size={20} className="text-amber-500" />
                        IOE Past Paper Questions
                      </h3>
                      {!activeTopic.sections['ioe'] && (
                        <button 
                          onClick={() => loadSection('ioe', 'IOE Exam Questions')}
                          disabled={loadingSection === 'ioe'}
                          className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {loadingSection === 'ioe' ? <Sparkles size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                          Generate Questions
                        </button>
                      )}
                    </div>
                    
                    {activeTopic.sections['ioe'] ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <MarkdownRenderer content={activeTopic.sections['ioe']} />
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Click the button above to generate IOE past paper style questions for this topic.
                      </p>
                    )}
                  </div>

                  {/* Custom Q&A */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
                    <h3 className="font-serif text-xl text-[var(--text-primary)] mb-4">Ask a Question</h3>
                    <form onSubmit={askCustomQuestion} className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder={`Ask anything about ${activeTopic.title}...`}
                        className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        value={customQ}
                        onChange={(e) => setCustomQ(e.target.value)}
                        disabled={loadingQA}
                      />
                      <button 
                        type="submit"
                        disabled={loadingQA || !customQ.trim()}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingQA ? <Sparkles size={16} className="animate-pulse" /> : <Send size={16} />}
                        Ask
                      </button>
                    </form>
                  </div>

                  {/* Q&A History */}
                  {activeTopic.customQA.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">Q&A History</h3>
                      {activeTopic.customQA.map((qa, i) => (
                        <div key={i} className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-xs font-medium shrink-0">
                              You
                            </div>
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-[var(--text-primary)]">
                              {qa.q}
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                              <Sparkles size={14} />
                            </div>
                            <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl rounded-tl-none px-5 py-4 text-sm text-[var(--text-primary)] prose prose-slate dark:prose-invert max-w-none">
                              <MarkdownRenderer content={qa.a} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTopic.customQA.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-tertiary)] text-sm">
                      No questions asked yet. Type your question above!
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <AISelectionAnimation 
        modelId={animModelId} 
        isVisible={showSelectionAnim} 
        onComplete={() => setAnimModelId(null)} 
      />
    </div>
  );
}
