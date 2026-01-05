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

// --- PRE-LOADED SCRIPTS (Exact Context from CSVs) ---
const PRELOADED_SCRIPTS = [
    {
        id: 'script_1',
        name: 'Script 1: Important Info (महत्वपूर्ण जानकारी)',
        content: `
        CONTEXT: You are Lakhu, a retention agent.
        GOAL: Get a 200 Rupees recharge commitment to stop permanent disconnection.
        
        OPENING LINE: "महत्वपूर्ण जानकारी का कॉल है। आपका डिशटीवी का कनेक्शन कंपनी में से आज हमेशा के लिए बंध होने जा रहा है। ये कनेक्शन को कभी भी चालू रखना चाहते हो तो आज ही छोटा 200 रुपए का रिचार्ज करवाना जरूरी है, तो रिचार्ज करवा रहे हो तो में कनेक्शन चालु रखु ?"

        SCENARIOS:
        1. Customer says YES/Agree ("Ha", "Ho jayega", "Karva lunga"):
           REPLY: "कितने बजे तक हो जाएगा? आज रिचार्ज करवा लीजियेगा क्योकि आपका कनेक्शन आज बंध हो जायेगा तो फिर से चालु नहीं होगा।"
        
        2. Customer says NO/Close it ("Nahi karvana", "Bandh kara do"):
           REPLY: "२-३ महीने बाद या भविष्य में तो कभी चालू करोगे ना सर? उसके लिए आज ही 200 का रिचार्ज करना जरूरी है तो आप अपनी मरजी से टीवी देख पाओगे।"
        
        3. Customer is Out of Station ("Bahar gaon hu", "Ghar pe nahi hu"):
           REPLY: "सर आपका कनेक्शन आज बंध हो जायेगा तो बाद में आप घर वापस जाओगे तो ये कनेक्शन चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है तो आप अपनी मरजी से टीवी देख पाओगे।"
        
        4. TV Problem ("TV bigad gaya", "Tut gaya"):
           REPLY: "सर आपका कनेक्शन आज बंध हो जायेगा तो बाद में जब आप टीवी लाओगे तो ये कनेक्शन चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है।"
        
        5. Money Problem ("Paise nahi hai"):
           REPLY: "सर अभी कही से एडजस्ट करवा के रिचार्ज करवा लीजिये क्युकी आपका कनेक्शन आज बंध हो जायेगा तो बाद में चालु नहीं होगा।"
        
        6. Other Company ("Dusra le liya", "Jio le liya"):
           REPLY: "सर आपका कनेक्शन आज बंध हो जायेगा तो फिर से चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है। अगर नए कनेक्शन में कोई प्रॉब्लम आये तो ये पुराना कनेक्शन आप यूज कर सकते हो पर रिचार्ज आपको आज ही करना पड़ेगा"
        `
    },
    {
        id: 'script_2',
        name: 'Script 2: Last Date (आज आखरी दिन)',
        content: `
        CONTEXT: You are Lakhu. Today is the LAST DAY. Deadline is 6 PM.
        GOAL: Urgent 200 Rupee recharge before 6 PM.
        
        OPENING LINE: "आज आखरी दिन है । आपका डिशटीवी का कनेक्शन कंपनी में से आज शाम ६ बजे हमेशा के लिए बंध होने जा रहा है। ये कनेक्शन को कभी भी चालू रखना चाहते हो तो आज ही छोटा 200 रुपए का रिचार्ज करवाना जरूरी है, तो रिचार्ज करवा रहे हो तो में कनेक्शन चालु रखु ?"

        SCENARIOS:
        1. Agree ("Ha", "Ho jayega"): "कितने बजे तक हो जाएगा? आज रिचार्ज करवा लीजियेगा क्योकि आपका कनेक्शन आज बंध हो जायेगा तो फिर से चालु नहीं होगा।"
        2. Refuse ("Nahi", "Bandh karo"): "२-३ महीने बाद या भविष्य में तो कभी चालू करोगे ना सर? उसके लिए आज ही 200 का रिचार्ज करना जरूरी है तो आप अपनी मरजी से टीवी देख पाओगे।"
        3. Out of Station: "सर आपका कनेक्शन आज बंध हो जायेगा तो बाद में आप घर वापस जाओगे तो ये कनेक्शन चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है।"
        4. Exams ("Bacho ki exam hai"): "एग्जाम कब तक ख़तम हो जायेंगे? सर आपका कनेक्शन आज बंध हो जायेगा तो बाद में जब एग्जाम ख़तम हो जाएगी तब ये कनेक्शन चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है।"
        `
    },
    {
        id: 'script_3',
        name: 'Script 3: Service Call (चालु या बंध)',
        content: `
        CONTEXT: Service Call to check intent.
        GOAL: Binary choice: Keep ON (200 Rs) or Close Forever.
        
        OPENING LINE: "एक सर्विस कॉल है ,आपके डिशटीवी के कनेक्शन को चालु रखना चाहते हो या हमेशा के लिए बंध कर देना है?"

        SCENARIOS:
        1. Keep ON ("Chalu rakhna hai"): "चालु रखना हे तो अभी २०० रुयपे का रिचार्ज करोगे तो ही कनेक्शन चालू होगा, तो हो जायेगा रिचार्ज ?"
        2. Close IT ("Bandh kara do"): "तो कनेक्शन हमेशा क लिए बंध कर देना है भविष्या में कभी चालू नहीं करोगे? तो कनेक्शा ६ बजे हमेशा क लिए बंध हो जाएगा तो बाद में चालु नहीं होगा अगर आपको कनेक्शन चालू रखना हे तो ६ बजे से पहले २०० रुपए का रिचार्ज करवा लीजियेगा।"
        3. Out of Station: "सर आपका कनेक्शन आज बंध हो जायेगा तो बाद में आप घर वापस जाओगे तो ये कनेक्शन चालु नहीं होगा। कनेक्शन चालू रखना है तो आज ही 200 का रिचार्ज करना जरूरी है।"
        `
    },
    {
        id: 'script_4',
        name: 'Script 4: Final Call (बंध हो चुका है)',
        content: `
        CONTEXT: Final Call. Connection is ALREADY CLOSED.
        GOAL: Reactivation.
        
        OPENING LINE: "ये आखरी कॉल है ,आपका डिशटीवी का कनेक्शन कंपनी से बंध हो चुका है , क्या इसे दोबारा कभी चालु करना चाहते हो ?"

        SCENARIOS:
        1. Start Again ("Ha", "Chalu karna hai"): "चालु रखना हे तो अभी २०० रुयपे का रिचार्ज करोगे तो ही कनेक्शन चालू होगा, तो हो जायेगा रिचार्ज ?"
        2. Close ("Nahi", "Bandh rahne do"): "तो कनेक्शन हमेशा क लिए बंध कर देना है भविष्या में कभी चालू नहीं करोगे? तो कनेक्शा ६ बजे हमेशा क लिए बंध हो जाएगा तो बाद में चालु नहीं होगा अगर आपको कनेक्शन चालू रखना हे तो ६ बजे से पहले २०० रुपए का रिचार्ज करवा लीजियेगा।"
        3. Money Problem: "सर अभी कही से एडजस्ट करवा के रिचार्ज करवा लीजिये क्युकी आपका कनेक्शन आज बंध हो जायेगा तो बाद में चालु नहीं होगा।"
        `
    },
    {
        id: 'script_offer',
        name: 'Script 5: Special Offer (ऑफर)',
        content: `
        CONTEXT: Special Offer Call.
        GOAL: Sell "6+3 Months Free" or "3+1 Month Free". Minimum: 100 Rs to keep ID active.
        
        OPENING LINE: "Namaskar, Sir/Ma’am, Aapka Dish TV connection pichle kuch dino se band hai. Yadi aapko hamari service istemal karne mein koi asuwidha ho rahi hai to Kripya batayein. Hum apki sahayta karne ki poori koshish karenge."

        SCENARIOS:
        1. Interested ("Ha", "Offer batao"): "Offer: ६ पे ३ महीना फ्री या ३ पे १ महीना फ्री या कैशबैक ऑफर. रिचार्ज आपको सिंगल ट्रांसक्शन में करना है. ऑफर सिर्फ आज के लिए है."
        2. Out of Station: "सर आप बहार गांव से कब आने वाले हो? अभी रिचार्ज करवा के आईडी को टेम्पररी डीएक्टिवेट करवा दीजिये। जिसे की आपका आईडी एक्टिवेट हो जाए और आप इस ऑफर का लाभ मिल जाए।"
        3. TV Problem: "टीवी कबतक आ जायेगा? टीवी ठीक हो जाएगा उस के बाद तो सेटटॉपबॉक्स चालु करोगे ना? अभी रिचार्ज करवा के आईडी को टेम्पररी डीएक्टिवेट करवा दीजिये।"
        4. Money Problem: "अभी बहेतरीन ऑफर आया है तो कही से एडजस्ट कर के रिचार्ज करवा लीजीये ताकि आप ये ऑफर का लाभ ले पाए. या अभी सिर्फ १०० रुपये का रिचार्ज करवा दीजीयी जिसे की आपका आईडी एक्टिवेट रहेगा।"
        5. Not Interested: "सर क्या आप मुझे बता सकते हो की किस कारण से आप अभी रिचार्ज नहीं करवा रहे? आप अभी सिर्फ १०० रुपये का रिचार्ज करवा दीजीयी जिसे की आपका आईडी एक्टिवेट रहेगा।"
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
        gemini: "AIzaSyCkieBuq1FeFRWNhLSS4E9hvyEYd9Us9n0",
        elevenlabs: "de59670d42323e680f07b3c5169072266539c67bab67d0eca48ed56a7a6d17cf"
    }
};

let isCallActive = false;
let isAiSpeaking = false;
let currentAudio = null;

// --- AUTHENTICATION ---
window.handleLogin = async (e) => {
    if(e) e.preventDefault();
    const idInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');
    
    if (idInput.value === 'lakhu20' && passInput.value === 'lakhu20') {
        try { await signInAnonymously(auth); } 
        catch (error) { alert("System Error: " + error.message); }
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
    AppState.listeners.push(onSnapshot(query(collection(db, `${userPath}/leads`), orderBy('createdAt', 'desc')), (snapshot) => {
        AppState.leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(AppState.view === 'leads' || AppState.view === 'dashboard') refreshCurrentView();
    }));
    
    AppState.listeners.push(onSnapshot(query(collection(db, `${userPath}/scripts`), orderBy('createdAt', 'desc')), (snapshot) => {
        const dbScripts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        AppState.scripts = dbScripts.length > 0 ? dbScripts : PRELOADED_SCRIPTS;
        if(AppState.view === 'campaigns') refreshCurrentView();
    }));

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
                    GenArtML: <span class="text-success">Active</span><br>
                    Voice: <span class="text-success">Rk0hF1... (Hindi)</span>
                </div>
            </div>
            <div class="glass-panel p-5 rounded-xl flex items-center justify-center bg-brand-900/20 border border-brand-500/30">
                <button onclick="startGeneralSession()" class="w-full h-full flex flex-col items-center justify-center text-brand-400 hover:text-white transition-colors group">
                    <i class="ph-fill ph-phone-call text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="font-bold">Start Calling Session</span>
                </button>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
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
                            <button onclick="openScriptSelector('${l.id}')" class="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-brand-500/20 flex items-center gap-1 text-xs font-bold transition-transform active:scale-95">
                                <i class="ph-fill ph-phone-call"></i> Call Now
                            </button>
                        </div>
                    `).join('')}
                    ${AppState.leads.filter(l => l.status === 'Pending').length === 0 ? '<p class="text-slate-500 text-sm text-center py-4">No pending leads. Start a session to call "Guest".</p>' : ''}
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
                            <tr><th class="p-4">Name</th><th class="p-4">Phone</th><th class="p-4">Status</th><th class="p-4 text-right">Action</th></tr>
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
    if(!AppState.activeCall) { window.router('dashboard'); return; }
    const { lead, script } = AppState.activeCall;

    el.innerHTML = `
        <div class="h-full flex flex-col fade-in relative">
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
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <div class="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center h-64 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-brand-900/20 pointer-events-none"></div>
                        <div id="ai-status-indicator" class="text-brand-400 font-mono text-xl font-bold mb-4">CONNECTING...</div>
                        <div class="flex items-center gap-1.5 h-24" id="live-waveform">
                            ${Array(30).fill(0).map(() => `<div class="w-2 bg-slate-700 rounded-full h-2 transition-all duration-75"></div>`).join('')}
                        </div>
                    </div>
                    <div class="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden">
                        <div class="p-4 border-b border-dark-border bg-slate-900/50 text-xs font-bold text-slate-400 uppercase">Live Transcript</div>
                        <div id="live-transcript" class="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
                            <div class="text-slate-500 italic text-center">-- Call Initialized --</div>
                        </div>
                        <div class="p-4 bg-slate-900 border-t border-dark-border hidden">
                            <form onsubmit="handleUserResponse(event)" class="flex gap-2">
                                <input type="text" id="user-input" class="hidden"> 
                            </form>
                        </div>
                    </div>
                </div>
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
    
    isCallActive = true;
    setTimeout(() => {
        let opening = "Namaskar Sir, kya meri baat " + lead.name + " se ho rahi hai?";
        if(script.content.includes('OPENING LINE:')) {
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

// --- SPEECH RECOGNITION (Google Web Speech API) ---
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';

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
        if (isCallActive && !isAiSpeaking) {
            setTimeout(() => { try { recognition.start(); } catch(e) {} }, 500);
        }
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
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
    console.warn("Speech Recognition API not supported.");
}

window.toggleMic = () => {
    if (!recognition) {
        alert("Speech Recognition not supported. Use Chrome.");
        return;
    }
    try { recognition.start(); } catch (e) { recognition.stop(); }
};

// --- LOGIC: INTELLIGENT AI (Gemini) ---
async function processAIResponse(userText) {
    if(!AppState.apiKeys.gemini) {
        addTranscriptBubble("System", "Error: GenArtML Key missing.");
        return;
    }

    updateAIStatus("THINKING...", "text-purple-400");
    
    const { lead, script } = AppState.activeCall;
    
    const prompt = `
        You are Lakhu, an intelligent retention agent for DishTV.
        GOAL: ${script.name.includes('Offer') ? 'Sell the Offer or get 100 rupees.' : 'Get 200 Rupees recharge commitment TODAY.'}
        
        CONTEXT:
        ${script.content}

        CUSTOMER SAID: "${userText}"

        INSTRUCTIONS:
        1. UNDERSTAND intent (Agreement, Refusal, Excuse).
        2. REPLY IN PURE HINDI (Devanagari script preferred) or clear Hinglish.
        3. DO NOT use English words unless strictly technical (e.g. 'Recharge', 'Connection').
        4. BE NATURAL. Do not repeat lines robotically.
        5. IF they agree: "बहुत बढ़िया सर, २०० रुपये का रिचार्ज अभी कर लीजिये."
        6. IF they refuse: Use the context points to persuade.
        7. SPELL "rupees" fully. Never use symbols.
        
        RESPONSE (Pure Hindi):
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
            aiText = aiText.replace(/(\d+)\s*rs/gi, "$1 rupees").replace(/₹(\d+)/g, "$1 rupees").replace(/Rs\.?\s*(\d+)/gi, "$1 rupees").replace(/\*/g, ""); 
            addTranscriptBubble("Lakhu (AI)", aiText);
            await aiSpeak(aiText);
        } else {
            console.error("Gemini Error", data);
            addTranscriptBubble("System", "AI brain failed to respond.");
            updateAIStatus("ERROR", "text-red-500");
        }
        
    } catch (error) {
        console.error(error);
        addTranscriptBubble("System", "AI Error: " + error.message);
        updateAIStatus("ERROR", "text-red-500");
    }
}

// --- LOGIC: VOICE OUTPUT (ElevenLabs) ---
async function aiSpeak(text) {
    if(!AppState.apiKeys.elevenlabs) {
        addTranscriptBubble("System", "Voice Skipped: Key missing.");
        return;
    }

    isAiSpeaking = true;
    if(recognition) try { recognition.stop(); } catch(e){} 

    updateAIStatus("SPEAKING...", "text-green-400");
    startWaveformAnimation();

    const safeText = text.replace(/(\d+)\s*rs/gi, "$1 rupees").replace(/₹(\d+)/g, "$1 rupees").replace(/Rs\.?\s*(\d+)/gi, "$1 rupees");

    // Primary Voice: Requested by User (Rk0hF1X0z2RQCmWH9SCb - Indian Female)
    const PRIMARY_VOICE_ID = 'Rk0hF1X0z2RQCmWH9SCb';
    // Fallback: Bella (known reliable female voice)
    const FALLBACK_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; 

    async function trySpeak(voiceId) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': AppState.apiKeys.elevenlabs,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: safeText,
                model_id: "eleven_multilingual_v2",
                voice_settings: { 
                    stability: 0.4,
                    similarity_boost: 0.8, 
                    style: 0.5,           
                    use_speaker_boost: true 
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // If 400 or 401, likely issue with voice ID or plan limits -> trigger fallback
            throw new Error(errorData.detail?.message || `API Error: ${response.status}`);
        }
        return await response.blob();
    }

    try {
        let blob;
        try {
            blob = await trySpeak(PRIMARY_VOICE_ID);
        } catch (primaryError) {
            console.warn(`Primary voice failed: ${primaryError.message}. Using fallback.`);
            blob = await trySpeak(FALLBACK_VOICE_ID);
        }

        if (blob.size === 0) throw new Error("Empty audio");

        currentAudio = new Audio(URL.createObjectURL(blob));
        await currentAudio.play();
        
        currentAudio.onended = () => {
            stopWaveformAnimation();
            isAiSpeaking = false;
            if (isCallActive && recognition) {
                 updateAIStatus("LISTENING...", "text-brand-400");
                 try { recognition.start(); } catch(e) {}
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
window.startGeneralSession = () => { openScriptSelector('guest'); };

window.openScriptSelector = (leadId) => {
    if(AppState.scripts.length === 0) {
        alert("System Error: Scripts not loaded.");
        return;
    }
    const modalHtml = `
        <div id="modal-script-select" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center fade-in">
            <div class="glass-panel w-full max-w-md rounded-xl p-6">
                <h3 class="text-lg font-bold text-white mb-4">Select Call Strategy</h3>
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
                    <button onclick="confirmScriptSelection('${leadId}')" class="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 transition-all transform active:scale-95">Start Call</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.confirmScriptSelection = (leadId) => {
    const selected = document.querySelector('input[name="script_choice"]:checked');
    if (selected) startCallWithScript(leadId, selected.value);
    else alert("Please select a strategy.");
};

window.startCallWithScript = (leadId, scriptId) => {
    let lead = (leadId === 'guest') ? { id: 'guest', name: 'Guest User', phone: 'Unknown', status: 'Guest' } : AppState.leads.find(l => l.id === leadId);
    const script = AppState.scripts.find(s => s.id === scriptId);
    document.getElementById('modal-script-select').remove();
    AppState.activeCall = { lead, script };
    window.router('active-call');
};

window.endActiveCall = async () => {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    stopWaveformAnimation();
    isCallActive = false; 
    if(recognition) try{ recognition.stop(); }catch(e){}
    
    if(AppState.user) {
        const { lead } = AppState.activeCall;
        await addDoc(collection(db, `artifacts/${appId}/users/${AppState.user.uid}/logs`), {
            number: lead.phone,
            disposition: 'Converted', 
            displayTime: new Date().toLocaleTimeString(),
            createdAt: serverTimestamp()
        });
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
                        amount: 'N/A', 
                        status: 'Pending',
                        createdAt: serverTimestamp()
                    }));
                    count++;
                }
            }
        });
        if(batchPromises.length > 0) {
            await Promise.all(batchPromises);
            alert(`Uploaded ${count} contacts!`);
        } else {
            alert("No valid contacts found. Use CSV format: Name,Phone");
        }
    };
    reader.readAsText(file);
};

// --- UI HELPERS ---
function addTranscriptBubble(role, text) {
    const container = document.getElementById('live-transcript');
    const isAI = role.includes('AI');
    const div = document.createElement('div');
    div.className = `flex flex-col ${isAI ? 'items-start' : 'items-end'}`;
    div.innerHTML = `
        <span class="text-xs text-slate-400 mb-1">${role}</span>
        <div class="px-4 py-2 rounded-2xl max-w-[80%] ${isAI ? 'bg-brand-900/50 text-brand-100 rounded-tl-none' : 'bg-slate-700 text-white rounded-tr-none'}">
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
    await addDoc(collection(db, `artifacts/${appId}/users/${AppState.user.uid}/leads`), {
        name: form.name.value,
        phone: form.phone.value,
        status: 'Pending',
        createdAt: serverTimestamp()
    });
    window.closeModal('modal-add-lead');
};
