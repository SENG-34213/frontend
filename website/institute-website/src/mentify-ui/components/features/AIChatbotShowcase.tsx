import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Globe,
  BookOpen,
  Award,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  steps?: string[];
  syllabusRef?: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  {
    label: '∫ x · e^(2x) dx (Pure Maths)',
    query: 'Show step-by-step integration by parts for ∫ x · e^(2x) dx with NIE marking scheme breakdown.',
  },
  {
    label: 'Doppler Effect Equation (Physics)',
    query: 'Derive the apparent frequency when a sound source moves towards a stationary observer with wind velocity w.',
  },
  {
    label: 'Haber Process Equilibrium (Chemistry)',
    query: 'Explain how temperature and pressure affect NH3 yield in the Haber process based on Le Chatelier’s principle.',
  },
  {
    label: 'Balancing Redox (Acidic Medium)',
    query: 'Balance the redox equation: MnO4⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺ in acidic solution with electron half-equations.',
  },
];

const KNOWLEDGE_BASE: Record<string, { steps: string[]; explanation: string; ref: string }> = {
  integration: {
    steps: [
      'Step 1: Choose u = x and dv = e^(2x) dx according to LIATE rule (Algebraic before Exponential).',
      'Step 2: Differentiate u: du/dx = 1  ⇒  du = dx.',
      'Step 3: Integrate dv: v = ∫ e^(2x) dx = (1/2) e^(2x).',
      'Step 4: Apply formula: ∫ u dv = u·v - ∫ v du',
      'Step 5: Substitute: = x · (1/2 e^(2x)) - ∫ (1/2 e^(2x)) dx',
      'Step 6: Evaluate final integral: = (1/2) x e^(2x) - (1/4) e^(2x) + C',
      'Step 7: Factor out common terms: = (1/4) e^(2x) [2x - 1] + C  (where C is the arbitrary constant of integration).',
    ],
    explanation:
      'G.C.E. A/L Marking Allocation: 1 Mark for defining u and dv, 2 Marks for substitution and intermediate integral, 1 Mark for constant + C and final simplification. Total: 4 Marks.',
    ref: 'NIE Combined Mathematics Syllabus Unit 08 (Integral Calculus), Paper II Part B.',
  },
  doppler: {
    steps: [
      'Step 1: In 1 second, the source emits f₀ waves while travelling a distance uₛ towards the observer.',
      'Step 2: The sound waves occupy the compressed distance (v + w - uₛ), where v is speed of sound and w is wind velocity along propagation.',
      'Step 3: Therefore, the apparent wavelength λ′ is:  λ′ = (v + w - uₛ) / f₀.',
      'Step 4: Speed of waves relative to stationary observer = (v + w).',
      'Step 5: Apparent frequency f′ received by observer:  f′ = (v + w) / λ′',
      'Step 6: Substituting λ′ yields:  f′ = f₀ · [ (v + w) / (v + w - uₛ) ].',
    ],
    explanation:
      'Note: If the wind blows against the direction of sound propagation, replace w with -w. If the source recedes, change the denominator sign to (v + w + uₛ).',
    ref: 'G.C.E. A/L Physics Syllabus Unit 03 (Oscillations and Waves), Section 3.7 Doppler Phenomenon.',
  },
  haber: {
    steps: [
      'Chemical Equilibrium Equation:  N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  [ΔH = -92.4 kJ/mol, Exothermic]',
      'Effect of Temperature: Since the forward reaction is exothermic, increasing temperature shifts equilibrium to the left (reactants), reducing NH₃ yield. A compromise temperature of 400°C–450°C is chosen to maintain an acceptable reaction rate.',
      'Effect of Pressure: Left side has 4 moles of gas; right side has 2 moles. Increasing pressure favours the side with fewer gas moles (forward reaction), increasing NH₃ yield. Typical operating pressure is 150–200 atm.',
      'Catalyst: Finely divided iron with K₂O/Al₂O₃ promoter speeds up attainment of equilibrium without shifting equilibrium position.',
    ],
    explanation:
      'Exam Tip: Never write that catalyst increases the percentage yield of ammonia. A catalyst only lowers activation energy Ea for both forward and reverse reactions equally.',
    ref: 'NIE Chemistry Syllabus Unit 07 (Chemical Equilibrium) & Unit 10 (Industrial Chemistry).',
  },
  redox: {
    steps: [
      'Step 1: Identify oxidation and reduction pairs: MnO₄⁻ → Mn²⁺ (Reduction), Fe²⁺ → Fe³⁺ (Oxidation).',
      'Step 2: Oxidation half-reaction: Fe²⁺(aq) → Fe³⁺(aq) + e⁻',
      'Step 3: Reduction half-reaction: Balance O atoms with H₂O:  MnO₄⁻ → Mn²⁺ + 4H₂O',
      'Step 4: Balance H atoms with H⁺ in acidic medium:  MnO₄⁻ + 8H⁺ → Mn²⁺ + 4H₂O',
      'Step 5: Balance electric charge with electrons:  MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O',
      'Step 6: Multiply oxidation equation by 5 so electron count matches:  5Fe²⁺ → 5Fe³⁺ + 5e⁻',
      'Step 7: Add equations and cancel 5e⁻:  MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
    ],
    explanation:
      'Verification: Total charge on left side = (-1) + 5(+2) + 8(+1) = +17. Wait: (-1) + 10 + 8 = +17. Right side = (+2) + 5(+3) = +17. Both mass and charge are conserved!',
    ref: 'NIE Chemistry Syllabus Unit 08 (Electrochemistry & Redox Systems), Section 8.2.',
  },
};

export const AIChatbotShowcase: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'si' | 'ta'>('en');
  const [queryInput, setQueryInput] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Ayubowan & Vanakkam! I am your TiT Syllabus AI Study Coach. I can provide step-by-step mathematical proofs, Physics derivations, and Chemistry reaction mechanisms strictly aligned with official NIE marking standards. What would you like to solve today?',
      timestamp: 'Just now',
    },
    {
      id: 'init-2',
      sender: 'user',
      text: 'Show step-by-step integration by parts for ∫ x · e^(2x) dx with NIE marking scheme breakdown.',
      timestamp: 'Just now',
    },
    {
      id: 'init-3',
      sender: 'ai',
      text: 'Here is the rigorous proof with step-by-step marking rubric marks for ∫ x · e^(2x) dx:',
      steps: KNOWLEDGE_BASE.integration.steps,
      syllabusRef: KNOWLEDGE_BASE.integration.ref,
      timestamp: 'Just now',
    },
  ]);

  const handleAsk = (textToAsk: string) => {
    if (!textToAsk.trim()) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToAsk,
      timestamp: 'Just now',
    };

    setConversation((prev) => [...prev, userMsg]);
    setQueryInput('');

    // Determine answer from knowledge base
    const lower = textToAsk.toLowerCase();
    let answerKey = 'integration';
    if (lower.includes('doppler') || lower.includes('sound') || lower.includes('wave')) {
      answerKey = 'doppler';
    } else if (lower.includes('haber') || lower.includes('equilibrium') || lower.includes('le chatelier')) {
      answerKey = 'haber';
    } else if (lower.includes('redox') || lower.includes('mno4') || lower.includes('fe2')) {
      answerKey = 'redox';
    }

    const matched = KNOWLEDGE_BASE[answerKey] || KNOWLEDGE_BASE.integration;

    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here is the verified curriculum derivation (${selectedLang.toUpperCase()} Mode):`,
        steps: matched.steps,
        syllabusRef: matched.ref,
        timestamp: 'Just now',
      };
      setConversation((prev) => [...prev, aiResponse]);
    }, 600);
  };

  const handleCopySteps = (id: string, steps?: string[]) => {
    if (!steps) return;
    navigator.clipboard.writeText(steps.join('\n'));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setConversation([
      {
        id: 'init-fresh',
        sender: 'ai',
        text: 'Chat history cleared. Select any prompt or type a problem to start a fresh curriculum walkthrough.',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">TiT AI Study Coach</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Grounded on NIE Syllabus
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Step-by-step problem solver, step marking rubrics, and multilingual concept explanations.
            </p>
          </div>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-white/10 rounded-xl text-xs">
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedLang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang('si')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedLang === 'si' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              සිංහල
            </button>
            <button
              onClick={() => setSelectedLang('ta')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedLang === 'ta' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>
          <button
            onClick={handleClear}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recommended Prompts Carousel */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          High-Yield Drill:
        </span>
        {PRESET_QUERIES.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(p.query)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
        {conversation.map((msg) => {
          const isAI = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isAI
                    ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xs'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : 'ST'}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs ${
                  isAI
                    ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-bold ${
                      isAI ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-100'
                    }`}
                  >
                    {isAI ? 'TiT AI Tutor' : 'You (Student)'}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isAI ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                <p className="leading-relaxed">{msg.text}</p>

                {/* Step Breakdown Card */}
                {msg.steps && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
                      {msg.steps.map((st, i) => (
                        <div
                          key={i}
                          className="p-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-l-2 border-indigo-500 pl-2.5"
                        >
                          {st}
                        </div>
                      ))}
                    </div>

                    {msg.syllabusRef && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{msg.syllabusRef}</span>
                        </span>

                        <button
                          onClick={() => handleCopySteps(msg.id, msg.steps)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Steps
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(queryInput);
        }}
        className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Ask any math derivation, chemistry mechanism, or physics concept..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="rounded-xl px-4 py-2.5 shrink-0"
          disabled={!queryInput.trim()}
        >
          <Send className="w-4 h-4 mr-1.5" />
          Solve
        </Button>
      </form>
    </div>
  );
};
