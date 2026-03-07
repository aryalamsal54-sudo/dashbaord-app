# AI Features Integration Guide

## What's been added

The AI features from the standalone `index.html` (Physics Derivations page) have been
extracted into reusable components that work across the entire website.

---

## File overview

```
server/routes/aiProviders.ts    ← NEW: Multi-provider backend proxy
server/routes/physics.ts        ← UPDATED: accepts pre-computed solutions
server/routes/math.ts           ← UPDATED: accepts pre-computed solutions
server/routes/programming.ts    ← UPDATED: accepts pre-computed solutions
server.ts                       ← UPDATED: registers /api/ai route

src/lib/aiClient.ts             ← NEW: MODEL_REGISTRY, callAI(), generateDiagramUrl()
src/hooks/useAISolver.ts        ← NEW: useAISolver() hook
src/components/ModelPicker.tsx  ← NEW: Model selector modal
src/components/AISolver.tsx     ← NEW: AI solution panel UI
```

---

## Step 1 — Copy files into your project

Copy the new/updated files into the same paths shown above.

---

## Step 2 — Add API keys to `.env.local`

```env
GEMINI_API_KEY=...          # already have this
GROQ_API_KEY=...            # get free at console.groq.com
OPENROUTER_API_KEY=...      # get at openrouter.ai
SAMBANOVA_API_KEY=...       # get at cloud.sambanova.ai (free tier)
AIMLAPI_KEY=...             # get at aimlapi.com
GITHUB_TOKEN=...            # your GitHub PAT with models permission
```

Any key you don't add will just make that provider unavailable.
Groq + Gemini are the two most important ones.

---

## Step 3 — (Optional) Add Puter.js for free image generation

Add this to `index.html` before the closing `</head>` tag:

```html
<script src="https://js.puter.com/v2/"></script>
```

This enables free diagram generation via Puter (DALL·E, Flux, etc.) without any API key.

---

## Step 4 — Wire into any page component

Here is a complete example for a Physics Derivations page:

```tsx
// src/pages/PhysicsDerivations.tsx

import { useState, useEffect } from 'react';
import { useAISolver } from '@/src/hooks/useAISolver';
import { AISolver } from '@/src/components/AISolver';
import { ModelPicker } from '@/src/components/ModelPicker';
import { DEFAULT_MODEL } from '@/src/lib/aiClient';
import type { SelectedModel } from '@/src/lib/aiClient';

export default function PhysicsDerivations() {
  const solver      = useAISolver();
  const [model, setModel]           = useState<SelectedModel>(DEFAULT_MODEL);
  const [showPicker, setShowPicker] = useState(false);

  // Load green solved indicators on mount
  useEffect(() => { solver.loadSolvedIds(); }, []);

  function openDerivation(chId: string, qi: number, question: string, chTitle: string) {
    solver.openQuestion({
      id:      `${chId}-deriv-${qi}`,
      text:    question,
      topic:   chId,
      tab:     'derivations',
      chapter: chTitle,
      num:     String(qi + 1),
    });
  }

  return (
    <>
      {/* Your existing question list UI here */}
      {/* Mark rows as solved: solver.state.solvedSet.has(qid) */}

      {/* Question modal */}
      {solver.state.isOpen && solver.state.question && (
        <div className="fixed inset-0 z-50 ...">
          <div className="modal ...">
            <h2>{solver.state.question.text}</h2>

            {/* AI Solver panel */}
            <AISolver
              solver={solver}
              model={model}
              onOpenModelPicker={() => setShowPicker(true)}
              solveLabel="⚡ Derive with AI"
              solveAgainLabel="Derive Again"
            />

            <button onClick={solver.closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Model picker */}
      <ModelPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        selected={model}
        onSelect={setModel}
      />
    </>
  );
}
```

---

## Step 5 — Add it to Math page

```tsx
solver.openQuestion({
  id:      `math-${topicId}-${qi}`,
  text:    question.t,
  topic:   topicId,
  tab:     'math',           // ← tells the hook which system prompt to use
  chapter: topic.title,
  num:     question.n,
});
```

```tsx
<AISolver
  solver={solver}
  model={model}
  onOpenModelPicker={() => setShowPicker(true)}
  solveLabel="⚡ Solve with AI"
  solveAgainLabel="Solve Again"
/>
```

---

## Step 6 — Add it to Programming page

```tsx
solver.openQuestion({
  id:      `prog-${topicId}-${qi}`,
  text:    question.t,
  topic:   topicId,
  tab:     question.type,   // 'code' | 'theory' | 'output'
  chapter: topic.title,
  num:     question.n,
});
```

```tsx
<AISolver
  solver={solver}
  model={model}
  onOpenModelPicker={() => setShowPicker(true)}
  solveLabel="⚡ Generate Solution"
  solveAgainLabel="Regenerate"
/>
```

---

## How it all works

```
User clicks question row
       ↓
solver.openQuestion(q)
       ↓
AISolver renders "click to begin" placeholder
       ↓
User clicks "Solve with AI"
       ↓
useAISolver.solve(model)
       ↓
POST /api/ai/solve  {provider, modelId, prompt, systemPrompt}
       ↓
aiProviders.ts calls Groq / Gemini / OpenRouter / etc.
       ↓
Returns { text: htmlString }
       ↓
Frontend persists to DB:
  POST /api/physics/solve {solution, modelUsed, questionId, ...}
       ↓
AISolver renders solution HTML
       ↓
DiagramInjector finds .derivation-diagram-placeholder elements
  and generates images via Pollinations / Puter
       ↓
Row turns green in question list (solvedSet updated)
```

---

## Provider availability summary

| Provider       | Cost      | Key required | Best for            |
|----------------|-----------|--------------|---------------------|
| Groq           | Free tier | Yes          | Speed (default)     |
| Gemini         | Free tier | Yes          | Quality + physics   |
| OpenRouter     | Pay/use   | Yes          | Claude, GPT-4o, etc.|
| SambaNova      | Free tier | Yes          | Llama 405B          |
| GitHub Models  | Free      | GitHub PAT   | GPT-4o free         |
| AIMLAPI        | Free tier | Yes          | Aggregator          |
| Pollinations   | Free      | No           | Image diagrams      |
| Puter          | Free      | No           | DALL·E diagrams     |
