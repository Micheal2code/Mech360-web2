import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const FeedbackView: React.FC = () => {
  const { currentUser } = useAuth();

  const [feedbackType, setFeedbackType] = useState('App Improvement');
  const [suggestionText, setSuggestionText] = useState('');

  const WHATSAPP_NUMBER = '2349016803444'; // 09016803444 in international format
  const DISPLAY_PHONE = '09016803444';

  const handleOpenWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Micheal! I am using the MEE 400L ClassHub App (${currentUser?.fullName || 'Student'} - ${currentUser?.matricNo || 'MEE Student'}). I would like to share feedback/suggestions on the app.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    const formattedMessage = `*ClassHub App Feedback & Suggestion* ⚙️\n\n*From:* ${currentUser?.fullName || 'Mechanical Student'} (${currentUser?.matricNo || 'EES Student'})\n*Category:* ${feedbackType}\n\n*Suggestion:* ${suggestionText.trim()}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              App Feedback & Direct WhatsApp Suggestions
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Have a suggestion to improve the app, report a bug, or request a feature? Connect directly with Master Admin Micheal Chukwuemeka OBI on WhatsApp.
          </p>
        </div>

        <button
          onClick={handleOpenWhatsAppDirect}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl border border-emerald-400 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
        >
          <span>📱</span>
          <span>Chat on WhatsApp</span>
        </button>
      </div>

      {/* Main Form & Contact Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Direct Contact Info */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-2xl text-emerald-400">
              💬
            </div>

            <div>
              <h3 className="font-extrabold text-white text-sm">Direct Developer Line</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Micheal Chukwuemeka OBI (Master Admin)
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">WhatsApp Number</div>
              <div className="text-sm font-mono font-extrabold text-emerald-400 flex items-center gap-1.5">
                <span>📱</span>
                <span>{DISPLAY_PHONE}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white">💡 What you can send:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Feature ideas for ClassHub</li>
                <li>Course material requests</li>
                <li>Bug reports or fixes</li>
                <li>General recommendations</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleOpenWhatsAppDirect}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl border border-emerald-500 shadow cursor-pointer transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <span>💬</span>
            <span>Open WhatsApp ({DISPLAY_PHONE})</span>
          </button>
        </div>

        {/* Right Column: In-App Message Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="font-extrabold text-white text-base">Submit App Suggestion</h3>
              <p className="text-xs text-slate-400">Generates a formatted message directly in WhatsApp</p>
            </div>
          </div>

          <form onSubmit={handleSubmitSuggestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="App Improvement">⚙️ App Improvement Idea</option>
                <option value="New Feature Request">🚀 New Feature Request</option>
                <option value="Course Material / PDF Request">📚 Course Material / PDF Request</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="General Feedback">💬 General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Suggestion / Message
              </label>
              <textarea
                required
                rows={5}
                placeholder="Type your suggestion on how to improve the ClassHub app..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!suggestionText.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl border border-emerald-400 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>Send Suggestion via WhatsApp ({DISPLAY_PHONE})</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
