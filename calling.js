// --- 1. CONFIG & INIT ---
const firebaseConfig = {
    apiKey: "AIzaSyAlXi4CSvr07HTbu_bV4EGO59MXVjmHf54",
    authDomain: "lakhuteleservices-1f9e0.firebaseapp.com",
    projectId: "lakhuteleservices-1f9e0",
    storageBucket: "lakhuteleservices-1f9e0.firebasestorage.app",
    messagingSenderId: "855678452910",
    appId: "1:855678452910:web:b0347ec8dfd710104c593f"
};

let activeCallData = null;
let recognition = null;
let isAiSpeaking = false;
let currentAudio = null;
let savedScripts = {
    1: { title: 'Payment Reminder', content: 'You are an agent. Ask for payment of 450 rupees. Speak in Hindi.' },
    2: { title: 'Upgrade Offer', content: 'Sell HD Pack upgrade. Speak in Hindi.' }
};

// Defer execution until modules are ready
window.onload = async () => {
    // Wait for the firebaseModules to be attached to window by the HTML script block
    if(window.firebaseModules) {
        initApp();
    } else {
        setTimeout(initApp, 500);
    }
};

async function initApp() {
    const { initializeApp, getAuth, onAuthStateChanged, signInAnonymously, getFirestore } = window.firebaseModules;
    
    const app = initializeApp(firebaseConfig);
    window.auth = getAuth(app);
    window.db = getFirestore(app);
    
    // Login Anonymously for Demo
    try {
        await signInAnonymously(window.auth);
    } catch(e) {
        console.error("Auth failed", e);
    }

    onAuthStateChanged(window.auth, (user) => {
        if(user) {
            window.currentUser = user;
            document.getElementById('user-display').innerText = "Operator: " + user.uid.substring(0,5);
            initData();
            checkKeys();
        }
    });

    // Populate Keys from LocalStorage
    document.getElementById('key-gemini').value = localStorage.getItem('np_gemini_key') || '';
    document.getElementById('key-eleven').value = localStorage.getItem('np_elevenlabs_key') || '';
}

// --- 2. SPEECH RECOGNITION (HINDI OPTIMIZED) ---
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; // We want it to stop when user stops speaking to process
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // CRITICAL: HINDI INDIA

    recognition.onstart = () => {
        if(isAiSpeaking) { recognition.stop(); return; } // Safety check
        updateMicUI('listening');
        updateStatus("LISTENING (Hindi)...", "text-brand-400");
    };

    recognition.onend = () => {
        updateMicUI('idle');
        // RESTART LOOP: Only if AI is NOT speaking and Call IS active
        if (!isAiSpeaking && activeCallData) {
            try { recognition.start(); } catch(e) {}
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(transcript.trim()) {
            addBubble("Customer", transcript);
            processGeminiResponse(transcript);
        }
    };
}

// --- 3. CORE FUNCTIONS ---

window.saveKeys = () => {
    const k1 = document.getElementById('key-gemini').value;
    const k2 = document.getElementById('key-eleven').value;
    localStorage.setItem('np_gemini_key', k1);
    localStorage.setItem('np_elevenlabs_key', k2);
    alert("API Keys Saved!");
    checkKeys();
};

function checkKeys() {
    const k1 = localStorage.getItem('np_gemini_key');
    const k2 = localStorage.getItem('np_elevenlabs_key');
    const el = document.getElementById('api-status');
    if(k1 && k2) {
        el.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500"></span> System Ready';
    } else {
        el.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> Missing Keys';
    }
}

// --- 4. DATA LOADING ---
function initData() {
    const { collection, onSnapshot, query, orderBy } = window.firebaseModules;
    // Load Leads
    onSnapshot(query(collection(window.db, `users/${window.currentUser.uid}/leads`), orderBy('createdAt', 'desc')), (snap) => {
        const tbody = document.getElementById('leads-table-body');
        tbody.innerHTML = '';
        if(snap.empty) {
            document.getElementById('empty-state').classList.remove('hidden');
        } else {
            document.getElementById('empty-state').classList.add('hidden');
            snap.forEach(doc => {
                const l = doc.data();
                tbody.innerHTML += `
                    <tr class="hover:bg-white/5 border-b border-white/5 transition-colors">
                        <td class="p-4 text-white font-bold">${l.name}</td>
                        <td class="p-4 text-slate-400 font-mono">${l.phone}</td>
                        <td class="p-4"><span class="px-2 py-1 rounded bg-slate-800 text-xs">${l.status}</span></td>
                        <td class="p-4 text-right">
                            <button onclick="openScriptSelector('${doc.id}', '${l.name}', '${l.phone}')" class="text-brand-400 hover:text-white font-bold text-xs uppercase border border-brand-900/50 hover:bg-brand-600 px-3 py-1.5 rounded transition-all">Call Now</button>
                        </td>
                    </tr>
                `;
            });
        }
    });
}

// --- 5. CALLING FLOW ---
let selectedLead = null;

window.openScriptSelector = (id, name, phone) => {
    selectedLead = { id, name, phone };
    document.getElementById('target-lead-name').innerText = name;
    document.getElementById('modal-select-script').classList.remove('hidden');
    
    // Update Script buttons with current text
    const s1 = document.getElementById('script-1').value;
    const s2 = document.getElementById('script-2').value;
    document.getElementById('btn-desc-1').innerText = s1.substring(0,40)+'...';
    document.getElementById('btn-desc-2').innerText = s2.substring(0,40)+'...';
};

window.launchCall = (slotId) => {
    const scriptContent = document.getElementById(`script-${slotId}`).value;
    const scriptTitle = document.getElementById(`title-script-${slotId}`).value;
    
    activeCallData = {
        ...selectedLead,
        script: scriptContent,
        scriptTitle: scriptTitle
    };
    
    document.getElementById('modal-select-script').classList.add('hidden');
    document.getElementById('modal-active-call').classList.remove('hidden');
    
    document.getElementById('live-lead-name').innerText = activeCallData.name;
    document.getElementById('live-lead-phone').innerText = activeCallData.phone;
    document.getElementById('live-script-name').innerText = activeCallData.scriptTitle;
    document.getElementById('transcript').innerHTML = ''; // clear old
    
    // Init Visualizer Bars
    const wf = document.getElementById('waveform');
    wf.innerHTML = '';
    for(let i=0; i<20; i++) {
        const d = document.createElement('div');
        d.className = "w-1.5 bg-brand-500 rounded-full h-4 transition-all duration-100 wave-bar";
        wf.appendChild(d);
    }
    
    // START CONVERSATION
    setTimeout(() => {
        const opening = `Namaskar ${activeCallData.name} ji. Kya meri awaaz aa rahi hai?`;
        addBubble("AI Agent", opening);
        aiSpeak(opening);
    }, 1000);
};

window.handleManualSend = (e) => {
    e.preventDefault();
    const txt = document.getElementById('user-input').value;
    if(!txt) return;
    addBubble("Operator", txt);
    document.getElementById('user-input').value = '';
    processGeminiResponse(txt); // Send to AI to reply
};

window.saveManualLead = async (e) => {
    e.preventDefault();
    const { addDoc, collection, serverTimestamp } = window.firebaseModules;
    const form = e.target;
    await addDoc(collection(window.db, `users/${window.currentUser.uid}/leads`), {
        name: form.name.value,
        phone: form.phone.value,
        status: 'Pending',
        createdAt: serverTimestamp()
    });
    form.reset();
    document.getElementById('modal-add-lead').classList.add('hidden');
};

// --- 6. AI LOGIC (UPDATED FOR HINDI) ---

async function processGeminiResponse(userText) {
    const key = localStorage.getItem('np_gemini_key');
    if(!key) { addBubble("System", "Error: No Gemini Key"); return; }
    
    updateStatus("THINKING...", "text-purple-400");
    
    // STRICT HINDI PROMPT
    const prompt = `
        You are an Indian Call Center Agent named 'Lakhu'.
        Context: ${activeCallData.script}
        Customer Name: ${activeCallData.name}
        User said: "${userText}"
        
        INSTRUCTIONS:
        1. Reply in HINDI (or Hinglish) ONLY.
        2. Keep it short (1-2 sentences).
        3. Be polite but persuasive.
        4. If the user agrees to pay/recharge, say "Thank you" and end the conversation.
        
        Reply Text:
    `;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        addBubble("AI Agent", aiText);
        aiSpeak(aiText);
        
    } catch(e) {
        console.error(e);
        addBubble("System", "AI Error");
        updateStatus("ERROR", "text-red-500");
    }
}

async function aiSpeak(text) {
    const key = localStorage.getItem('np_elevenlabs_key');
    if(!key) { addBubble("System", "TTS Skipped (No Key)"); return; }
    
    isAiSpeaking = true;
    if(recognition) recognition.stop(); // Stop listening while speaking
    
    updateStatus("SPEAKING...", "text-green-400");
    startWave();
    
    try {
        // USE MULTILINGUAL V2 FOR HINDI
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/TmPeb2hSxdVrThJLywkg`, {
            method: 'POST',
            headers: {
                'xi-api-key': key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2", // FIX: HINDI SUPPORT
                voice_settings: { stability: 0.5, similarity_boost: 0.8 }
            })
        });
        
        const blob = await res.blob();
        currentAudio = new Audio(URL.createObjectURL(blob));
        await currentAudio.play();
        
        currentAudio.onended = () => {
            isAiSpeaking = false;
            stopWave();
            updateStatus("LISTENING...", "text-brand-400");
            
            // AUTO RESTART MIC
            if(recognition && activeCallData) {
                try { recognition.start(); } catch(e){}
            }
        };
        
    } catch(e) {
        console.error(e);
        isAiSpeaking = false;
        stopWave();
    }
}

// --- 7. UTILS ---

window.terminateCall = () => {
    if(currentAudio) currentAudio.pause();
    activeCallData = null;
    isAiSpeaking = false;
    if(recognition) recognition.stop();
    document.getElementById('modal-active-call').classList.add('hidden');
    stopWave();
};

function addBubble(role, text) {
    const box = document.getElementById('transcript');
    const isMe = role === 'Operator' || role === 'Customer';
    box.innerHTML += `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4">
            <span class="text-[10px] uppercase font-bold text-slate-500 mb-1">${role}</span>
            <div class="${isMe ? 'bg-slate-700' : 'bg-brand-900/50 border border-brand-500/20'} px-4 py-2 rounded-lg max-w-[85%] text-sm">
                ${text}
            </div>
        </div>
    `;
    box.scrollTop = box.scrollHeight;
}

function updateStatus(msg, color) {
    const el = document.getElementById('ai-status');
    el.innerText = msg;
    el.className = `text-2xl font-mono font-bold mb-8 ${color}`;
}

function updateMicUI(state) {
    const el = document.getElementById('mic-indicator');
    const txt = document.getElementById('mic-text');
    if(state === 'listening') {
        el.className = "w-3 h-3 rounded-full bg-red-500 animate-pulse";
        txt.innerText = "Listening...";
        txt.className = "text-xs text-red-400 font-bold";
    } else {
        el.className = "w-3 h-3 rounded-full bg-slate-600";
        txt.innerText = "Mic Idle";
        txt.className = "text-xs text-slate-400";
    }
}

let waveInterval;
function startWave() {
    const bars = document.querySelectorAll('.wave-bar');
    waveInterval = setInterval(() => {
        bars.forEach(b => {
            b.style.height = (Math.random() * 4 + 0.5) + 'rem';
        });
    }, 100);
}

function stopWave() {
    clearInterval(waveInterval);
    document.querySelectorAll('.wave-bar').forEach(b => b.style.height = '0.5rem');
}
