import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { api } from '../services/api';

interface TutorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  securityFlag?: boolean;
}

interface AITutorViewProps {
  courses: Course[];
}

export const AITutorView: React.FC<AITutorViewProps> = ({ courses }) => {
  const { currentUser } = useAuth();

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello ${currentUser?.fullName || 'there'}! 🤖 I am your ClassHub General AI Assistant.\n\nYou can ask me ANY question on ANY topic — mathematics, science, engineering, software development, essay writing, history, career guidance, study strategies, or general trivia. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickPromptChips = [
    {
      label: '💡 Explain Quantum Computing',
      topic: 'Physics & Computing',
      prompt: 'Explain quantum computing, qubits, and superposition in simple, intuitive terms with a real-world analogy.',
    },
    {
      label: '📝 Proofread & Polish Essay',
      topic: 'Writing & Communication',
      prompt: 'How can I structure a compelling technical research paper or project report introduction? Give me a 4-part framework.',
    },
    {
      label: '📐 Solve Differential Equation',
      topic: 'Mathematics',
      prompt: 'Explain step-by-step how to solve second-order linear homogeneous differential equations with constant coefficients y" + a y\' + b y = 0.',
    },
    {
      label: '💻 Python / JS Coding Help',
      topic: 'Programming',
      prompt: 'Explain the difference between synchronous and asynchronous execution in JavaScript and how Promises / async-await work under the hood.',
    },
    {
      label: '🧠 Effective Study & Exam Strategy',
      topic: 'Productivity',
      prompt: 'Give me 5 evidence-based study techniques for mastering difficult technical subjects and preparing for high-stakes examinations.',
    },
  ];

  const handleSendPrompt = async (customPrompt?: string) => {
    const textToSend = customPrompt || promptInput;
    if (!currentUser?.matricNo || !textToSend.trim()) return;

    setErrorMsg('');
    const userMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.askCourseMate({
        matricNo: currentUser.matricNo,
        prompt: textToSend.trim(),
        conversationHistory: history,
      });

      const aiMsg: TutorMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'Here is the answer to your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityFlag: res.securityFlag,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Assistant is currently busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              ClassHub General AI Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Ask any question across science, mathematics, coding, writing, history, career advice, or general knowledge. Powered by Gemini 3.8.
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `init-${Date.now()}`,
                sender: 'ai',
                text: `Conversation cleared! What else would you like to ask me today, ${currentUser?.fullName}?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer self-start sm:self-auto transition-colors"
        >
          🔄 New Chat
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div>
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span>💡</span> Suggested Topic Starters (Click to Ask)
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPromptChips.map((chip, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendPrompt(chip.prompt)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white border border-blue-400'
                    : 'bg-emerald-700 text-white border border-emerald-500'
                }`}
              >
                {msg.sender === 'user' ? currentUser?.avatarEmoji || '🎓' : '🤖'}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 shadow ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.securityFlag
                    ? 'bg-red-950 border border-red-700 text-red-200 rounded-tl-none font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none font-sans'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono mb-1 pb-1 border-b border-white/10">
                  <span className="font-bold">
                    {msg.sender === 'user' ? currentUser?.fullName : 'ClassHub AI Assistant'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs font-bold text-blue-400 p-2">
              <span className="animate-spin text-base">⚙️</span>
              <span>ClassHub AI is thinking and generating answer...</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-2 p-2 bg-red-950 border border-red-800 text-red-200 text-xs font-bold rounded-xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask me any question on science, math, coding, writing, general knowledge..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-5 py-3 rounded-2xl text-xs border border-blue-400 shadow cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <span>🚀</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
