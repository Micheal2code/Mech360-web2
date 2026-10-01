import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { TOPIC_CHANNELS } from '../data/coursesData';
import { api } from '../services/api';

export const ChatRoomView: React.FC = () => {
  const { currentUser, isMasterAdmin } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChannel = TOPIC_CHANNELS.find((c) => c.id === activeChannelId) || TOPIC_CHANNELS[0];

  const fetchMessages = async (channelId: string) => {
    try {
      const res = await api.getChatMessages(channelId);
      setMessages(res.messages || []);
    } catch (e) {
      console.error('Failed to fetch chat messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages(activeChannelId);
    const interval = setInterval(() => {
      fetchMessages(activeChannelId);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo || !inputText.trim()) return;
    setErrorMsg('');
    setLoading(true);

    try {
      await api.sendChatMessage({
        matricNo: currentUser.matricNo,
        channelId: activeChannelId,
        text: inputText.trim(),
      });
      setInputText('');
      await fetchMessages(activeChannelId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post message');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!currentUser?.matricNo) return;
    try {
      await api.deleteChatMessage(id, currentUser.matricNo);
      await fetchMessages(activeChannelId);
    } catch (e: any) {
      alert(e.message || 'Failed to delete message');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              Mechanical Engineering Commons
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Real-time peer discussion channels for 400L course queries, project coordination, and exam prep.
          </p>
        </div>

        {/* Channel Filter Chips */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {TOPIC_CHANNELS.map((ch) => {
            const isActive = activeChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow border border-blue-400'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{ch.emoji}</span>
                <span>#{ch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-[600px] shadow overflow-hidden">
        {/* Active Channel Info */}
        <div className="bg-slate-850 p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeChannel.emoji}</span>
            <span className="text-xs font-bold text-white">#{activeChannel.name}</span>
            <span className="text-slate-400 text-xs hidden sm:inline">— {activeChannel.description}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            🔒 Privacy Shield Active
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <span className="text-3xl mb-2">{activeChannel.emoji}</span>
              <p className="font-bold text-sm text-slate-200">Welcome to #{activeChannel.name}</p>
              <p className="text-xs max-w-sm mt-1">
                Post the first message to kick off technical discussion with your 400L colleagues.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAuthor = currentUser?.matricNo === msg.senderMatric;
              const canDelete = isAuthor || isMasterAdmin;

              return (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base flex-shrink-0">
                    {msg.senderAvatar || '⚙️'}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{msg.senderName}</span>
                        {msg.senderRole === 'Master Admin' && (
                          <span className="bg-amber-900 text-amber-200 border border-amber-600 text-[8px] font-extrabold px-1 rounded">
                            ADMIN
                          </span>
                        )}
                        {msg.senderRole === 'Assistant Admin' && (
                          <span className="bg-indigo-900 text-indigo-200 border border-indigo-600 text-[8px] font-extrabold px-1 rounded">
                            UPLOADER
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-300 p-1 cursor-pointer transition-opacity"
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-850 border-t border-slate-800">
          {errorMsg && (
            <div className="bg-red-950 border border-red-700 text-red-200 p-2 rounded-xl text-xs mb-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder={`Message #${activeChannel.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none shadow"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-blue-400 shadow flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>🚀</span>
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
