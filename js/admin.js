function authAdmin() {
    const pin = document.getElementById('adminPin').value;
    
    const masterPIN = "NZ@Hacker#78699"; 

    if (pin === masterPIN) {
        document.getElementById('adminAuthBox').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        listenToFirebaseData('All');
    } else {
        alert("Access Denied! Incorrect Master PIN.");
    }
}

let activeFilter = 'All';

function filterAdmin(cat) {
    activeFilter = cat;
    listenToFirebaseData(cat);
}

function listenToFirebaseData(filter) {
    const container = document.getElementById('adminReportsContainer');
    container.innerHTML = '<div class="text-cyber-cyan text-sm p-4 col-span-2"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading Live Data from Firebase...</div>';

    if (filter === 'ChatReq') {
        db.collection("chat_requests").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            container.innerHTML = '';
            if (snapshot.empty) {
                container.innerHTML = '<div class="text-gray-400 text-sm col-span-2">Koi Chat Request mojood nahi hai.</div>';
                return;
            }

            snapshot.forEach(doc => {
                const c = doc.data();
                const docId = doc.id;
                container.innerHTML += `
                    <div class="bg-cyber-card border border-pink-500/50 p-5 rounded-2xl space-y-2">
                        <div class="flex justify-between items-center text-xs">
                            <span class="bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded font-bold">Chat Request</span>
                            <span class="text-gray-400 font-mono">${c.time || 'N/A'}</span>
                        </div>
                        <h4 class="text-white font-bold text-base">${c.name}</h4>
                        <p class="text-xs text-cyber-cyan"><i class="fa-brands fa-whatsapp"></i> <a href="https://wa.me/${c.whatsapp}" target="_blank" class="underline">${c.whatsapp}</a> | <b>IP:</b> <span class="text-yellow-400">${c.ip}</span></p>
                        <p class="text-xs text-gray-300 bg-cyber-dark p-2.5 rounded-lg border border-cyber-border"><b>Reason:</b> ${c.reason}</p>
                        <div class="pt-2 flex gap-2 justify-end">
                            <button onclick="deleteFirestoreDoc('chat_requests', '${docId}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg">Delete</button>
                        </div>
                    </div>
                `;
            });
        }, error => {
            console.error("Chat Requests Error: ", error);
            container.innerHTML = '<div class="text-red-400 text-sm col-span-2">Error loading chat requests.</div>';
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
            container.innerHTML = '<div class="text-gray-400 text-sm col-span-2">Is category me koi report nahi mili.</div>';
            return;
        }

        snapshot.forEach(doc => {
            const r = doc.data();
            const docId = doc.id;

            container.innerHTML += `
                <div class="bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 p-5 rounded-2xl space-y-3">
                    <div class="flex justify-between items-center border-b border-cyber-border pb-2 text-xs">
                        <span class="px-2.5 py-1 rounded font-black uppercase tracking-wider ${
                            r.category === 'Blackmailing' ? 'bg-cyber-red/20 text-cyber-red' :
                            r.category === 'Scam' ? 'bg-yellow-400/20 text-yellow-400' : 
                            r.category === 'Order' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-purple-400/20 text-purple-400'
                        }">${r.category}</span>
                        <span class="text-gray-400 font-mono text-[11px]">${r.date || ''}</span>
                    </div>
                    
                    <div class="bg-cyber-dark p-3 rounded-xl border border-cyber-border space-y-1 text-xs">
                        <p class="text-white font-bold">👤 User Name: <span class="text-cyber-cyan">${r.userName}</span></p>
                        <p class="text-cyber-green font-bold">📱 WhatsApp: <a href="https://wa.me/${r.userWhatsapp}" target="_blank" class="underline">${r.userWhatsapp}</a></p>
                        <p class="text-gray-400 font-mono">🌐 IP Address: <span class="text-yellow-400 font-bold">${r.ip}</span></p>
                    </div>

                    <div class="text-xs space-y-1 text-gray-300">
                        ${r.culpritName && r.culpritName !== 'N/A' ? `<p><b>Culprit Name:</b> <span class="text-cyber-red font-semibold">${r.culpritName}</span></p>` : ''}
                        ${r.culpritPhone && r.culpritPhone !== 'N/A' ? `<p><b>Culprit Phone:</b> ${r.culpritPhone}</p>` : ''}
                        ${r.culpritCity && r.culpritCity !== 'N/A' ? `<p><b>Culprit City:</b> ${r.culpritCity}</p>` : ''}
                        ${r.culpritSocial && r.culpritSocial !== 'N/A' ? `<p><b>Social ID:</b> ${r.culpritSocial}</p>` : ''}
                        ${r.scamAmount && r.scamAmount !== 'N/A' ? `<p><b>Scam Amount:</b> PKR ${r.scamAmount}</p>` : ''}
                        ${r.scammerAccount && r.scammerAccount !== 'N/A' ? `<p><b>Scammer Account:</b> ${r.scammerAccount}</p>` : ''}
                        ${r.projectType && r.projectType !== 'N/A' ? `<p><b>Project Type:</b> ${r.projectType}</p>` : ''}
                        
                        <div class="pt-2">
                            <p class="font-bold text-white mb-1">Masla / Details:</p>
                            <p class="p-2.5 bg-cyber-dark rounded-lg border border-cyber-border text-gray-300 leading-relaxed">${r.details}</p>
                        </div>
                        <p class="pt-1 text-[11px] text-yellow-400"><b>Proof / Attachment:</b> ${r.proofFile || 'None'}</p>
                    </div>

                    <div class="pt-2 text-right">
                        <button onclick="deleteFirestoreDoc('reports', '${docId}')" class="text-xs text-red-400 hover:text-red-300 font-bold">
                            <i class="fa-solid fa-trash mr-1"></i> Delete From Firebase
                        </button>
                    </div>
                </div>
            `;
        });
    }, error => {
        console.error("Firestore Listen Error: ", error);
        container.innerHTML = '<div class="text-red-400 text-sm col-span-2">Firebase Database read error! Firestore rules check karein.</div>';
    });
}

async function deleteFirestoreDoc(collectionName, docId) {
    if (confirm("Kya aap waqai is record ko Firebase Database se permanently delete karna chahte hain?")) {
        try {
            await db.collection(collectionName).doc(docId).delete();
            alert("Record permanently deleted from Firebase!");
        } catch (err) {
            console.error("Delete Error: ", err);
            alert("Error deleting record from Firebase.");
        }
    }
}
