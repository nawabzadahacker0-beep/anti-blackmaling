const yearEl = document.getElementById('year');
if(yearEl) yearEl.innerText = new Date().getFullYear();

let clientIP = "Fetching...";
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
        clientIP = data.ip || "Protected";
        const ipHeader = document.getElementById('user-ip-header');
        if(ipHeader) ipHeader.innerText = clientIP;
    })
    .catch(() => {
        clientIP = "Protected";
        const ipHeader = document.getElementById('user-ip-header');
        if(ipHeader) ipHeader.innerText = clientIP;
    });

const mobileToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if(mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function handleFormSubmit(e, category) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const fileInput = form.querySelector('input[type="file"]');
    let proofBase64 = 'None';
    let proofFileName = '';

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 1.5) {
            alert("⚠️ File ka size 1.5MB se zyada hai. Baraye mehrbani file compress karke upload karein ya direct nz.helpcenter@gmail.com par bhejein.");
            return;
        }

        try {
            proofBase64 = await readFileAsBase64(file);
            proofFileName = file.name;
        } catch (err) {
            console.error("File reading error:", err);
        }
    }

    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting to Secure Database...`;
    }

    const reportItem = {
        reportId: 'NZ-' + Math.floor(100000 + Math.random() * 900000),
        category: category,
        date: new Date().toLocaleString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ip: clientIP,
        userName: formData.get('userName') || 'N/A',
        userWhatsapp: formData.get('userWhatsapp') || 'N/A',
        userEmail: formData.get('userEmail') || 'N/A',
        culpritName: formData.get('culpritName') || 'N/A',
        culpritPhone: formData.get('culpritPhone') || 'N/A',
        culpritCity: formData.get('culpritCity') || 'N/A',
        culpritSocial: formData.get('culpritSocial') || 'N/A',
        scamAmount: formData.get('scamAmount') || 'N/A',
        scammerAccount: formData.get('scammerAccount') || 'N/A',
        projectType: formData.get('projectType') || 'N/A',
        details: formData.get('details') || 'N/A',
        proofFile: proofBase64,
        proofName: proofFileName
    };

    try {
        await db.collection("reports").add(reportItem);
        form.reset();
        const modal = document.getElementById('successModal');
        if(modal) modal.classList.remove('hidden');
    } catch (error) {
        console.error("Firebase Error: ", error);
        alert("Server Error! Complain submit nahi ho saki. Please nz.helpcenter@gmail.com par direct rabta karein.");
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Submit Complaint`;
        }
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if(modal) modal.classList.add('hidden');
    window.location.href = 'index.html';
}

let activeUserChatId = localStorage.getItem('nz_active_chat_id') || null;
let userChatListener = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('chat-owner.html') && activeUserChatId) {
        listenToChatSession(activeUserChatId);
    }
});

async function sendChatRequest(e) {
    e.preventDefault();
    const name = document.getElementById('chatName').value.trim();
    const whatsapp = document.getElementById('chatWhatsapp').value.trim();
    const reason = document.getElementById('chatReason').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Initializing Request...`;
    }

    const chatReq = {
        requestId: 'CHAT-' + Math.floor(1000 + Math.random() * 9000),
        name: name,
        whatsapp: whatsapp,
        reason: reason,
        ip: clientIP,
        status: 'pending',
        time: new Date().toLocaleTimeString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection("chat_requests").add(chatReq);
        activeUserChatId = docRef.id;
        localStorage.setItem('nz_active_chat_id', activeUserChatId);
        listenToChatSession(activeUserChatId);
    } catch (error) {
        console.error("Chat Request Error: ", error);
        alert("Request not send check your internet connection.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Send Chat Request`;
        }
    }
}

function listenToChatSession(docId) {
    const reqFormBox = document.getElementById('chatRequestFormBox');
    const pendingBox = document.getElementById('chatPendingBox');
    const roomBox = document.getElementById('chatRoomBox');

    if (userChatListener) userChatListener();

    userChatListener = db.collection("chat_requests").doc(docId).onSnapshot(doc => {
        if (!doc.exists) {
            localStorage.removeItem('nz_active_chat_id');
            if (pendingBox) pendingBox.classList.add('hidden');
            if (roomBox) roomBox.classList.add('hidden');
            if (reqFormBox) reqFormBox.classList.remove('hidden');
            return;
        }

        const data = doc.data();
        if (data.status === 'pending') {
            if (reqFormBox) reqFormBox.classList.add('hidden');
            if (roomBox) roomBox.classList.add('hidden');
            if (pendingBox) pendingBox.classList.remove('hidden');
        } else if (data.status === 'active') {
            if (reqFormBox) reqFormBox.classList.add('hidden');
            if (pendingBox) pendingBox.classList.add('hidden');
            if (roomBox) roomBox.classList.remove('hidden');
            listenToLiveMessages(docId);
        } else if (data.status === 'blocked') {
            alert("This chat session has been terminated by administrator.");
            localStorage.removeItem('nz_active_chat_id');
            location.reload();
        }
    });
}

function listenToLiveMessages(docId) {
    const msgBox = document.getElementById('userChatMessages');
    if (!msgBox) return;

    db.collection("chat_requests").doc(docId).collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            msgBox.innerHTML = '';
            snapshot.forEach(d => {
                const msg = d.data();
                const isUser = msg.sender === 'user';
                msgBox.innerHTML += `
                    <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'}">
                        <div class="max-w-[80%] p-3 rounded-xl ${isUser ? 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan' : 'bg-cyber-card border border-cyber-border text-slate-200'}">
                            <p class="text-[10px] font-bold text-gray-400 mb-0.5">${isUser ? '👤 You' : '🛡️ Nawab Zada Hacker (Owner)'}</p>
                            <p class="text-xs leading-relaxed break-words">${msg.text}</p>
                        </div>
                    </div>
                `;
            });
            msgBox.scrollTop = msgBox.scrollHeight;
        });
}

async function sendUserChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('userMsgInput');
    const text = input.value.trim();
    if (!text || !activeUserChatId) return;

    input.value = '';
    try {
        await db.collection("chat_requests").doc(activeUserChatId).collection("messages").add({
            sender: 'user',
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (err) {
        console.error("Message send error:", err);
    }
}
