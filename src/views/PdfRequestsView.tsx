import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, PdfRequest } from '../types';
import { api } from '../services/api';

interface PdfRequestsViewProps {
  pdfRequests: PdfRequest[];
  courses: Course[];
  onRefresh: () => void;
}

export const PdfRequestsView: React.FC<PdfRequestsViewProps> = ({
  pdfRequests,
  courses,
  onRefresh,
}) => {
  const { currentUser, canUpload, isMasterAdmin } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'fulfilled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Form State for New Request
  const [courseCode, setCourseCode] = useState('');
  const [requestTitle, setRequestTitle] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Reply Form State
  const [replyText, setReplyText] = useState('');
  const [replyAttachmentName, setReplyAttachmentName] = useState('');
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState('');
  const [replyStatus, setReplyStatus] = useState<'pending' | 'in_progress' | 'fulfilled'>('fulfilled');
  const [replyLoading, setReplyLoading] = useState(false);

  const filteredRequests = pdfRequests.filter((req) => {
    if (activeFilter !== 'all' && req.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.requestTitle.toLowerCase().includes(q);
      const matchCode = req.courseCode.toLowerCase().includes(q);
      const matchDetails = req.details.toLowerCase().includes(q);
      const matchUser = req.requestedByName.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchDetails && !matchUser) return false;
    }
    return true;
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo) return;
    if (!requestTitle.trim()) return;

    try {
      setLoading(true);
      await api.createPdfRequest({
        matricNo: currentUser.matricNo,
        courseCode: courseCode || 'MEE 204',
        requestTitle: requestTitle.trim(),
        details: details.trim(),
      });

      setSuccessMsg('PDF request submitted! Admin has been notified.');
      setRequestTitle('');
      setDetails('');
      onRefresh();
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to submit PDF request');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (requestId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo || !replyText.trim()) return;

    try {
      setReplyLoading(true);
      await api.replyPdfRequest({
        id: requestId,
        matricNo: currentUser.matricNo,
        text: replyText.trim(),
        status: canUpload ? replyStatus : undefined,
        attachmentName: replyAttachmentName.trim() || undefined,
        attachmentUrl: replyAttachmentUrl.trim() || undefined,
      });

      setReplyText('');
      setReplyAttachmentName('');
      setReplyAttachmentUrl('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!currentUser?.matricNo) return;
    if (!confirm('Are you sure you want to delete this PDF request?')) return;

    try {
      await api.deletePdfRequest(id, currentUser.matricNo);
      if (selectedRequestId === id) setSelectedRequestId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete request');
    }
  };

  const pendingCount = pdfRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📑</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              PDF & Course Material Requests
            </h1>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Request textbook PDFs, lecture slide notes, past question papers, or course materials (e.g. "I want MEE 204 PDF"). Master Admin Micheal Chukwuemeka OBI and Assistant Admins receive instant updates to upload materials.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-blue-400 shadow flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>➕</span>
          <span>Request a PDF / Note</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Requests ({pdfRequests.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'pending' ? 'bg-amber-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⏳</span>
            <span>Pending ({pdfRequests.filter((r) => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'in_progress' ? 'bg-indigo-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>In Progress</span>
          </button>
          <button
            onClick={() => setActiveFilter('fulfilled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'fulfilled' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✅</span>
            <span>Fulfilled</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Search requests (e.g. ME 204)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none shadow sm:w-64"
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <span className="text-4xl">📚</span>
          <p className="font-bold text-sm text-slate-200">No PDF requests found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Need a course textbook or lecture note? Click "Request a PDF / Note" above to request materials directly from class administrators!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isSelected = selectedRequestId === req.id;
            const isOwner = req.requestedByMatric === currentUser?.matricNo;

            return (
              <div
                key={req.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow transition-all ${
                  req.status === 'pending'
                    ? 'border-amber-700/80'
                    : req.status === 'in_progress'
                    ? 'border-indigo-700/80'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-900/80 text-blue-300 font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded border border-blue-700">
                        {req.courseCode}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-800 text-amber-100'
                            : req.status === 'in_progress'
                            ? 'bg-indigo-800 text-indigo-100'
                            : 'bg-emerald-800 text-emerald-100'
                        }`}
                      >
                        {req.status === 'pending' ? '⏳ Pending Admin Reply' : req.status === 'in_progress' ? '⚡ In Progress' : '✅ Fulfilled / Uploaded'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white mt-2">
                      {req.requestTitle}
                    </h3>

                    <p className="text-xs text-slate-300 mt-1">
                      {req.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2.5">
                      <span>Requested by: <strong className="text-slate-200">{req.requestedByName}</strong></span>
                      <span>•</span>
                      <span>{new Date(req.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-blue-400 font-bold">{req.replies.length} Reply/Replies</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => setSelectedRequestId(isSelected ? null : req.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 shadow cursor-pointer transition-colors"
                    >
                      {isSelected ? 'Hide Replies ▴' : 'View Thread & Reply ▾'}
                    </button>

                    {(canUpload || isOwner) && (
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/60 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Delete Request"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Thread View */}
                {isSelected && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      Response & Thread Activity
                    </h4>

                    {req.replies.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                        No admin responses yet. Post a message below to answer this request.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {req.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span>{rep.senderAvatar || '👤'}</span>
                                <span className="font-extrabold text-white">{rep.senderName}</span>
                                <span className="text-[10px] text-blue-400 font-bold px-1.5 py-0.2 bg-blue-950 rounded border border-blue-800">
                                  {rep.senderRole}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-slate-200">{rep.text}</p>

                            {rep.attachmentName && (
                              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] mt-1">
                                <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                                  <span>📄</span>
                                  <span>{rep.attachmentName}</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold">Available in Course Notes</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <form onSubmit={(e) => handleSendReply(req.id, e)} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-200">
                        {canUpload ? '⚡ Reply & Fulfill Request (Admin Portal)' : '💬 Add Message to Thread'}
                      </div>

                      <textarea
                        required
                        rows={2}
                        placeholder={canUpload ? 'e.g. Uploaded MEE 204 Fluid Mechanics PDF note to the repository!' : 'Write your reply...'}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />

                      {canUpload && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Attached Material Name (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. MEE204_Fluid_Mechanics.pdf"
                              value={replyAttachmentName}
                              onChange={(e) => setReplyAttachmentName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Update Status
                            </label>
                            <select
                              value={replyStatus}
                              onChange={(e: any) => setReplyStatus(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                            >
                              <option value="fulfilled">✅ Mark as Fulfilled / Uploaded</option>
                              <option value="in_progress">⚡ Mark as In Progress</option>
                              <option value="pending">⏳ Keep Pending</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={replyLoading || !replyText.trim()}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition-colors"
                        >
                          {replyLoading ? 'Posting Reply...' : 'Post Reply'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📑</span>
                <h3 className="font-extrabold text-white text-base">Request Course PDF or Material</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-3 rounded-xl text-xs font-bold">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ME 204"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Request Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. I want ME 204 PDF"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Specific Details / Chapters / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for lecture notes on Fluid Kinematics or past question solutions..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !requestTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-colors"
                >
                  {loading ? 'Submitting Request...' : 'Submit PDF Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
