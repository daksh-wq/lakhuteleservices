// --- FIREBASE IMPORTS (ES Modules) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    updateDoc, 
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAlXi4CSvr07HTbu_bV4EGO59MXVjmHf54",
  authDomain: "lakhuteleservices-1f9e0.firebaseapp.com",
  projectId: "lakhuteleservices-1f9e0",
  storageBucket: "lakhuteleservices-1f9e0.firebasestorage.app",
  messagingSenderId: "855678452910",
  appId: "1:855678452910:web:b0347ec8dfd710104c593f",
  measurementId: "G-K12ZEMY8KK"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get App ID for correct Firestore paths within this environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- PRE-LOADED SCRIPTS (Context-Based for Smart AI) ---
const PRELOADED_SCRIPTS = [
    {
        id: 'script_1',
        name: 'Script 1: Important Info (Mahatvapurn Jankari)',
        content: `
        ROLE: You are Lakhu, a smart and persuasive retention agent for DishTV.
        SITUATION: The customer's connection is about to be PERMANENTLY DISCONNECTED today because they haven't recharged.
        CORE GOAL: Convince the customer to recharge for 200 Rupees TODAY. Not tomorrow, TODAY.
        
        OPENING LINE: "Namaskar! Important information call from DishTV. Sir, your connection is getting permanently disconnected from the company side today. If you want to keep this connection active anytime in the future, a small recharge of 200 rupees is necessary today. So, should I keep the connection active?"

        KEY POINTS TO USE INTELLIGENTLY:
        1. Urgency: If they delay ("Kal karunga", "Sochunga"), tell them it's too late. It closes TODAY. Once closed, it cannot be reopened easily.
        2. Future Value: If they say "Bandh kara do" (Close it), ask if they *might* watch TV in 2-3 months? If yes, they MUST recharge 200 rupees now to keep the ID alive. Otherwise, they'll have to buy a whole new connection later (expensive).
        3. Objection Handling:
           - "Out of Station": "Sir, when you return, the TV won't work because the ID will be dead. Recharge 200 rupees now to save the ID."
           - "TV Kharab hai": "Sir, fix the TV later, but save the connection NOW with 200 rupees. Otherwise, a fixed TV is useless without an active connection."
           - "Money Problem": "Sir, it's just 200 rupees to save your connection from permanent deletion. Please adjust from somewhere."
           - "Other Company": "Keep this as a backup, Sir. Just 200 rupees keeps it active."
        
        TONE: Helpful but Firm about the deadline. Speak natural Hinglish.
        `
    },
    {
        id: 'script_2',
        name: 'Script 2: Last Date (Aaj Aakhri Din)',
        content: `
        ROLE: You are Lakhu, a DishTV agent. 
        SITUATION: Today is the LAST DAY. The deadline is specifically 6:00 PM.
        CORE GOAL: Get a 200 Rupee recharge before 6 PM.
        
        OPENING LINE: "Namaskar! Aaj aakhri din hai. Sir, your DishTV connection is going to be permanently closed today at 6 PM. To keep it active, a small recharge of 200 rupees is required. So, are you recharging?"

        KEY POINTS TO USE INTELLIGENTLY:
        1. The 6 PM Deadline: Use this to create pressure. "Sir, 6 baje ke baad system lock ho jayega."
        2. Indecisive Customers: If they say "Dekhta hu", say "Sir, time kam hai. 6 baje se pehle karwana padega."
        3. Refusals: If they refuse, remind them they are losing the connection forever. "Sir, future mein kabhi bhi TV dekhna ho to aaj 200 ka recharge jaruri hai."
        4. Exams/Kids: If they say kids are studying, say "Exams will end, but this connection won't restart if closed today. Recharge 200 rupees to keep it ready for after exams."
        
        TONE: Urgent. You are giving them a last warning to save their connection. Speak natural Hinglish.
        `
    },
    {
        id: 'script_3',
        name: 'Script 3: Service Call (Chalu Ya Bandh)',
        content: `
        ROLE: You are Lakhu, doing a "Service Call" for DishTV.
        SITUATION: You are checking the customer's final intent. Do they want it ON or OFF?
        CORE GOAL: Force a decision. If they want it ON, they must pay 200 Rupees NOW.
        
        OPENING LINE: "Namaskar, ek service call hai. Sir, do you want to keep your DishTV connection ON or do you want to close it forever?"

        KEY POINTS TO USE INTELLIGENTLY:
        1. Binary Choice: Put the ball in their court. "Chalu rakhna hai ya bandh?"
        2. If "Chalu": "Great, then you must recharge 200 rupees right now. Ho jayega?"
        3. If "Bandh": "Okay, so you want to close it forever? You will never watch TV on this box again? If there is even 1% chance, recharge 200 rupees to keep it safe."
        4. Passive Customers: If they are silent or vague, assume they want to save it. "Sir, risk mat lijiye, 200 ka recharge karke chalu rakhiye."
        
        TONE: Direct and Professional. Speak natural Hinglish.
        `
    },
    {
        id: 'script_4',
        name: 'Script 4: Final Call (Bandh Ho Chuka Hai)',
        content: `
        ROLE: You are Lakhu, DishTV Agent.
        SITUATION: The connection is TECHNICALLY CLOSED/DISCONNECTED already. You are offering a revival.
        CORE GOAL: Revive the dead connection with 200 Rupees.
        
        OPENING LINE: "Namaskar! Ye aakhri call hai. Sir, your DishTV connection has been closed by the company. Do you want to start it again?"

        KEY POINTS TO USE INTELLIGENTLY:
        1. Revival Logic: "Sir, bandh ho chuka hai. Agar chalu karna hai to abhi 200 ka recharge karna padega."
        2. "Why 200?": "To reactivate the closed ID."
        3. "Later": "Sir, aaj final chance hai system mein. Aaj nahi kiya to permanent delete ho jayega."
        4. "Not Interested": "Sure Sir, but just remember, buying a new box costs 2000 rupees. Reviving this costs only 200 rupees."
        
        TONE: Informative and Final. Speak natural Hinglish.
        `
    },
    {
        id: 'script_offer',
        name: 'Script 5: Special Offer (Offer)',
        content: `
        ROLE: You are Lakhu, DishTV Offer Specialist.
        SITUATION: Customer has been inactive. You have a special limited-time offer.
        CORE GOAL: Sell the "6+3 Months Free" or "3+1 Month Free" offer. MINIMUM GOAL: 100 Rupees to keep ID active.
        
        OPENING LINE: "Namaskar! Sir, aapka DishTV connection kuch dino se bandh hai. Are you facing any issues with the service? Hum apki help karna chahte hain."

        KEY POINTS TO USE INTELLIGENTLY:
        1. Empathy First: Listen to their problem (Money, TV broken, Shifted).
        2. The Solution (The Offer): "Sir, we have a great offer today. Pay for 6 months, get 3 months FREE! Or Pay for 3 months, get 1 month FREE."
        3. Downsell (Crucial): If they can't afford the big offer, say: "Koi baat nahi Sir. Kam se kam 100 rupees ka recharge karwa lijiye taaki aapka ID active rahe aur future mein offers milte rahein."
        4. Value Proposition: "Sir, cashback bhi milega single transaction pe."
        
        TONE: Helpful, Friendly, and Exciting (about the offer). Speak natural Hinglish.
        `
    }
];

// --- APP STATE ---
let AppState = {
    view: 'dashboard',
    user: null,
    leads: [],
    campaigns: [],
    logs: [],
    scripts: PRELOADED_SCRIPTS, 
    activeCall: null,
    listeners: [],
    apiKeys: {
        // Pre-filled keys as requested
        gemini: "AIzaSyCkieBuq1FeFRWNhLSS4E9hvyEYd9Us9n0",
        elevenlabs: "de59670d42323e680f07b3c5169072266539c67bab67d0eca48ed56a7a6d17cf"
    }
};

let isCallActive = false;
let isAiSpeaking = false;
let currentAudio = null; // Store audio object globally to control playback

// --- AUTHENTICATION LOGIC ---
window.handleLogin = async (e) => {
    if(e) e.preventDefault();
    const idInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');
    
    if (idInput.value === 'lakhu20' && passInput.value === 'lakhu20') {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            alert("System Error: " + error.message);
        }
    } else {
        alert("Access Denied: Invalid Operator ID");
        passInput.value = '';
    }
};

window.handleLogout = async () => {
    AppState.listeners.forEach(unsubscribe => unsubscribe());
    await signOut(auth);
    location.reload();
};

onAuthStateChanged(auth, (user) => {
    const authScreen = document.getElementById('auth-screen');
    const appShell = document.getElementById('app-shell');
    
    if (user) {
        AppState.user = user;
        authScreen.classList.add('hidden');
        appShell.classList.remove('hidden', 'opacity-0');
        document.getElementById('user-name').innerText = "Operator: lakhu20";
        initializeDataListeners(user.uid);
        window.router('dashboard');
    } else {
        authScreen.classList.remove('hidden');
        appShell.classList.add('hidden', 'opacity-0');
    }
});

// --- DATA SYNC ---
function initializeDataListeners(userId) {
    const userPath = `artifacts/${appId}/users/${userId}`;

    // Leads
    AppState.listeners.push(onSnapshot(query(collection(db, `${userPath}/leads`), orderBy('createdAt', 'desc')), (snapshot) => {
        AppState.leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(AppState.view === 'leads' || AppState.view === 'dashboard') refreshCurrentView();
    }));
    
    // Scripts
    AppState.listeners.push(onSnapshot(query(collection(db, `${userPath}/scripts`), orderBy('createdAt', 'desc')), (snapshot) => {
        const dbScripts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Fallback to preloaded scripts if database is empty to ensure UI always works
        AppState.scripts = dbScripts.length > 0 ? dbScripts : PRELOADED_SCRIPTS;
        if(AppState.view === 'campaigns') refreshCurrentView();
    }));

    // Logs
    AppState.listeners.push(onSnapshot(query(collection(db, `${userPath}/logs`), orderBy('createdAt', 'desc')), (snapshot) => {
        AppState.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(AppState.view === 'dashboard') refreshCurrentView();
    }));
}

function refreshCurrentView() {
    const container = document.getElementById('content-area');
    if(!container) return;
    if (AppState.view === 'dashboard') renderDashboard(container);
    else if (AppState.view === 'campaigns') renderCampaigns(container);
    else if (AppState.view === 'leads') renderLeads(container);
    else if (AppState.view === 'active-call') renderActiveCallPage(container);
}

// --- ROUTING ---
window.router = (view) => {
    AppState.view = view;
    // Update Sidebar UI
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'text-white');
        btn.classList.add('text-slate-400');
    });
    const activeBtn = document.getElementById(`nav-${view}`);
    if(activeBtn) {
        activeBtn.classList.add('bg-slate-800', 'text-white');
        activeBtn.classList.remove('text-slate-400');
    }
    
    const container = document.getElementById('content-area');
    container.innerHTML = '';
    
    if (view === 'dashboard') renderDashboard(container);
    else if (view === 'campaigns') renderCampaigns(container);
    else if (view === 'leads') renderLeads(container);
    else if (view === 'config') renderConfig(container);
    else if (view === 'active-call') renderActiveCallPage(container);
};

// --- VIEWS ---

function renderDashboard(el) {
    const totalCalls = AppState.logs.length;
    const success = AppState.logs.filter(l => l.disposition === 'Converted').length;
    
    el.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in">
            <div class="glass-panel p-5 rounded-xl border-l-4 border-brand-500">
                <div class="text-slate-400 text-xs font-bold uppercase">Total Calls</div>
                <div class="text-3xl font-bold text-white mt-2">${totalCalls}</div>
            </div>
            <div class="glass-panel p-5 rounded-xl border-l-4 border-success">
                <div class="text-slate-400 text-xs font-bold uppercase">Conversions</div>
                <div class="text-3xl font-bold text-white mt-2">${success}</div>
            </div>
            <div class="glass-panel p-5 rounded-xl border-l-4 border-warning">
                <div class="text-slate-400 text-xs font-bold uppercase">System Status</div>
                <div class="text-sm font-bold text-white mt-2">
                    GenArtML Key: <span class="text-success">Active</span><br>
                    Voice Engine: <span class="text-success">Ready (Standard Female)</span>
                </div>
            </div>
            <!-- Main Call Button - Directly opens script selector -->
            <div class="glass-panel p-5 rounded-xl flex items-center justify-center bg-brand-900/20 border border-brand-500/30">
                <button onclick="startGeneralSession()" class="w-full h-full flex flex-col items-center justify-center text-brand-400 hover:text-white transition-colors group">
                    <i class="ph-fill ph-phone-call text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="font-bold">Start Calling Session</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            <!-- Call Logs -->
            <div class="lg:col-span-2 glass-panel rounded-xl p-6">
                <h3 class="text-white font-semibold mb-4">Recent Call Logs</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-400">
                        <thead class="bg-slate-900/50 text-xs uppercase text-slate-500">
                            <tr><th class="p-3">Time</th><th class="p-3">Number</th><th class="p-3">Result</th></tr>
                        </thead>
                        <tbody>
                            ${AppState.logs.slice(0, 5).map(l => `
                                <tr class="border-b border-dark-border">
                                    <td class="p-3">${l.displayTime || 'Just now'}</td>
                                    <td class="p-3 font-mono">${l.number}</td>
                                    <td class="p-3">${l.disposition}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Quick Action: Leads to Call -->
            <div class="glass-panel rounded-xl p-6 flex flex-col">
                <h3 class="text-white font-semibold mb-4 flex justify-between items-center">
                    <span>Pending Calls</span>
                    <button onclick="window.router('leads')" class="text-xs text-brand-400 hover:text-white">View All</button>
                </h3>
                <div class="flex-1 overflow-y-auto space-y-3">
                    ${AppState.leads.filter(l => l.status === 'Pending').slice(0, 5).map(l => `
                        <div class="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-dark-border group hover:border-brand-500/50 transition-all">
                            <div>
                                <div class="text-white text-sm font-medium">${l.name}</div>
                                <div class="text-xs text-slate-500 font-mono">${l.phone}</div>
                            </div>
                            <!-- CALL NOW BUTTON -->
                            <button onclick="openScriptSelector('${l.id}')" class="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-brand-500/20 flex items-center gap-1 text-xs font-bold transition-transform active:scale-95">
                                <i class="ph-fill ph-phone-call"></i> Call Now
                            </button>
                        </div>
                    `).join('')}
                    ${AppState.leads.filter(l => l.status === 'Pending').length === 0 ? '<p class="text-slate-500 text-sm text-center py-4">No pending leads. Start a general session to call manually.</p>' : ''}
                </div>
                <div class="mt-auto pt-4 border-t border-dark-border">
                    <button onclick="openModal('modal-add-lead')" class="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm font-medium">Add Quick Lead</button>
                </div>
            </div>
        </div>
    `;
}

function renderCampaigns(el) {
    el.innerHTML = `
        <div class="fade-in h-full flex flex-col">
            <h2 class="text-xl font-bold text-white mb-6">Available Scripts (Context)</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${AppState.scripts.map(s => `
                    <div class="glass-panel p-6 rounded-xl relative hover:border-brand-500/50 transition-colors">
                        <span class="px-2 py-1 rounded text-xs bg-brand-900 text-brand-400 mb-2 inline-block">Active Strategy</span>
                        <h3 class="text-lg font-bold text-white mb-2">${s.name}</h3>
                        <div class="h-24 overflow-y-auto text-xs text-slate-400 font-mono bg-slate-900/50 p-3 rounded border border-dark-border whitespace-pre-line">
                            ${s.content}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLeads(el) {
    el.innerHTML = `
        <div class="flex flex-col h-full fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-white">Lead Database</h2>
                <div class="flex gap-2">
                    <button onclick="document.getElementById('lead-upload').click()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm border border-dark-border">
                        <i class="ph ph-file-csv mr-1"></i> Import Excel
                    </button>
                    <input type="file" id="lead-upload" accept=".csv,.xlsx" class="hidden" onchange="handleLeadUpload(event)">
                    
                    <button onclick="openModal('modal-add-lead')" class="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        <i class="ph ph-plus mr-1"></i> Add Manual
                    </button>
                </div>
            </div>
            
            <div class="glass-panel rounded-xl overflow-hidden flex-1 flex flex-col">
                <div class="overflow-y-auto flex-1">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-900/80 sticky top-0 backdrop-blur-md z-10 text-xs uppercase text-slate-400">
                            <tr>
                                <th class="p-4">Name</th>
                                <th class="p-4">Phone</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-dark-border text-sm">
                            ${AppState.leads.map(l => `
                                <tr class="hover:bg-slate-800/50 group">
                                    <td class="p-4 text-white font-medium">${l.name}</td>
                                    <td class="p-4 text-slate-400 font-mono">${l.phone}</td>
                                    <td class="p-4"><span class="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">${l.status}</span></td>
                                    <td class="p-4 text-right">
                                        <button onclick="openScriptSelector('${l.id}')" class="bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-brand-500/20 transition-all transform active:scale-95">
                                            Call Now
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderActiveCallPage(el) {
    if(!AppState.activeCall) { window.router('dashboard'); return; } // Fallback to dashboard if no active call
    const { lead, script } = AppState.activeCall;

    el.innerHTML = `
        <div class="h-full flex flex-col fade-in relative">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        Live Call: ${lead.name}
                    </h2>
                    <p class="text-slate-400 font-mono text-sm mt-1">Context: ${script.name}</p>
                </div>
                <div class="flex items-center gap-4">
                    <button onclick="toggleMic()" id="mic-toggle-btn" class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl border border-dark-border flex items-center gap-2 transition-all">
                        <i class="ph-fill ph-microphone text-xl"></i>
                        <span id="mic-status-text">Mic Ready</span>
                    </button>
                    <button onclick="endActiveCall()" class="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center gap-2">
                        <i class="ph-fill ph-phone-disconnect text-xl"></i> End Call
                    </button>
                </div>
            </div>

            <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <!-- Visualizer & AI Status -->
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <div class="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center h-64 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-brand-900/20 pointer-events-none"></div>
                        <div id="ai-status-indicator" class="text-brand-400 font-mono text-xl font-bold mb-4">CONNECTING...</div>
                        <div class="flex items-center gap-1.5 h-24" id="live-waveform">
                            ${Array(30).fill(0).map(() => `<div class="w-2 bg-slate-700 rounded-full h-2 transition-all duration-75"></div>`).join('')}
                        </div>
                    </div>

                    <!-- Transcript -->
                    <div class="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden">
                        <div class="p-4 border-b border-dark-border bg-slate-900/50 text-xs font-bold text-slate-400 uppercase">Live Transcript</div>
                        <div id="live-transcript" class="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
                            <div class="text-slate-500 italic text-center">-- Call Initialized --</div>
                        </div>
                        
                        <!-- Hidden form for speech input logic -->
                        <div class="p-4 bg-slate-900 border-t border-dark-border hidden">
                            <!-- Hidden form as we focus on voice -->
                            <form onsubmit="handleUserResponse(event)" class="flex gap-2">
                                <input type="text" id="user-input" class="hidden"> 
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Script Context Sidebar -->
                <div class="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden border-l border-brand-500/30">
                    <h3 class="text-white font-bold mb-4 flex items-center gap-2"><i class="ph-fill ph-brain text-brand-500"></i> AI Brain Context</h3>
                    <div class="flex-1 overflow-y-auto text-sm text-slate-300 space-y-4 pr-2">
                        <div class="p-3 bg-brand-900/20 border border-brand-500/20 rounded-lg font-mono text-xs whitespace-pre-line">
                            ${script.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Auto-start the conversation with Opening Line
    isCallActive = true;
    setTimeout(() => {
        // Extract opening line or fallback
        let opening = "Namaskar Sir, Lakhu here from DishTV.";
        if(script.content.includes('OPENING:')) {
            opening = script.content.split('OPENING:')[1].split('\n')[0].replace(/"/g, '').trim();
        } else if(script.content.includes('OPENING LINE:')) {
            opening = script.content.split('OPENING LINE:')[1].split('\n')[0].replace(/"/g, '').trim();
        }
        
        addTranscriptBubble("Lakhu (AI)", opening);
        aiSpeak(opening);
    }, 1500);
}

function renderConfig(el) {
    el.innerHTML = `
        <div class="max-w-2xl mx-auto fade-in">
            <h2 class="text-xl font-bold text-white mb-6">System Configuration</h2>
            <div class="glass-panel p-8 rounded-xl space-y-6">
                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-2">GenArtML Key (AI Brain)</label>
                    <input type="password" value="${AppState.apiKeys.gemini}" disabled class="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-2">Voice Engine Key</label>
                    <input type="password" value="${AppState.apiKeys.elevenlabs}" disabled class="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed">
                </div>
            </div>
        </div>
    `;
}

// --- SPEECH RECOGNITION LOGIC (Google Web Speech API) ---
let recognition;

// Check browser support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one sentence to process
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Use Hindi/Indian English for better recognition

    recognition.onstart = function() {
        const btn = document.getElementById('mic-toggle-btn');
        const txt = document.getElementById('mic-status-text');
        if(btn && txt) {
            btn.classList.add('bg-red-500', 'animate-pulse', 'border-red-500');
            btn.classList.remove('bg-slate-800', 'border-dark-border');
            txt.innerText = "Listening...";
        }
        updateAIStatus("LISTENING...", "text-brand-400");
    };

    recognition.onend = function() {
        const btn = document.getElementById('mic-toggle-btn');
        const txt = document.getElementById('mic-status-text');
        if(btn && txt) {
            btn.classList.remove('bg-red-500', 'animate-pulse', 'border-red-500');
            btn.classList.add('bg-slate-800', 'border-dark-border');
            txt.innerText = "Mic Ready";
        }
        
        // Auto-restart logic if call is active and AI is NOT speaking
        if (isCallActive && !isAiSpeaking) {
            // Small delay to prevent tight loops
            setTimeout(() => {
                try { recognition.start(); } catch(e) { /* ignore already started */ }
            }, 500);
        }
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        
        // Auto-send after recognizing
        if(transcript.trim().length > 0) {
            addTranscriptBubble("Customer", transcript);
            processAIResponse(transcript);
        }
    };
    
    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
             stopWaveformAnimation();
             updateAIStatus("MIC ERROR", "text-red-500");
        }
    };
} else {
    console.warn("Speech Recognition API not supported in this browser.");
}

window.toggleMic = () => {
    if (!recognition) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome.");
        return;
    }

    try {
        recognition.start();
    } catch (e) {
        // If already started, stop it
        recognition.stop();
    }
};

// --- LOGIC: ACTIVE CALL (INTELLIGENT AI) ---

// 2. Gemini Logic - ULTRA SMART CONTEXT AWARE
async function processAIResponse(userText) {
    if(!AppState.apiKeys.gemini) {
        addTranscriptBubble("System", "Error: GenArtML Key missing.");
        return;
    }

    updateAIStatus("THINKING...", "text-purple-400");
    
    const { lead, script } = AppState.activeCall;
    
    // SMART PROMPT: Focuses on Context, Goal, and Natural Conversation
    const prompt = `
        You are an expert sales agent named Lakhu for DishTV.
        Your task is to classify the Customer's input and select the EXACT corresponding response from the provided script.
        
        CONTEXT:
        - Customer Name: ${lead.name}
        - Goal: ${script.name}
        - Current Script Context: 
        ${script.content}

        CUSTOMER SAID: "${userText}"

        INSTRUCTIONS:
        1. ANALYZE the customer's input. Identify their INTENT (e.g., Agreement, Refusal, Money Problem, Out of Station, Exam, etc.).
        2. MATCH that intent to the "SCENARIOS & REBUTTALS" in the Script Context above.
        3. OUTPUT strictly the corresponding response based on the script.
        4. IF the customer says something that is NOT in the script (e.g., "Hello", "Who is this?"), answer naturally and politely in Hinglish, then pivot back to the OPENING LINE or GOAL immediately.
        5. DO NOT hallucinate new offers. Stick to 200 rupees or the specific script offers.
        6. SPELLING RULE: Always spell "rupees" fully. Never use "rs" or "₹".
        7. LANGUAGE: Speak in Hinglish (Hindi written in English script) exactly as shown in the script.

        YOUR RESPONSE (Text only, in Hinglish):
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${AppState.apiKeys.gemini}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            let aiText = data.candidates[0].content.parts[0].text;
            
            // STRICT FORMATTING: Force "rupees" spelling (Redundant safety net)
            aiText = aiText.replace(/(\d+)\s*rs/gi, "$1 rupees")
                           .replace(/₹(\d+)/g, "$1 rupees")
                           .replace(/Rs\.?\s*(\d+)/gi, "$1 rupees")
                           .replace(/\*/g, ""); // Remove asterisks if AI adds bolding
            
            addTranscriptBubble("Lakhu (AI)", aiText);
            await aiSpeak(aiText);
        } else {
            console.error("Gemini Error: No candidates found", data);
            addTranscriptBubble("System", "AI failed to generate a response.");
            updateAIStatus("ERROR", "text-red-500");
        }
        
    } catch (error) {
        console.error(error);
        addTranscriptBubble("System", "AI Error: " + error.message);
        updateAIStatus("ERROR", "text-red-500");
    }
}

// 3. ElevenLabs Logic (Humanly Hindi Female Voice)
async function aiSpeak(text) {
    if(!AppState.apiKeys.elevenlabs) {
        addTranscriptBubble("System", "Voice Skipped: Key missing.");
        return;
    }

    isAiSpeaking = true;
    if(recognition) try { recognition.stop(); } catch(e){} // Pause listening while speaking

    updateAIStatus("SPEAKING...", "text-green-400");
    startWaveformAnimation();

    const safeText = text.replace(/(\d+)\s*rs/gi, "$1 rupees")
                         .replace(/₹(\d+)/g, "$1 rupees")
                         .replace(/Rs\.?\s*(\d+)/gi, "$1 rupees");

    // Replaced problematic voice ID with a standard, high-quality ElevenLabs female voice (Sarah/Rachel)
    // This solves the 400 Error and Voice Limit Error by using a standard voice available on most tiers.
    // 'EXAVITQu4vr4xnSDxMaL' is Bella (Standard American, but Multilingual v2 handles Hindi accent well).
    // '21m00Tcm4TlvDq8ikWAM' is Rachel (Standard American).
    // Using Bella for clarity.
    const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; 

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'xi-api-key': AppState.apiKeys.elevenlabs,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: safeText,
                model_id: "eleven_multilingual_v2", // Critical for Hindi support
                voice_settings: { 
                    stability: 0.5,
                    similarity_boost: 0.75, 
                    style: 0.0,           
                    use_speaker_boost: true 
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Provide clear error to user if API fails
            throw new Error(errorData.detail?.message || `API Error: ${response.status}`);
        }

        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error("Received empty audio blob from ElevenLabs");
        }

        currentAudio = new Audio(URL.createObjectURL(blob));
        await currentAudio.play();
        
        currentAudio.onended = () => {
            stopWaveformAnimation();
            isAiSpeaking = false;
            
            // AUTOMATICALLY RESTART LISTENING (Turn-taking)
            if (isCallActive && recognition) {
                 updateAIStatus("LISTENING...", "text-brand-400");
                 try {
                    recognition.start();
                 } catch(e) {
                    // Ignore if already started
                 }
            } else {
                updateAIStatus("WAITING...", "text-slate-400");
            }
        };

    } catch (error) {
        console.error(error);
        addTranscriptBubble("System", "TTS Error: " + error.message);
        stopWaveformAnimation();
        isAiSpeaking = false;
    }
}

// --- SCRIPT & CALL SETUP ---

// NEW: Start a General Session WITHOUT needing pending leads
window.startGeneralSession = () => {
    // Open selector with 'guest' as the lead ID ID to indicate no specific record
    openScriptSelector('guest');
};

window.openScriptSelector = (leadId) => {
    // Check if scripts exist
    if(AppState.scripts.length === 0) {
        alert("System Error: Scripts not loaded.");
        return;
    }

    // Create Modal HTML Dynamically - Updated with Radio Buttons and Continue
    const modalHtml = `
        <div id="modal-script-select" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center fade-in">
            <div class="glass-panel w-full max-w-md rounded-xl p-6">
                <h3 class="text-lg font-bold text-white mb-4">Select Script for Call</h3>
                <div class="space-y-3 max-h-80 overflow-y-auto mb-6 pr-1">
                    ${AppState.scripts.map((s, index) => `
                        <label class="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-dark-border hover:border-brand-500 cursor-pointer transition-all group">
                            <input type="radio" name="script_choice" value="${s.id}" ${index === 0 ? 'checked' : ''} class="mt-1 accent-brand-500">
                            <div>
                                <div class="font-bold text-white group-hover:text-brand-400 text-sm">${s.name}</div>
                                <div class="text-xs text-slate-500 mt-1 line-clamp-2">${s.content.substring(0, 80)}...</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('modal-script-select').remove()" class="flex-1 py-2.5 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                    <button onclick="confirmScriptSelection('${leadId}')" class="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 transition-all transform active:scale-95">Continue</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// NEW: Confirm Selection Helper
window.confirmScriptSelection = (leadId) => {
    const selected = document.querySelector('input[name="script_choice"]:checked');
    if (selected) {
        startCallWithScript(leadId, selected.value);
    } else {
        alert("Please select a script to continue.");
    }
};

window.startCallWithScript = (leadId, scriptId) => {
    let lead;
    
    // Check if it's a guest session or a real lead
    if (leadId === 'guest') {
        lead = {
            id: 'guest',
            name: 'Guest User',
            phone: 'Unknown Number',
            status: 'Guest'
        };
    } else {
        lead = AppState.leads.find(l => l.id === leadId);
    }

    const script = AppState.scripts.find(s => s.id === scriptId);
    
    document.getElementById('modal-script-select').remove();
    
    AppState.activeCall = { lead, script };
    window.router('active-call');
};

window.endActiveCall = async () => {
    // 1. Immediately Stop Audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null; // Clear reference
    }
    stopWaveformAnimation();
    
    // 2. Stop Listening
    isCallActive = false; 
    if(recognition) try{ recognition.stop(); }catch(e){}
    
    const { lead } = AppState.activeCall;
    
    // Log call if user is authenticated and it's a real lead (or we want to log guests too)
    if(AppState.user) {
        await addDoc(collection(db, `artifacts/${appId}/users/${AppState.user.uid}/logs`), {
            number: lead.phone,
            disposition: 'Converted', 
            displayTime: new Date().toLocaleTimeString(),
            createdAt: serverTimestamp()
        });
        
        // Update lead status only if it's a real database lead
        if (lead.id !== 'guest') {
            await updateDoc(doc(db, `artifacts/${appId}/users/${AppState.user.uid}/leads`, lead.id), { status: 'Called' });
        }
    }
    
    AppState.activeCall = null;
    window.router('dashboard');
};

window.handleLeadUpload = (e) => {
    const file = e.target.files[0];
    if(!file || !AppState.user) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        let count = 0;
        
        const batchPromises = [];
        lines.forEach(line => {
            const parts = line.split(',');
            if(parts.length >= 2) {
                const name = parts[0].trim();
                const phone = parts[1].trim();
                if(name && phone) {
                    batchPromises.push(addDoc(collection(db, `artifacts/${appId}/users/${AppState.user.uid}/leads`), {
                        name: name,
                        phone: phone,
                        amount: 'N/A', // Default amount
                        status: 'Pending',
                        createdAt: serverTimestamp()
                    }));
                    count++;
                }
            }
        });

        if(batchPromises.length > 0) {
            await Promise.all(batchPromises);
            alert(`Successfully uploaded ${count} contacts!`);
        } else {
            alert("No valid contacts found. Please use CSV format: Name,Phone");
        }
    };
    reader.readAsText(file);
};

// --- UI HELPERS ---

function addTranscriptBubble(role, text) {
    const container = document.getElementById('live-transcript');
    const isAI = role.includes('AI');
    const isSys = role === 'System';
    
    const div = document.createElement('div');
    div.className = `flex flex-col ${isAI ? 'items-start' : (isSys ? 'items-center' : 'items-end')}`;
    div.innerHTML = `
        <span class="text-xs ${isSys ? 'text-slate-600' : 'text-slate-400'} mb-1">${role}</span>
        <div class="px-4 py-2 rounded-2xl max-w-[80%] ${isAI ? 'bg-brand-900/50 text-brand-100 rounded-tl-none' : (isSys ? 'text-slate-500 italic' : 'bg-slate-700 text-white rounded-tr-none')}">
            ${text}
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function updateAIStatus(msg, colorClass) {
    const el = document.getElementById('ai-status-indicator');
    if(el) {
        el.innerText = `STATUS: ${msg}`;
        el.className = `font-mono text-xl font-bold mb-4 ${colorClass}`;
    }
}

let waveInterval;
function startWaveformAnimation() {
    const bars = document.getElementById('live-waveform').children;
    waveInterval = setInterval(() => {
        Array.from(bars).forEach(bar => {
            bar.style.height = (Math.random() * 2 + 0.5) + 'rem';
            bar.style.opacity = Math.random() * 0.5 + 0.5;
        });
    }, 100);
}

function stopWaveformAnimation() {
    clearInterval(waveInterval);
    const bars = document.getElementById('live-waveform').children;
    Array.from(bars).forEach(bar => {
        bar.style.height = '0.5rem';
        bar.style.opacity = 0.5;
    });
}

// --- MODAL UTILS ---
window.closeModal = (id) => { document.getElementById(id).classList.add('hidden'); };
window.openModal = (id) => { document.getElementById(id).classList.remove('hidden'); };
window.handleSaveLead = async (e) => {
    e.preventDefault();
    if (!AppState.user) return;
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const amount = form.amount.value.trim();

    if (!name || !phone) {
        alert("Please provide both Name and Phone Number.");
        return;
    }

    try {
        await addDoc(collection(db, `artifacts/${appId}/users/${AppState.user.uid}/leads`), {
            name: name,
            phone: phone,
            amount: amount || 'N/A', // Save optional amount if present
            status: 'Pending',
            createdAt: serverTimestamp()
        });
        alert('Lead added successfully!');
        form.reset();
        window.closeModal('modal-add-lead');
    } catch (error) {
        console.error("Error adding lead: ", error);
        alert('Failed to add lead. Please check your connection.');
    }
};
