import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  ChevronRight, 
  Code2, 
  Cpu, 
  Search, 
  Sparkles, 
  X, 
  Copy, 
  Check,
  BookOpen,
  Laptop
} from 'lucide-react';
import { Topic, Question, Solution } from '../types';

export default function Programming() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/programming/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        if (data.length > 0) setSelectedTopic(data[0]);
      });
  }, []);

  const handleSolve = async (forceRefresh = false) => {
    if (!selectedQuestion || !selectedTopic) return;
    
    setLoading(true);
    try {
      const { aiService } = await import('../services/aiService');
      const apiKeys = aiService.getAllApiKeys();

      const res = await fetch('/api/programming/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: `${selectedTopic.id}_${selectedQuestion.n}`,
          question: selectedQuestion.t,
          topic: selectedTopic.title,
          type: selectedQuestion.type,
          forceRefresh,
          apiKeys
        })
      });
      const data = await res.json();
      setSolution(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract code from HTML solution for copying
  const extractCode = (html: string) => {
    const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    return match ? match[1].trim() : '';
  };

  const filteredQuestions = selectedTopic?.questions.filter(q => 
    q.t.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.n.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans selection:bg-blue-500/30 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)] z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Terminal className="w-5 h-5 text-blue-500" />
            </div>
            <h1 className="font-semibold text-[var(--text-primary)] tracking-tight">Computer Programming</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
              <Code2 className="w-4 h-4" />
              <span>C & Fortran</span>
            </span>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 pb-6 md:pb-12 max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-4 md:gap-8 h-[calc(100vh-1rem)]">
        {/* Sidebar - Topics */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-20 scrollbar-hide">
          <h2 className="hidden md:block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">Chapters</h2>
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                setSelectedQuestion(null);
                setSolution(null);
              }}
              className={`flex-shrink-0 md:flex-shrink text-left px-4 py-3 rounded-xl transition-all duration-200 border ${
                selectedTopic?.id === topic.id
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-lg shadow-blue-900/20'
                  : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-primary)]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium whitespace-nowrap md:whitespace-normal">{topic.title}</span>
                {selectedTopic?.id === topic.id && (
                  <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 hidden md:block" />
                )}
              </div>
              <div className="text-[10px] mt-1 opacity-60 font-mono hidden md:block">
                {topic.questions?.length || 0} PROBLEMS
              </div>
            </button>
          ))}
        </div>

        {/* Main Content - Questions */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-primary)] overflow-hidden transition-colors duration-300">
          {/* Toolbar */}
          <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between gap-4 bg-[var(--bg-secondary)] transition-colors duration-300">
            <h2 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              {selectedTopic?.title}
            </h2>
            <div className="relative w-64 flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg pl-9 pr-8 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Question List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[var(--border-primary)] scrollbar-track-transparent">
            {filteredQuestions?.map((q, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                key={q.n}
                onClick={() => {
                  setSelectedQuestion(q);
                  setSolution(null);
                }}
                className="group p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500/50 transition-all duration-300" />
                <div className="flex gap-4">
                  <span className="font-mono text-blue-500/50 text-sm pt-0.5">#{q.n}</span>
                  <div className="flex-1">
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">
                      {q.t}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-blue-500 transition-colors self-center" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Solution Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-sm"
            onClick={() => setSelectedQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-[var(--card-bg)] rounded-2xl border border-[var(--border-primary)] shadow-2xl flex flex-col overflow-hidden transition-colors duration-300"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--border-primary)] flex items-start justify-between bg-[var(--bg-secondary)] transition-colors duration-300">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                      Problem #{selectedQuestion.n}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] font-mono">{selectedTopic?.title}</span>
                  </div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] leading-snug">
                    {selectedQuestion.t}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[var(--border-primary)] scrollbar-track-transparent">
                {!solution ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                      <Laptop className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-2">Ready to Code?</h4>
                    <p className="text-[var(--text-secondary)] text-sm max-w-xs mb-6">
                      Generate a clean, compilable solution with explanation using our AI model.
                    </p>
                    <button
                      onClick={() => handleSolve()}
                      disabled={loading}
                      className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating Code...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Solution</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Generated by {solution.modelUsed}</span>
                      </div>
                      <div className="flex gap-2">
                        {extractCode(solution.solution || '') && (
                          <button
                            onClick={() => copyToClipboard(extractCode(solution.solution || ''))}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)] transition-colors border border-[var(--border-primary)]"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy Code'}
                          </button>
                        )}
                        <button
                          onClick={() => handleSolve(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)] transition-colors border border-[var(--border-primary)]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div 
                      className="prose dark:prose-invert prose-sm max-w-none 
                        prose-pre:bg-[var(--bg-primary)] prose-pre:border prose-pre:border-[var(--border-primary)] prose-pre:rounded-xl
                        prose-code:text-blue-400 prose-code:font-mono
                        prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)]
                        prose-strong:text-[var(--text-primary)]"
                      dangerouslySetInnerHTML={{ __html: solution.solution || '' }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
