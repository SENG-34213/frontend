import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles, Save } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuestionBuilderModalProps {
  isOpen: boolean;
  quizId: string;
  onClose: () => void;
  onSaveQuestion: (question: QuizQuestion) => void;
}

export const QuestionBuilderModal: React.FC<QuestionBuilderModalProps> = ({
  isOpen,
  quizId,
  onClose,
  onSaveQuestion,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<QuizQuestion['type']>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>([
    'O(1) Constant Time',
    'O(log n) Logarithmic Time',
    'O(n) Linear Time',
    'O(n²) Quadratic Time',
  ]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(5);

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctOptionIdx >= updated.length) {
      setCorrectOptionIdx(0);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      quizId,
      type,
      question: questionText,
      options: type === 'true-false' ? ['True', 'False'] : options,
      correctAnswer: type === 'true-false' ? 'True' : options[correctOptionIdx] || options[0],
      explanation,
      marks: Number(marks) || 5,
    };

    onSaveQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quiz Question Builder</h3>
            <p className="text-xs text-slate-500">Configure question prompt, answer choices, and explanations</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="multiple-choice">Multiple Choice (Single Answer)</option>
                <option value="true-false">True / False</option>
                <option value="multi-select">Multi-Select (Checkboxes)</option>
                <option value="short-answer">Short Text Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Point Value (Marks)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Prompt
            </label>
            <textarea
              rows={3}
              placeholder="e.g. What is the tight asymptotic bound for a binary search tree in the worst case without rebalancing?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Options Section */}
          {type !== 'short-answer' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Answer Options & Correct Answer
                </label>
                {type === 'multiple-choice' && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Choice</span>
                  </button>
                )}
              </div>

              {type === 'true-false' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2 bg-indigo-50/40">
                    <input type="radio" checked readOnly name="tf" />
                    <span className="text-xs font-medium text-slate-800">True (Correct Answer)</span>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-2">
                    <input type="radio" disabled name="tf" />
                    <span className="text-xs font-medium text-slate-500">False</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctOptionIdx === idx}
                        onChange={() => setCorrectOptionIdx(idx)}
                        className="text-indigo-600"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400">Select the radio button beside the correct choice.</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pedagogical Explanation (Shown in Review)
            </label>
            <textarea
              rows={2}
              placeholder="Explain why this answer is mathematically or systematically correct..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
