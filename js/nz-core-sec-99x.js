const MASTER_SEC_KEY = "NZ@Hacker#78699";
let activeFilter = 'All';
let activeChatId = null;
let chatUnsubscribe = null;

function authAdmin() {
    const pin = document.getElementById('adminPin').value.trim();
    if (pin === MASTER_SEC_KEY) {
        document.getElementById('adminAuthBox').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        listenToFirebaseData('All');
    } else {
        alert("Access Denied! Incorrect Master PIN.");
    }
}

function filterAdmin(cat) {
    activeFilter = cat;
    listenToFirebaseData(cat);
}

function listenToFirebaseData(filter) {
    const container = document.getElementById('adminReportsContainer');
    container.innerHTML = `
        <div class="text-cyber-cyan text-sm p-4 col-span-2 flex items-center gap-2">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading secure real-time stream...
        </div>`;

    if (filter === 'ChatReq') {
        db.collection("chat_requests").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            container.innerHTML = '';
            if (snapshot.empty) {
                container.innerHTML = '<div class="text-gray-400 text-sm p-4 col-span-2">Koi Chat Request ya Session mojood nahi hai.</div>';
                return;
            }

            snapshot.forEach(doc => {
                const c = doc.data();
                const docId = doc.id;
                const status = c.status || 'pending'; // pending, active, blocked

                let statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 text-yellow-400 uppercase">Pending Approval</span>`;
                if (status === 'active') {
                    statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-cyber-green uppercase">Active Session</span>`;
                } else if (status === 'blocked') {
                    statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-cyber-red uppercase">Blocked</span>`;
                }

                container.innerHTML += `
                    <div class="bg-cyber-card border ${status === 'active' ? 'border-cyber-green/40' : (status === 'blocked' ? 'border-red-500/30' : 'border-yellow-400/40')} p-5 rounded-2xl space-y-3">
                        <div class="flex justify-between items-center text-xs">
                            <span class="bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded font-bold">Private Chat</span>
                            ${statusBadge}
                        </div>

                        <div>
                            <h4 class="text-white font-bold text-base">${escapeHtml(c.name || 'Anonymous')}</h4>
                            <p class="text-xs text-cyber-cyan">
                                <i class="fa-brands fa-whatsapp mr-1"></i>
                                <a href="https://wa.me/${c.whatsapp}" target="_blank" class="underline">${c.whatsapp || 'N/A'}</a> 
                                | <b class="text-gray-400">IP:</b> <span class="text-yellow-400">${c.ip || 'Hidden'}</span>
                            </p>
                        </div>

                        <div class="text-xs text-gray-300 bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                            <b>Reason / Details:</b> ${escapeHtml(c.reason || 'No description provided')}
                        </div>

                        <div class="pt-2 flex flex-wrap gap-2 justify-end items-center">
                            ${status === 'pending' ? `
                                <button onclick="acceptChatSession('${docId}', '${escapeHtml(c.name || 'User')}', '${c.whatsapp || ''}', '${c.ip || ''}')" class="px-3.5 py-1.5 bg-cyber-green/20 border border-cyber-green hover:bg-cyber-green hover:text-black text-cyber-green font-bold text-xs rounded-lg transition">
                                    <i class="fa-solid fa-check mr-1"></i> Accept & Chat
                                </button>
                            ` : ''}

                            ${status === 'active' ? `
                                <button onclick="openLiveChatTerminal('${docId}', '${escapeHtml(c.name || 'User')}', '${c.whatsapp || ''}', '${c.ip || ''}')" class="px-3.5 py-1.5 bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan hover:text-black text-cyber-cyan font-bold text-xs rounded-lg transition">
                                    <i class="fa-solid fa-comment-dots mr-1"></i> Open Chat
                                </button>
                                <button onclick="changeChatStatus('${docId}', 'blocked')" class="px-3 py-1.5 bg-red-600/20 border border-red-500 text-red-400 font-bold text-xs rounded-lg hover:bg-red-600 hover:text-white transition">
                                    <i class="fa-solid fa-ban mr-1"></i> Block
                                </button>
                            ` : ''}

                            ${status === 'blocked' ? `
                                <button onclick="changeChatStatus('${docId}', 'active')" class="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-bold text-xs rounded-lg hover:bg-yellow-500 hover:text-black transition">
                                    Unblock
                                </button>
                            ` : ''}

                            <button onclick="deleteFirestoreDoc('chat_requests', '${docId}')" class="px-3 py-1.5 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white font-bold text-xs rounded-lg transition">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }, error => {
            console.error("Chat Error:", error);
            container.innerHTML = '<div class="text-red-400 text-sm col-span-2">Chat requests load karte waqt error aya.</div>';
        });
        return;
    }

    let query = db.collection("reports").orderBy("createdAt", "desc");
    if (filter !== 'All') {
        query = db.collection("reports").where("category", "==", filter).orderBy("createdAt", "desc");
    }

    query.onSnapshot(snapshot => {
        container.innerHTML = '';
        if (snapshot.empty) {
            container.innerHTML = '<div class="text-gray-400 text-sm col-span-2 p-4">Is category me koi report darj nahi hai.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const r = doc.data();
            const docId = doc.id;
            const hasProof = (r.proofFile && r.proofFile !== 'None' && r.proofFile !== 'N/A');

            container.innerHTML += `
                <div class="bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 p-5 rounded-2xl space-y-3 transition">
                    <div class="flex justify-between items-center border-b border-cyber-border pb-2 text-xs">
                        <span class="px-2.5 py-1 rounded font-black uppercase tracking-wider ${
                            r.category === 'Blackmailing' ? 'bg-cyber-red/20 text-cyber-red' :
                            r.category === 'Scam' ? 'bg-yellow-400/20 text-yellow-400' : 
                            r.category === 'Order' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-purple-400/20 text-purple-400'
                        }">${escapeHtml(r.category || 'General')}</span>
                        <span class="text-gray-400 font-mono text-[11px]">${r.date || ''}</span>
                    </div>
                    
                    <div class="bg-cyber-dark p-3 rounded-xl border border-cyber-border space-y-1 text-xs">
                        <p class="text-white font-bold">👤 User Name: <span class="text-cyber-cyan">${escapeHtml(r.userName || 'N/A')}</span></p>
                        <p class="text-cyber-green font-bold">📱 WhatsApp: <a href="https://wa.me/${r.userWhatsapp}" target="_blank" class="underline">${escapeHtml(r.userWhatsapp || 'N/A')}</a></p>
                        <p class="text-gray-400 font-mono">🌐 IP Address: <span class="text-yellow-400 font-bold">${escapeHtml(r.ip || 'N/A')}</span></p>
                    </div>

                    <div class="text-xs space-y-1 text-gray-300">
                        ${r.culpritName && r.culpritName !== 'N/A' ? `<p><b>Culprit Name:</b> <span class="text-cyber-red font-semibold">${escapeHtml(r.culpritName)}</span></p>` : ''}
                        ${r.culpritPhone && r.culpritPhone !== 'N/A' ? `<p><b>Culprit Phone:</b> ${escapeHtml(r.culpritPhone)}</p>` : ''}
                        ${r.culpritCity && r.culpritCity !== 'N/A' ? `<p><b>Culprit City:</b> ${escapeHtml(r.culpritCity)}</p>` : ''}
                        ${r.culpritSocial && r.culpritSocial !== 'N/A' ? `<p><b>Social ID:</b> ${escapeHtml(r.culpritSocial)}</p>` : ''}
                        ${r.scamAmount && r.scamAmount !== 'N/A' ? `<p><b>Scam Amount:</b> PKR ${escapeHtml(r.scamAmount)}</p>` : ''}
                        ${r.scammerAccount && r.scammerAccount !== 'N/A' ? `<p><b>Scammer Account:</b> ${escapeHtml(r.scammerAccount)}</p>` : ''}
                        ${r.projectType && r.projectType !== 'N/A' ? `<p><b>Project Type:</b> ${escapeHtml(r.projectType)}</p>` : ''}
                        
                        <div class="pt-2">
                            <p class="font-bold text-white mb-1">Masla / Report Details:</p>
                            <p class="p-2.5 bg-cyber-dark rounded-lg border border-cyber-border text-gray-300 leading-relaxed max-h-32 overflow-y-auto">${escapeHtml(r.details || '')}</p>
                        </div>

                        <div class="pt-3 border-t border-cyber-border flex items-center justify-between">
                            <span class="text-[11px] text-gray-400">Attached Evidence:</span>
                            ${hasProof ? `
                                <button onclick="openDocPreview('${encodeURIComponent(r.proofFile)}')" class="px-3 py-1 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black transition rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <i class="fa-solid fa-eye"></i> View Attachment
                                </button>
                            ` : `<span class="text-gray-500 italic text-xs">No attachment uploaded</span>`}
                        </div>
                    </div>

                    <div class="pt-2 text-right border-t border-cyber-border">
                        <button onclick="deleteFirestoreDoc('reports', '${docId}')" class="text-xs text-red-400 hover:text-red-300 font-bold transition">
                            <i class="fa-solid fa-trash mr-1"></i> Delete From Database
                        </button>
                    </div>
                </div>
            `;
        });
    }, error => {
        console.error("Firestore Listen Error:", error);
        container.innerHTML = '<div class="text-red-400 text-sm col-span-2">Firebase Database read error! Firestore Rules check karein.</div>';
    });
}

function openDocPreview(encodedFile) {
    const fileData = decodeURIComponent(encodedFile);
    const body = document.getElementById('docPreviewBody');
    const downloadBtn = document.getElementById('docDownloadBtn');
    
    downloadBtn.href = fileData;

    if (fileData.startsWith('data:image/') || fileData.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
        body.innerHTML = `<img src="${fileData}" class="max-h-[70vh] rounded-lg border border-cyber-border object-contain" alt="Evidence" />`;
    } else if (fileData.startsWith('data:application/pdf') || fileData.match(/\.pdf($|\?)/i)) {
        body.innerHTML = `<iframe src="${fileData}" class="w-full h-[65vh] rounded-lg border border-cyber-border"></iframe>`;
    } else {
        body.innerHTML = `
            <div class="p-6 text-center space-y-3">
                <i class="fa-solid fa-file-lines text-5xl text-cyber-cyan"></i>
                <p class="text-sm text-gray-300 font-mono break-all">${escapeHtml(fileData)}</p>
            </div>`;
    }

    document.getElementById('docPreviewModal').classList.remove('hidden');
}

function closeDocPreview() {
    document.getElementById('docPreviewModal').classList.add('hidden');
    document.getElementById('docPreviewBody').innerHTML = '';
}

async function acceptChatSession(docId, name, whatsapp, ip) {
    try {
        await db.collection("chat_requests").doc(docId).update({
            status: 'active',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        openLiveChatTerminal(docId, name, whatsapp, ip);
    } catch (err) {
        console.error("Error accepting chat:", err);
        alert("Chat accept karne me error aya.");
    }
}

function openLiveChatTerminal(docId, name, whatsapp, ip) {
    activeChatId = docId;
    document.getElementById('chatTargetName').innerText = `Live Chat with: ${name}`;
    document.getElementById('chatTargetDetails').innerText = `WhatsApp: ${whatsapp} | IP: ${ip}`;
    document.getElementById('liveChatModal').classList.remove('hidden');

    const msgBox = document.getElementById('chatMessagesBox');
    msgBox.innerHTML = '<div class="text-cyber-cyan text-center"><i class="fa-solid fa-spinner fa-spin"></i> Connecting to encrypted session...</div>';

    if (chatUnsubscribe) chatUnsubscribe();

    chatUnsubscribe = db.collection("chat_requests").doc(docId).collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            msgBox.innerHTML = '';
            if (snapshot.empty) {
                msgBox.innerHTML = '<div class="text-gray-500 text-center py-4">No messages yet. Send first message to start conversation.</div>';
                return;
            }

            snapshot.forEach(doc => {
                const m = doc.data();
                const isAdmin = m.sender === 'admin';
                msgBox.innerHTML += `
                    <div class="flex flex-col ${isAdmin ? 'items-end' : 'items-start'}">
                        <div class="max-w-[75%] p-3 rounded-xl ${isAdmin ? 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan' : 'bg-cyber-card border border-cyber-border text-gray-200'}">
                            <p class="text-[10px] font-bold text-gray-400 mb-0.5">${isAdmin ? 'Nawab Zada (Admin)' : '👤 Client'}</p>
                            <p class="text-xs leading-relaxed break-words">${escapeHtml(m.text)}</p>
                        </div>
                    </div>
                `;
            });
            msgBox.scrollTop = msgBox.scrollHeight;
        });
}

async function sendAdminMessage(e) {
    e.preventDefault();
    const input = document.getElementById('adminMsgInput');
    const text = input.value.trim();
    if (!text || !activeChatId) return;

    input.value = '';
    try {
        await db.collection("chat_requests").doc(activeChatId).collection("messages").add({
            sender: 'admin',
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (err) {
        console.error("Message send error:", err);
        alert("Message send nahi ho saka.");
    }
}

async function changeChatStatus(docId, newStatus) {
    try {
        await db.collection("chat_requests").doc(docId).update({
            status: newStatus
        });
        if (newStatus === 'blocked' && activeChatId === docId) {
            closeLiveChatModal();
        }
    } catch (err) {
        console.error("Status update error:", err);
    }
}

async function blockCurrentChat() {
    if (!activeChatId) return;
    if (confirm("Kya aap waqai is user ko block karna chahte hain?")) {
        await changeChatStatus(activeChatId, 'blocked');
    }
}

function closeLiveChatModal() {
    document.getElementById('liveChatModal').classList.add('hidden');
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
    activeChatId = null;
}

async function deleteFirestoreDoc(collectionName, docId) {
    if (confirm("Kya aap waqai is record ko Firebase se permanently delete karna chahte hain?")) {
        try {
            await db.collection(collectionName).doc(docId).delete();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Error deleting record.");
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
