// --- FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, query, orderBy, onSnapshot, 
    doc, updateDoc, setDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAlXi4CSvr07HTbu_bV4EGO59MXVjmHf54",
  authDomain: "lakhuteleservices-1f9e0.firebaseapp.com",
  projectId: "lakhuteleservices-1f9e0",
  storageBucket: "lakhuteleservices-1f9e0.firebasestorage.app",
  messagingSenderId: "855678452910",
  appId: "1:855678452910:web:b0347ec8dfd710104c593f",
  measurementId: "G-K12ZEMY8KK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- STATE ---
let currentUser = null;
let activeCallData = null; // { leadId, leadName, leadPhone, scriptText }
let apiKeys = {
    gemini: localStorage.getItem('np_gemini_key') || '',
    eleven: localStorage.getItem('np_elevenlabs_key') || ''
};
let savedScripts = { 1: {}, 2: {}, 3: {}, 4: {} };

// --- INIT ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-display').innerText = "Operator: lakhu20";
        checkApiStatus();
        loadScripts();
        initLeadListener();
    } else {
        window.location.href = 'index.html'; // Redirect to login if not auth
    }
});

function checkApiStatus() {
    const el = document.getElementById('api-status');
    const hasKeys = apiKeys.gemini && apiKeys.eleven;
    el.innerHTML = hasKeys 
        ? `<span class="w-2 h-2 rounded-full bg-green-500"></span> APIs Ready`
        : `<span class="w-2 h-2 rounded-full bg-red-500"></span> <a href="index.html" class="underline hover:text-white">Configure Keys</a>`;
}

// --- SCRIPT MANAGEMENT ---
async function loadScripts() {
    // We store the 4 slots in a single document 'config/scripts' for the user
    // or separate docs. Let's use separate docs for simplicity.
    // However, user wanted 4 specific slots.
    
    // Attempt to fetch from Firestore users/{uid}/config/scripts
    try {
        const docRef = doc(db, `users/${currentUser.uid}/config`, 'scripts');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            savedScripts = data;
            // Populate UI
            for(let i=1; i<=4; i++) {
                if(data[i]) {
                    document.getElementById(`title-script-${i}`).value = data[i].title || `Slot ${i}`;
                    document.getElementById(`script-${i}`).value = data[i].content || '';
                }
            }
        }
    } catch (e) {
        console.error("Error loading scripts", e);
    }
}

window.saveScript = async (slotId) => {
    const title = document.getElementById(`title-script-${slotId}`).value;
    const content = document.getElementById(`script-${slotId}`).value;
    
    savedScripts[slotId] = { title, content };
    
    // Save to Firestore
    try {
        await setDoc(doc(db, `users/${currentUser.uid}/config`, 'scripts'), savedScripts);
        
        // Visual Feedback
        const btn = document.querySelector(`button[onclick="saveScript(${slotId})"]`);
        const originalText = btn.innerText;
        btn.innerText = "Saved ✓";
        btn.classList.add('bg-green-600', 'text-white');
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('bg-green-600', 'text-white');
        }, 1500);
    } catch (e) {
        alert("Failed to save script: " + e.message);
    }
};

// --- LEAD MANAGEMENT ---
function initLeadListener() {
    const q = query(collection(db, `users/${currentUser.uid}/leads`), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        const tbody = document.getElementById('leads-table-body');
        tbody.innerHTML = '';
        
        if(snapshot.empty) {
            document.getElementById('empty-state').classList.remove('hidden');
        } else {
            document.getElementById('empty-state').classList.add('hidden');
            snapshot.forEach(doc => {
                const lead = doc.data();
                const row = document.createElement('tr');
                row.className = "hover:bg-slate-800/50 group transition-colors border-b border-white/5";
                row.innerHTML = `
                    <td class="p-4 text-white font-medium">${lead.name}</td>
                    <td class="p-4 text-slate-400 font-mono">${lead.phone}</td>
                    <td class="p-4"><span class="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-dark-border">${lead.status || 'Pending'}</span></td>
                    <td class="p-4 text-right">
                        <button onclick="openScriptSelector('${doc.id}', '${lead.name}')" class="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2 ml-auto">
                            <i class="ph-fill ph-phone-call"></i> Call Now
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    });
}

window.openAddLeadModal = () => document.getElementById('modal-add-lead').classList.remove('hidden');

window.saveManualLead = async (e) => {
    e.preventDefault();
    const form = e.target;
    await addDoc(collection(db, `users/${currentUser.uid}/leads`), {
        name: form.name.value,
        phone: form.phone.value,
        status: 'Pending',
        createdAt: serverTimestamp()
    });
    form.reset();
    document.getElementById('modal-add-lead').classList.add('hidden');
};

window.handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const batch = [];
        lines.forEach(line => {
            const [name, phone] = line.split(',');
            if(name && phone) {
                batch.push(addDoc(collection(db, `users/${currentUser.uid}/leads`), {
                    name: name.trim(),
                    phone: phone.trim(),
                    status: 'Pending',
                    createdAt: serverTimestamp()
                }));
            }
        });
        await Promise.all(batch);
        alert(`Uploaded ${batch.length} leads.`);
    };
    reader.readAsText(file);
};

// --- CALLING LOGIC ---

let selectedLeadId = null;

window.openScriptSelector = (leadId, leadName) => {
    selectedLeadId = leadId;
    document.getElementById('target-lead-name').innerText = leadName;
    
    // Update buttons with current script titles
    for(let i=1; i<=4; i++) {
        document.getElementById(`btn-title-${i}`).innerText = savedScripts[i]?.title || `Slot ${i} (Empty)`;
        document.getElementById(`btn-desc-${i}`).innerText = savedScripts[i]?.content?.substring(0, 40) + '...' || 'No script configured';
    }
    
    document.getElementById('modal-select-script').classList.remove('hidden');
};

window.launchCall = async (slotId) => {
    const script = savedScripts[slotId];
    if(!script || !script.content) {
        alert("This slot is empty. Please configure it on the left.");
        return;
    }
    
    document.getElementById('modal-select-script').classList.add('hidden');
    
    // Fetch full lead details
    const leadRef = doc(db, `users/${currentUser.uid}/leads`, selectedLeadId);
    const leadSnap = await getDoc(leadRef);
    const lead = leadSnap.data();
    
    activeCallData = {
        leadId: selectedLeadId,
        leadName: lead.name,
        leadPhone: lead.phone,
        scriptText: script.content,
        scriptName: script.title
    };
    
    // Setup UI
    document.getElementById('live-lead-name').innerText = lead.name;
    document.getElementById('live-lead-phone').innerText = lead.phone;
    document.getElementById('live-script-name').innerText = script.title;
    document.getElementById('transcript').innerHTML = '';
    document.getElementById('modal-active-call').classList.remove('hidden');
    
    // Init Visualizer
    const wf = document.getElementById('waveform');
    wf.innerHTML = '';
    for(let i=0; i<30; i++) {
        const bar = document.createElement('div');
        bar.className = 'w-1.5 bg-slate-700 rounded-full h-4 transition-all duration-75';
        wf.appendChild(bar);
    }
    
    // Start AI Hello
    updateStatus("CONNECTING...", "text-yellow-500");
    setTimeout(() => {
        aiSpeak(`Hello, am I speaking with ${lead.name}?`);
    }, 1500);
};

window.handleUserSpeak = async (e) => {
    e.preventDefault();
    const input = document.getElementById('user-input');
    const text = input.value;
    if(!text) return;
    
    addBubble("Customer", text);
    input.value = '';
    
    // Gemini Call
    await processGeminiResponse(text);
};

async function processGeminiResponse(userText) {
    if(!apiKeys.gemini) {
        addBubble("System", "Error: No Gemini Key");
        return;
    }
    
    updateStatus("THINKING...", "text-purple-400");
    
    const prompt = `
        You are an AI calling agent.
        Script Context: "${activeCallData.scriptText}"
        Customer Name: ${activeCallData.leadName}
        
        Customer said: "${userText}"
        
        Respond naturally as the agent based on the script. Keep it concise.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        addBubble("AI Agent", aiText);
        await aiSpeak(aiText);
    } catch (e) {
        console.error(e);
        addBubble("System", "Gemini Error");
    }
}

async function aiSpeak(text) {
    if(!apiKeys.eleven) {
        addBubble("System", "TTS Skipped (No Key)");
        return;
    }
    
    updateStatus("SPEAKING...", "text-green-400");
    startWave();
    
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKeys.eleven,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 }
            })
        });
        
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
        audio.onended = () => {
            stopWave();
            updateStatus("LISTENING...", "text-brand-400");
        };
    } catch (e) {
        console.error(e);
        stopWave();
    }
}

window.terminateCall = async () => {
    // Save log
    if(activeCallData) {
        await addDoc(collection(db, `users/${currentUser.uid}/logs`), {
            number: activeCallData.leadPhone,
            disposition: 'Completed',
            displayTime: new Date().toLocaleTimeString(),
            createdAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, `users/${currentUser.uid}/leads`, activeCallData.leadId), { status: 'Called' });
    }
    
    document.getElementById('modal-active-call').classList.add('hidden');
    stopWave();
};

// Utils
function addBubble(role, text) {
    const div = document.createElement('div');
    const isAI = role === 'AI Agent';
    div.className = `flex flex-col ${isAI ? 'items-start' : 'items-end'}`;
    div.innerHTML = `
        <span class="text-xs text-slate-500 mb-1">${role}</span>
        <div class="px-3 py-2 rounded-lg max-w-[85%] text-sm ${isAI ? 'bg-brand-900/40 text-brand-100' : 'bg-slate-700 text-white'}">
            ${text}
        </div>
    `;
    document.getElementById('transcript').appendChild(div);
}

function updateStatus(text, color) {
    const el = document.getElementById('ai-status');
    el.innerText = text;
    el.className = `text-2xl font-mono mb-8 font-bold ${color}`;
}

let waveInt;
function startWave() {
    const bars = document.getElementById('waveform').children;
    waveInt = setInterval(() => {
        Array.from(bars).forEach(b => {
            b.style.height = (Math.random() * 4 + 1) + 'rem';
        });
    }, 100);
}
function stopWave() {
    clearInterval(waveInt);
    const bars = document.getElementById('waveform').children;
    Array.from(bars).forEach(b => b.style.height = '1rem');
}
