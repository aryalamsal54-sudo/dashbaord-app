import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Menu, X, Sparkles, AlertTriangle } from 'lucide-react';
import { Question } from '../types';
import AISelectionAnimation from '../components/ai/AISelectionAnimation';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface MathTopic {
  id: string;
  title: string;
  questions: Question[];
}

export default function Math() {
  const [topics, setTopics] = useState<MathTopic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<{q: Question, topicId: string, idx: number} | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [showSelectionAnim, setShowSelectionAnim] = useState(false);
  const [animModelId, setAnimModelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/math/topics')
      .then(res => res.json())
      .then(data => setTopics(data));
  }, []);

  useEffect(() => {
    if (audioBase64) {
      if (audioRef.current) {
        audioRef.current.src = `data:audio/mp3;base64,${audioBase64}`;
      }
    }
  }, [audioBase64]);

  const filteredTopics = topics.map(topic => ({
    ...topic,
    questions: topic.questions.filter(d => 
      d.t.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(t => activeTopicId === 'all' || t.id === activeTopicId)
     .filter(t => t.questions.length > 0);

  const solveWithAI = async (forceRefresh = false) => {
    if (!selectedQuestion) return;
    
    // Trigger animation immediately
    setAnimModelId('searching');
    setShowSelectionAnim(true);
    setLoading(true);
    setSolution(null);
    setExplanation(null);
    setAudioBase64(null);
    setError(null);

    try {
      const { aiService } = await import('../services/aiService');
      const apiKeys = aiService.getAllApiKeys();

      const res = await fetch('/api/math/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: `${selectedQuestion.topicId}-math-${selectedQuestion.idx}`,
          question: selectedQuestion.q.t,
          topic: selectedQuestion.topicId,
          forceRefresh,
          apiKeys
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to solve problem. Please check your API keys.');
      }

      const data = await res.json();
      
      if (data.modelUsed && !data.cached) {
        setAnimModelId(data.modelUsed);
        // Keep animation visible for a bit to show the selected model
        setTimeout(() => {
          setShowSelectionAnim(false);
          setSolution(data.solution);
          setExplanation(data.explanation);
          setAudioBase64(data.audioBase64);
          setModelUsed(data.modelUsed);
        }, 2000);
      } else {
        setShowSelectionAnim(false);
        setSolution(data.solution);
        setExplanation(data.explanation);
        setAudioBase64(data.audioBase64);
        setModelUsed(data.modelUsed);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setShowSelectionAnim(false);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="font-serif text-xl text-[var(--text-primary)] mb-1">Math Bank</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">ENSH 101 · TU IOE</p>
        </div>
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-[var(--text-tertiary)] font-mono">Chapters</div>
          <button 
            onClick={() => setActiveTopicId('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-3 ${activeTopicId === 'all' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
          >
            <span className="font-serif opacity-40 w-4">—</span> All Chapters
          </button>
          {topics.map((topic, i) => (
            <button 
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-3 ${activeTopicId === topic.id ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
            >
              <span className="font-serif opacity-40 w-4">{String(i + 1).padStart(2, '0')}</span>
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
          
          <div className="flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Search problems..." 
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg pl-9 pr-10 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-[var(--text-tertiary)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] hidden sm:block">
            ENSH 101 · Engineering Mathematics I
          </div>
        </header>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24">
          {filteredTopics.map((topic, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={topic.id} 
              className="mb-12"
            >
              <div className="flex items-baseline gap-4 border-b border-[var(--border-primary)] pb-4 mb-6">
                <span className="font-serif text-3xl text-[var(--text-tertiary)]">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">{topic.title}</h2>
                <span className="ml-auto text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded-full border border-[var(--border-primary)]">
                  {topic.questions.length} problems
                </span>
              </div>

              <div className="grid gap-3">
                {topic.questions.map((q, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedQuestion({ q, topicId: topic.id, idx });
                      setSolution(null);
                    }}
                    className="group flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] cursor-pointer transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full border border-[var(--border-primary)] flex items-center justify-center text-xs font-serif text-[var(--text-tertiary)] group-hover:bg-[var(--bg-primary)] group-hover:text-emerald-500 group-hover:border-emerald-200 transition-colors shrink-0 mt-0.5">
                      {q.n}
                    </div>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] font-serif">
                      {q.t}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredTopics.length === 0 && (
            <div className="text-center py-20 text-[var(--text-tertiary)]">
              <p>No problems found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
              className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--card-bg)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-[var(--border-primary)] flex items-start justify-between bg-[var(--card-bg)] z-10">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                    {topics.find(t => t.id === selectedQuestion.topicId)?.title} · Problem {selectedQuestion.q.n}
                  </div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] leading-relaxed pr-8 font-serif">
                    {selectedQuestion.q.t}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2 -mr-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-secondary)]/50">
                {solution ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                        {modelUsed || 'AI Generated'}
                      </span>
                    </div>
                    
                    {audioBase64 && (
                      <div className="mb-6 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-primary)] shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Voice Explanation
                          </h4>
                        </div>
                        <audio controls className="w-full h-10" ref={audioRef}>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-primary)]">Step-by-Step Solution</h4>
                        <MarkdownRenderer content={solution} />
                      </div>
                      
                      {explanation && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-primary)]">Explanation Transcript</h4>
                          <div className="text-[13px] leading-relaxed text-[var(--text-secondary)] bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--border-primary)] shadow-sm whitespace-pre-wrap">
                            {explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--border-primary)] rounded-xl bg-[var(--card-bg)]">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${error ? 'bg-red-50 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                      {error ? <AlertTriangle size={20} /> : <Sparkles size={20} />}
                    </div>
                    {error ? (
                      <div className="max-w-xs">
                        <p className="text-red-600 text-sm font-medium mb-2">Error Solving Problem</p>
                        <p className="text-[var(--text-tertiary)] text-[11px] mb-6">{error}</p>
                      </div>
                    ) : (
                      <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs">
                        Generate a step-by-step solution using our AI model.
                      </p>
                    )}
                    <button 
                      onClick={() => solveWithAI()}
                      disabled={loading}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-70 flex items-center gap-2 ${error ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-secondary)]'}`}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          Solving...
                        </>
                      ) : (
                        <>{error ? 'Retry with AI' : '⚡ Solve with AI'}</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {solution && (
                <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--card-bg)] flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedQuestion(null)}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => solveWithAI(true)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  >
                    {loading ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AISelectionAnimation 
        modelId={animModelId} 
        isVisible={showSelectionAnim} 
        onComplete={() => setAnimModelId(null)} 
      />
    </div>
  );
}
