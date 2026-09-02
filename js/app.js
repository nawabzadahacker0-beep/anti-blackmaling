const yearEl = document.getElementById('year');
if(yearEl) yearEl.innerText = new Date().getFullYear();

let clientIP = "Unknown";
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
        clientIP = data.ip;
        const ipHeader = document.getElementById('user-ip-header');
        if(ipHeader) ipHeader.innerText = clientIP;
    })
    .catch(() => {
        clientIP = "Masked (Local / VPN)";
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

async function handleFormSubmit(e, category) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // File Validation (10MB limit check)
    const fileInput = form.querySelector('input[type="file"]');
    let proofInfo = "No proof file attached";
    
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 10) {
            alert("⚠️ File ka size 10MB se zyada hai! Baraye mehrbani ye proof direct hamari support email par send karein: nz.helpcenter@gmail.com");
            return;
        } else {
            proofInfo = `${file.name} (${fileSizeMB.toFixed(2)} MB)`;
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
        culpritName: formData.get('culpritName') || 'N/A',
        culpritPhone: formData.get('culpritPhone') || 'N/A',
        culpritCity: formData.get('culpritCity') || 'N/A',
        culpritSocial: formData.get('culpritSocial') || 'N/A',
        scamAmount: formData.get('scamAmount') || 'N/A',
        scammerAccount: formData.get('scammerAccount') || 'N/A',
        projectType: formData.get('projectType') || 'N/A',
        details: formData.get('details') || 'N/A',
        proofFile: proofInfo
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
            submitBtn.innerHTML = `Submit Complaint Now`;
        }
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if(modal) modal.classList.add('hidden');
    window.location.href = 'index.html';
}

// 4. Private Chat Request (Firestore collection: "chat_requests")
async function sendChatRequest(e) {
    e.preventDefault();
    const name = document.getElementById('chatName').value;
    const whatsapp = document.getElementById('chatWhatsapp').value;
    const reason = document.getElementById('chatReason').value;

    const chatReq = {
        requestId: 'CHAT-' + Math.floor(1000 + Math.random() * 9000),
        name: name,
        whatsapp: whatsapp,
        reason: reason,
        ip: clientIP,
        status: 'Pending',
        time: new Date().toLocaleTimeString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("chat_requests").add(chatReq);
        alert("Aapki Chat Request Nawab Zada ke Admin Panel me bhej di gye hai. Jald aapse rabta hoga.");
        e.target.reset();
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Chat Request Error: ", error);
        alert("Request send nahi ho saki. Please check internet connection.");
    }
}
