import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, apiHeaders, SOCKET_URL } from '../../utils/api';
import { io } from 'socket.io-client';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reporter, setReporter] = useState({
    name: "",
    unit: ""
  });

  const [statusInput, setStatusInput] = useState('open');
  const [handledByInput, setHandledByInput] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [updateSuccessMsg, setUpdateSuccessMsg] = useState("");
  const [copySuccessMsg, setCopySuccessMsg] = useState("");
  const [actionTakenInput, setActionTakenInput] = useState("");

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'process': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'done': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'on_hold': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [subCategorySearchQuery, setSubCategorySearchQuery] = useState("");

  const subcategories = useMemo(() => {
    const cat = categories.find(c => c.category_name === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory, categories]);

  const filteredSubCategories = useMemo(() => {
    return subcategories.filter(s =>
      s.name.toLowerCase().includes(subCategorySearchQuery.toLowerCase())
    );
  }, [subcategories, subCategorySearchQuery]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const handleSelectSubCategory = (subCatName) => {
    setSelectedSubCategory(subCatName);
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/messages`, {
        headers: apiHeaders(user)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
    fetchAdmins();
    fetchMessages();

    // Fetch Categories & Subcategories
    Promise.all([
      fetch(`${API_BASE}/api/categories`, { headers: apiHeaders(user) }).then(r => r.json()),
      fetch(`${API_BASE}/api/subcategories`, { headers: apiHeaders(user) }).then(r => r.json())
    ]).then(([catRes, subRes]) => {
      if (catRes.status === 'success' && subRes.status === 'success') {
        const cats = catRes.data || [];
        const subs = subRes.data || [];
        
        const mappedCats = cats.map(c => ({
          category_id: c.id,
          category_name: c.name,
          subcategories: subs.filter(s => s.category_id === c.id)
        }));
        
        setCategories(mappedCats);
      }
    }).catch(console.error);

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('ticketUpdated', (payload) => {
      // Refresh detail when ticket is updated
      if (payload?.data && String(payload.data.ticket_id) === String(id)) {
        fetchTicketDetail();
      } else if (!payload?.data) {
        fetchTicketDetail();
      }
    });

    socket.on('newMessage', (payload) => {
      if (String(payload?.ticket_id) === String(id)) {
        fetchMessages();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, user]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}/messages/send`, {
        method: 'POST',
        headers: apiHeaders(user),
        body: JSON.stringify({ sender_type: 'admin', sender_id: user.id || user.user_id, message: chatInput })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setChatInput('');
        if (socketRef.current) {
          socketRef.current.emit('newMessage', { ticket_id: id });
        }
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTicketDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        headers: apiHeaders(user)
      });
      const data = await res.json();
      if (data.status === 'success') {
        const d = data.data.ticket;
        setTicket(d);
        setAttachments(data.data.attachments || []);
        
        let initialStatus = 'open';
        if (d.status === 'baru' || d.status === 'open') initialStatus = 'open';
        if (d.status === 'proses' || d.status === 'diproses' || d.status === 'process') initialStatus = 'process';
        if (d.status === 'selesai' || d.status === 'done' || d.status === 'closed') initialStatus = 'done';
        if (d.status === 'on hold' || d.status === 'hold' || d.status === 'on_hold') initialStatus = 'on_hold';
        if (d.status === 'canceled' || d.status === 'batal' || d.status === 'cancelled') initialStatus = 'cancelled';

        setStatusInput(initialStatus);
        setHandledByInput(d.handled_by || '');
        setReporter({
          name: d.reporter_name || "",
          unit: d.reporter_unit || ""
        });
        setSelectedCategory(d.category || '');
        setSelectedSubCategory(d.subcategory || '');
        setActionTakenInput(d.action_taken || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-users`, {
        headers: apiHeaders(user)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAdmins(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTicket = async () => {
    if (!user) return;
    try {
      let isError = false;

      // Update Details
      const payload = {
        handled_by: handledByInput || null,
        reporter_name: reporter.name,
        reporter_unit: reporter.unit,
        action_taken: actionTakenInput || null
      };

      const catObj = categories.find(c => c.category_name === selectedCategory);
      if (catObj) payload.category_id = catObj.category_id;
      
      const subCatObj = subcategories.find(s => s.name === selectedSubCategory);
      if (subCatObj) payload.subcategory_id = subCatObj.id;

      if (selectedCategory && selectedSubCategory) {
          payload.title = `${selectedCategory} - ${selectedSubCategory}`;
      }

      const detailRes = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: apiHeaders(user),
        body: JSON.stringify(payload)
      });
      const detailData = await detailRes.json();
      if (detailData.status !== 'success') {
        alert("Gagal update data tiket: " + detailData.message);
        isError = true;
      }

      // Update Status
      if (!isError) {
        const statusRes = await fetch(`${API_BASE}/api/tickets/${id}/status`, {
          method: 'PUT',
          headers: apiHeaders(user),
          body: JSON.stringify({
            status: statusInput
          })
        });
        const statusData = await statusRes.json();
        if (statusData.status !== 'success') {
          alert("Gagal update status: " + statusData.message);
          isError = true;
        }
      }

      if (!isError) {
        setUpdateSuccessMsg("Ticket berhasil diperbarui!");
        setTimeout(() => setUpdateSuccessMsg(""), 3000);
        fetchTicketDetail();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDeleteTicket = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'DELETE',
        headers: apiHeaders(user)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsDeleteModalOpen(false);
        navigate('/admin/monitoring');
      } else {
        alert('Gagal menghapus ticket: ' + (data.message || 'Error occurred'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus ticket.');
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccessMsg(`${label} disalin!`);
      setTimeout(() => setCopySuccessMsg(""), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  if (isLoading || !ticket) {
    return <div className="p-6 text-center text-gray-500 text-sm">Memuat data tiket...</div>;
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {updateSuccessMsg && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{updateSuccessMsg}</span>
        </div>
      )}

      {/* Copy Success Toast */}
      {copySuccessMsg && (
        <div className="fixed top-20 right-4 z-[100] bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 animate-fade-in border border-blue-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
           <span className="text-sm font-bold">{copySuccessMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detail Laporan {id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 tracking-tight">
        
        {/* Kolom Kiri - Info Pelapor & Riwayat */}
        <div className="space-y-6 lg:col-span-1">
          {/* Info Pelapor */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Informasi Pelapor</h2>
            <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Nama Pelapor</label>
                  <input
                    type="text"
                    value={reporter.name}
                    onChange={(e) => setReporter({...reporter, name: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Unit</label>
                  <input
                    type="text"
                    value={reporter.unit}
                    onChange={(e) => setReporter({...reporter, unit: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Hostname</label>
                  <input type="text" readOnly value={ticket.report_hostname || ticket.hostname || '-'} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">IP Address</label>
                  <input
                    type="text"
                    readOnly
                    value={ticket.report_ip || ticket.ip_address || '-'}
                    onClick={() => copyToClipboard(ticket.report_ip || ticket.ip_address, 'IP Address')}
                    title="Klik untuk salin"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2 outline-none transition-shadow cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Remote Address</label>
                  <input
                    type="text"
                    readOnly
                    value={ticket.remote_address || '-'}
                    onClick={() => copyToClipboard(ticket.remote_address, 'Remote Address')}
                    title="Klik untuk salin"
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2 outline-none transition-shadow cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Brand & Model Device</label>
                  <input type="text" readOnly value={`${ticket.report_device_brand || ticket.device_name || ''} ${ticket.report_device_model || ''}`} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2 outline-none transition-shadow" />
                </div>
            </div>
          </div>

          {/* Riwayat Laporan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Log Update</h2>
            <div className="space-y-3">
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                 <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ticket Dibuat</p>
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.created_at}</p>
              </div>
              {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Terakhir Update</p>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.updated_at}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Tengah - Form Informasi Laporan & Update */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Informasi Laporan</h2>
            
            <form className="space-y-4 text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Kategori Gangguan</label>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((c, idx) => (
                        <option key={idx} value={c.category_name}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Jenis Gangguan</label>
                    <div
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex justify-between items-center font-medium text-sm"
                      onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}
                    >
                      <span className={selectedSubCategory ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}>
                        {selectedSubCategory || "-- Pilih Jenis Gangguan --"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {isSubCategoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Cari jenis gangguan..."
                            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            value={subCategorySearchQuery}
                            onChange={(e) => setSubCategorySearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredSubCategories.length > 0) {
                                  handleSelectSubCategory(filteredSubCategories[0].name);
                                }
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          {filteredSubCategories.length > 0 ? (
                            filteredSubCategories.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                                onClick={() => handleSelectSubCategory(s.name)}
                              >
                                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{s.name}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-gray-500 text-center">Jenis gangguan tidak ditemukan</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Deskripsi Tambahan</label>
                  <textarea readOnly rows="2" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none font-medium text-sm resize-none" value={ticket.description || '-'}></textarea>
                </div>
                
                {attachments && attachments.length > 0 && (
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Gambar yang Diupload</label>
                    <div className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg flex gap-4 overflow-x-auto">
                       {attachments.map((att, index) => (
                           <div key={index} className="flex flex-col items-center">
                             <a href={`${API_BASE.replace('/index.php', '')}${att.file_path}`} target="_blank" rel="noreferrer">
                                <img src={`${API_BASE.replace('/index.php', '')}${att.file_path}`} alt="Attachment" className="max-h-24 object-cover border rounded" />
                                <span className="text-xs text-blue-500 hover:text-blue-700">{att.file_name}</span>
                             </a>
                           </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5 space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Update Penyelesaian</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Status</label>
                      <select 
                        value={statusInput} 
                        onChange={(e) => setStatusInput(e.target.value)} 
                        className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-semibold outline-none transition-colors ${getStatusColor(statusInput)}`}
                      >
                         <option value="open" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-medium">Open</option>
                         <option value="process" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-medium">Diproses</option>
                         <option value="done" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-medium">Selesai</option>
                         <option value="on_hold" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-medium">On Hold</option>
                         <option value="cancelled" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-medium">Canceled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Diambil Alih Oleh (Admin)</label>
                      <select value={handledByInput} onChange={(e) => setHandledByInput(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                         <option value="">-- Pilih Admin --</option>
                         {admins.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                         ))}
                      </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Tindakan Khusus(Opsional)</label>
                     <textarea 
                        rows="2" 
                        value={actionTakenInput}
                        onChange={(e) => setActionTakenInput(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Tindakan yang telah atau akan dilakukan..."
                     ></textarea>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-2.5 px-5 rounded-lg transition border border-red-200 dark:border-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus Ticket
                    </button>
                    <button type="button" onClick={handleUpdateTicket} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm">
                      Update Ticket
                    </button>
                  </div>
                </div>
            </form>
        </div>

        {/* Kolom Kanan - Chat */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[600px] lg:h-auto lg:col-span-1">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Direct Message</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chat ke Pelapor</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {messages.length > 0 ? (
                 messages.map((msg, idx) => {
                   const isAdmin = msg.sender_type === 'admin';
                   const timeMatch = msg.created_at.match(/ (\d{2}:\d{2})/);
                   const timeFormatted = timeMatch ? timeMatch[1] + ' WIB' : '';
                   return (
                     <div key={idx} className={`flex flex-col gap-1 max-w-[90%] ${isAdmin ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                       <div className={`p-3 text-sm ${isAdmin ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none'}`}>
                         {msg.message}
                       </div>
                       <span className={`text-[10px] text-gray-400 ${isAdmin ? 'mr-1' : 'ml-1'}`}>
                         {isAdmin ? 'Anda' : (msg.sender_type === 'device' ? 'Pelapor (Device)' : 'Pelapor')} • {timeFormatted}
                       </span>
                     </div>
                   );
                 })
               ) : (
                 <div className="flex flex-col gap-1 items-start max-w-[90%]">
                   <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-2xl rounded-tl-none text-sm">
                     Belum ada obrolan dengan pelapor.
                   </div>
                   <span className="text-[10px] text-gray-400 ml-1">Sistem • Otomatis</span>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input 
                type="text" 
                placeholder="Ketik pesan..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={statusInput === 'cancelled'}
                className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition" 
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || statusInput === 'cancelled'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
        </div>

      </div>

      {/* Modal Konfirmasi Hapus Ticket */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
              <div className="shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Ticket?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin menghapus ticket ini? Semua data laporan dan riwayat terkait ticket ini akan dihapus dari sistem.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTicket}
                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                Oke, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
