// Global API Configuration
// NOTE: The API key is included here for testing purposes in this environment.
const apiKey = "AIzaSyCBUrMKosIqa_Zg8-6X6jDPp3IV4ABIRQc";
const API_URL_BASE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// Store DFA/NFA data globally after solution
let currentAutomatonData = {};

// --- MOBILE PERFORMANCE OPTIMIZATIONS ---

/**
 * Debounce function to limit how often a function can fire
 * Essential for scroll, resize, and input events on mobile
 */
function debounce(func, wait = 150) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to ensure a function fires at most once per interval
 * Better for events that must fire regularly (like scroll tracking)
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Detect if user is on a mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

/**
 * Request idle callback polyfill for better performance
 */
window.requestIdleCallback = window.requestIdleCallback || function(handler) {
    let startTime = Date.now();
    return setTimeout(function() {
        handler({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50.0 - (Date.now() - startTime));
            }
        });
    }, 1);
};

/**
 * Passive event listener support check and helper
 */
let passiveSupported = false;
try {
    const options = {
        get passive() {
            passiveSupported = true;
            return false;
        }
    };
    window.addEventListener("test", null, options);
    window.removeEventListener("test", null, options);
} catch(err) {
    passiveSupported = false;
}

function getPassiveOption() {
    return passiveSupported ? { passive: true } : false;
}

// --- TOOL-SPECIFIC TIMER SYSTEM ---
// Each tool gets its own independent timer to prevent conflicts when running multiple tools
const toolTimers = {
    dfa: { interval: null, startTime: null },
    nfa: { interval: null, startTime: null },
    dfamin: { interval: null, startTime: null },
    re: { interval: null, startTime: null },
    cfg: { interval: null, startTime: null },
    pda: { interval: null, startTime: null },
    lba: { interval: null, startTime: null },
    tm: { interval: null, startTime: null },
    moore: { interval: null, startTime: null },
    mealy: { interval: null, startTime: null },
    nfatodfa: { interval: null, startTime: null },
    pythonCode: { interval: null, startTime: null },
    formalLanguage: { interval: null, startTime: null },
    testCases: { interval: null, startTime: null }
};

/**
 * Start a timer specific to a tool
 * @param {string} toolName - 'pythonCode', 'formalLanguage', or 'testCases'
 */
function startToolTimer(toolName) {
    // Clear any existing timer for this tool
    if (toolTimers[toolName].interval) {
        clearInterval(toolTimers[toolName].interval);
        toolTimers[toolName].interval = null;
    }

    toolTimers[toolName].startTime = performance.now();
    
    // Find the element for this tool's timer
    const modalContent = document.getElementById('code-modal-content');
    let timerElement = modalContent?.querySelector(`[data-timer="${toolName}"]`);
    
    if (!timerElement) {
        // Create timer element if it doesn't exist
        timerElement = document.createElement('div');
        timerElement.setAttribute('data-timer', toolName);
        timerElement.className = 'text-sm text-gray-600 dark:text-gray-400 mt-2';
        if (modalContent) {
            modalContent.appendChild(timerElement);
        }
    }
    
    toolTimers[toolName].element = timerElement;

    // Start interval for this tool
    toolTimers[toolName].interval = setInterval(() => {
        const elapsed = (performance.now() - toolTimers[toolName].startTime) / 1000;
        if (toolTimers[toolName].element) {
            toolTimers[toolName].element.textContent = `⏱️ ${toolName}: ${elapsed.toFixed(2)}s`;
        }
    }, 500); // Update every 500ms
}

/**
 * Stop a specific tool's timer
 * @param {string} toolName - 'pythonCode', 'formalLanguage', or 'testCases'
 */
function stopToolTimer(toolName) {
    if (toolTimers[toolName].interval) {
        clearInterval(toolTimers[toolName].interval);
        toolTimers[toolName].interval = null;
    }
    if (toolTimers[toolName].element) {
        toolTimers[toolName].element.textContent = `✅ ${toolName}: Complete`;
    }
}

/**
 * Stop all tool timers
 */
function stopAllToolTimers() {
    Object.keys(toolTimers).forEach(toolName => {
        stopToolTimer(toolName);
    });
}

// --- Theme Toggle Function ---
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const sunIconDesktop = document.getElementById('sun-icon-desktop');
    const moonIconDesktop = document.getElementById('moon-icon-desktop');
    const homeButton = document.querySelector('a[href="#home"][onclick="navigate(\'home\')"]');
    const menuButton = document.getElementById('mobile-menu-toggle');
    const homeSvg = homeButton?.querySelector('svg');
    const menuSvg = menuButton?.querySelector('svg');
    const homePage = document.getElementById('home-page');
    const moduleCardLinks = document.querySelectorAll('.module-card-link');
    const theoryCards = document.querySelectorAll('.theory-card');
    const moduleGridTitle = document.querySelector('.module-grid-title');
    
    // Toggle the visibility of the sun/moon icons (Mobile)
    sunIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('hidden', !isDark);
    
    // Toggle the visibility of the sun/moon icons (Desktop)
    if (sunIconDesktop) sunIconDesktop.classList.toggle('hidden', isDark);
    if (moonIconDesktop) moonIconDesktop.classList.toggle('hidden', !isDark);

    if (isDark) {
        localStorage.setItem('theme', 'dark');
        // Apply dark classes to home page for futuristic look
        homePage.classList.add('bg-gray-950', 'text-white', 'dark-mode'); 
        homePage.classList.remove('bg-white', 'text-black'); 
        // Apply dark classes to module/theory cards
        moduleCardLinks.forEach(card => card.classList.add('futuristic-module'));
        theoryCards.forEach(card => {
            card.classList.add('bg-gray-800/80', 'border-gray-700');
            card.classList.remove('bg-F9FAFB', 'border-E5E7EB');
        });
        moduleGridTitle.classList.add('border-gray-800');
        moduleGridTitle.classList.remove('border-D1D5DB');
        
        // Update navbar mobile icons for dark theme (light gray stroke)
        if (homeSvg) {
            homeSvg.setAttribute('stroke', '#d1d5db');
        }
        if (menuSvg) {
            menuSvg.setAttribute('stroke', '#d1d5db');
        }

    } else {
        localStorage.setItem('theme', 'light');
        // Apply light classes to home page for elegant look
        homePage.classList.remove('bg-gray-950', 'text-white', 'dark-mode');
        homePage.classList.add('bg-white', 'text-black');
        // Apply light classes to module/theory cards
        moduleCardLinks.forEach(card => card.classList.remove('futuristic-module'));
        theoryCards.forEach(card => {
            card.classList.remove('bg-gray-800/80', 'border-gray-700');
            card.classList.add('bg-F9FAFB', 'border-E5E7EB');
        });
        moduleGridTitle.classList.remove('border-gray-800');
        moduleGridTitle.classList.add('border-D1D5DB');
        
        // Update navbar mobile icons for light theme (black stroke)
        if (homeSvg) {
            homeSvg.setAttribute('stroke', '#000000');
        }
        if (menuSvg) {
            menuSvg.setAttribute('stroke', '#000000');
        }
    }
    
    // Re-render visualization when theme changes to update SVG colors
    const currentHash = window.location.hash.substring(1);
    if (['dfa', 'nfa', 'dfamin'].includes(currentHash)) {
        const dataKey = (currentHash === 'dfamin' ? 'dfa' : currentHash);
        const data = currentAutomatonData[dataKey];
        if (data) {
            visualizeAutomaton(data, getElements(currentHash));
        }
    }
}

// Apply theme on load
function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const homeButton = document.querySelector('a[href="#home"][onclick="navigate(\'home\')"]');
    const menuButton = document.getElementById('mobile-menu-toggle');
    const homeSvg = homeButton?.querySelector('svg');
    const menuSvg = menuButton?.querySelector('svg');
    const homePage = document.getElementById('home-page');
    const moduleCardLinks = document.querySelectorAll('.module-card-link');
    const theoryCards = document.querySelectorAll('.theory-card');
    const moduleGridTitle = document.querySelector('.module-grid-title');


    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
        homePage.classList.add('bg-gray-950', 'text-white', 'dark-mode');
        homePage.classList.remove('bg-white', 'text-black');
        moduleCardLinks.forEach(card => card.classList.add('futuristic-module'));
        theoryCards.forEach(card => {
            card.classList.add('bg-gray-800/80', 'border-gray-700');
            card.classList.remove('bg-F9FAFB', 'border-E5E7EB');
        });
        moduleGridTitle.classList.add('border-gray-800');
        moduleGridTitle.classList.remove('border-D1D5DB');
        
        // Apply dark theme colors to mobile navbar icons (light gray stroke)
        if (homeSvg) {
            homeSvg.setAttribute('stroke', '#d1d5db');
        }
        if (menuSvg) {
            menuSvg.setAttribute('stroke', '#d1d5db');
        }

    } else {
        document.body.classList.remove('dark');
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
        homePage.classList.remove('bg-gray-950', 'text-white', 'dark-mode');
        homePage.classList.add('bg-white', 'text-black');
         moduleCardLinks.forEach(card => card.classList.remove('futuristic-module'));
         theoryCards.forEach(card => {
            card.classList.remove('bg-gray-800/80', 'border-gray-700');
            card.classList.add('bg-F9FAFB', 'border-E5E7EB');
        });
        moduleGridTitle.classList.remove('border-gray-800');
        moduleGridTitle.classList.add('border-D1D5DB');
        
        // Apply light theme colors to mobile navbar icons (black stroke)
        if (homeSvg) {
            homeSvg.setAttribute('stroke', '#000000');
        }
        if (menuSvg) {
            menuSvg.setAttribute('stroke', '#000000');
        }
    }
}

// ========================================
// MOBILE MENU FUNCTIONS
// ========================================

/**
 * Toggle mobile menu drawer visibility
 */
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) {
        drawer.classList.toggle('hidden');
    }
}

/**
 * Close mobile menu drawer
 */
function closeMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) {
        drawer.classList.add('hidden');
    }
}

/**
 * Toggle dropdown menus in mobile drawer
 * @param {string} dropdown - 'home' or 'language'
 */
function toggleMobileDropdown(dropdown) {
    if (dropdown === 'home') {
        const content = document.getElementById('home-dropdown-content');
        const icon = document.getElementById('home-dropdown-icon');
        const isHidden = content.classList.contains('hidden');
        
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    } else if (dropdown === 'language') {
        const content = document.getElementById('language-dropdown-content');
        const icon = document.getElementById('lang-dropdown-icon');
        const isHidden = content.classList.contains('hidden');
        
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
    }
}

/**
 * Populate mobile language list
 */
function populateMobileLangList() {
    const mobileList = document.getElementById('mobile-lang-list');
    if (!mobileList) return;
    
    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'zh', name: '中文', flag: '🇨🇳' }
    ];
    
    const currentLang = localStorage.getItem('language') || 'en';
    
    mobileList.innerHTML = languages.map(lang => `
        <button class="lang-item ${lang.code === currentLang ? 'active' : ''}" onclick="changeLanguage('${lang.code}'); closeMobileMenu();">
            <span>${lang.flag}</span> ${lang.name}
        </button>
    `).join('');
}

/* -----------------------
   Language selector / i18n
   ----------------------- */
(function(){
    const LANG_KEY = 'site-lang';
    const languages = [
        { code: 'en', name: 'English', country: 'Global', flag: '🇺🇳' },
        { code: 'es', name: 'Español', country: 'Spain/Latin America', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', country: 'France', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', country: 'Germany', flag: '🇩🇪' },
        { code: 'zh', name: '中文 (简体)', country: 'China', flag: '🇨🇳' },
        { code: 'ar', name: 'العربية', country: 'Arab World', flag: '🇸🇦' },
        { code: 'ru', name: 'Русский', country: 'Russia', flag: '🇷🇺' },
        { code: 'pt', name: 'Português', country: 'Portugal/Brazil', flag: '🇵🇹' },
        { code: 'hi', name: 'हिन्दी', country: 'India', flag: '🇮🇳' },
        { code: 'ja', name: '日本語', country: 'Japan', flag: '🇯🇵' }
    ];

    const translations = {
        en: {
            'logo.title':'Automata Wizard 🪄',
            'nav.home':'Home',
            'nav.language':'Language',
            'home.title':'AUTOMATA ENGINE',
            'home.subtitle':'Solve, visualize, and generate code for the entire Chomsky Hierarchy with AI precision.',
            'module.toolbox':'Toolbox Modules',
            'module.chomsky':'Chomsky Hierarchy & Theory',
            'module.dfa.desc':'Regular Language',
            'module.nfa.desc':'Non-Deterministic',
            'module.dfamin.desc':'Optimization',
            'module.re.desc':'Pattern Matching',
            'module.cfg.desc':'Context-Free',
            'module.pda.desc':'Stack Automata',
            'module.lba.desc':'Context-Sensitive',
            'module.tm.desc':'Turing Completeness',
            'theory.type3.title':'Type 3: Regular Languages',
            'theory.type3.desc':'Recognized by DFAs and NFAs. These are the simplest, defining patterns like fixed lengths or required substrings. They rely on limited memory (finite states).',
            'theory.type2.title':'Type 2: Context-Free Languages',
            'theory.type2.desc':'Recognized by PDAs and generated by CFGs. They allow for nested and recursive structures, crucial for parsing programming languages and structured data.',
            'theory.type1.title':'Type 1: Context-Sensitive Languages',
            'theory.type1.desc':'Recognized by LBAs. The grammar rules depend on the context of symbols, leading to highly structured languages.',
            'theory.type0.title':'Type 0: Recursively Enumerable',
            'theory.type0.desc':'The most powerful class, recognized by Turing Machines. Can compute anything computable by modern algorithms, including functions and complex decision problems.',
            'theory.ai.title':'AI-Powered Analysis',
            'theory.ai.desc':'Leveraging the Gemini API to instantly solve complex theoretical problems, provide formal definitions, and generate step-by-step computation traces and runnable code.',
            'cta.start':'Start Computation',
            'flyout.title':'🎯 Select Your Tool',
            'flyout.choose':'Choose language',
            'label.selectTool':'Select Tool',
            
            // Common solver UI
            'common.refined':'Refined Query:',
            'common.formal':'Formal Definition (M)',
            'common.transition':'Transition Table (δ)',
            'common.gencode':'✨ Generate Python Code',
            'common.genlang':'✨ Generate Formal Language',
            'common.gentest':'✨ Generate Test Cases',
            'common.flowchart':'Flow Chart (State Diagram)',
            'common.error':'Error:',

            // DFA
            'dfa.title':'DFA Solver - Deterministic Finite Automata',
            'dfa.prompt':'Design Prompt:',
            'dfa.placeholder':'e.g., Design a DFA for the language of all strings over {a, b} with an even number of a\'s.',
            'dfa.solve':'Solve & Visualize DFA',
            'dfa.generating':'Generating DFA structure...',
            'dfa.vizplace':'Enter your query above and click "Solve & Visualize DFA" to get started!',

            // NFA
            'nfa.title':'NFA Solver - Non-deterministic Finite Automata',
            'nfa.prompt':'NFA Design Prompt (Supports ε-transitions in the prompt):',
            'nfa.placeholder':'e.g., Design an NFA for the language (a*b | c*)*',
            'nfa.solve':'Solve & Visualize NFA',
            'nfa.generating':'Generating NFA structure...',
            'nfa.vizplace':'Enter your query above and click "Solve & Visualize NFA" to get started!',

            // DFA Minimization
            'dfamin.title':'DFA Minimizer - Optimize Finite Automata',
            'dfamin.prompt':'DFA Description for Minimization:',
            'dfamin.placeholder':'e.g., Minimize the DFA with states {q0, q1, q2, q3}, alphabet {0, 1}, start q0, final {q2}, ...',
            'dfamin.solve':'Minimize & Visualize DFA',
            'dfamin.generating':'Generating Minimized DFA...',
            'dfamin.formal':'Minimized Formal Definition (M\')',
            'dfamin.transition':'Transition Table (δ\')',
            'dfamin.flowchart':'Minimized Flow Chart (State Diagram)',

            // Regular Expression
            're.title':'Regular Expression Solver - Regex Generator',
            're.prompt':'Language Description Prompt:',
            're.placeholder':'e.g., Generate a Regular Expression for all strings over {0,1} that start with 0 and end with 1.',
            're.solve':'Generate Regular Expression',
            're.generating':'Generating Regular Expression...',
            're.result':'Resulting Regular Expression (𝘳)',
            're.vistree':'Visual Syntax Tree (Generated Structure)',
            're.vizplace':'Visualization will appear here (formatted text structure).',

            // CFG
            'cfg.title':'Context-Free Grammar Solver - CFG Generator',
            'cfg.prompt':'Language Description Prompt:',
            'cfg.placeholder':'e.g., Generate a CFG for the language {a^n b^n | n ≥ 0}',
            'cfg.solve':'Generate CFG',
            'cfg.generating':'Generating CFG...',
            'cfg.formal':'Formal Definition (G)',
            'cfg.production':'Production Rules (𝙋)',
            'cfg.vistree':'Visual Syntax Tree (Sample Derivation)',
            'cfg.vizplace':'Visualization will appear here (formatted text structure).',

            // PDA
            'pda.title':'PDA Designer - Pushdown Automata',
            'pda.prompt':'PDA Design Prompt:',
            'pda.placeholder':'e.g., Design a PDA for the language {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Test String for Trace:',
            'pda.testplaceholder':'e.g., 0011',
            'pda.solve':'Solve & Display PDA',
            'pda.generating':'Generating PDA structure...',
            'pda.formal':'Formal Definition (M)',
            'pda.transition':'Transitions ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Sample Computation Trace (Stack/State)',
            'pda.vizplace':'Enter a test string and click "Solve & Display PDA" to generate the step-by-step trace.',

            // LBA
            'lba.title':'LBA Designer - Linear Bounded Automata (Context-Sensitive)',
            'lba.prompt':'Context-Sensitive Grammar (CSG) or LBA Prompt:',
            'lba.placeholder':'e.g., Generate a CSG for the language {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Test String for Trace:',
            'lba.testplaceholder':'e.g., aabbcc',
            'lba.solve':'Generate LBA/CSG Solution',
            'lba.generating':'Generating LBA/CSG structure...',
            'lba.formal':'Formal Definition (G)',
            'lba.production':'Context-Sensitive Production Rules (𝙋)',
            'lba.vistree':'Visual Syntax Tree (Sample Derivation)',
            'lba.vizplace':'Visualization will appear here (formatted text structure).',

            // TM
            'tm.title':'TM Simulator - Turing Machine',
            'tm.prompt':'Turing Machine Design Prompt:',
            'tm.placeholder':'e.g., Design a TM that decides the language {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'Input for Tape Trace (e.g., input string):',
            'tm.testplaceholder':'e.g., 101',
            'tm.solve':'Solve & Simulate TM',
            'tm.generating':'Generating TM structure...',
            'tm.formal':'Formal Definition (M)',
            'tm.transition':'Transitions ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Sample Tape Trace (Step-by-Step Simulation)',
            'tm.vizplace':'Enter a test string and click "Solve & Simulate TM" to generate the tape trace.'
        },
        es: {
            'logo.title':'Asistente de Autómatas 🪄',
            'nav.home':'Inicio',
            'nav.language':'Idioma',
            'home.title':'MOTOR DE AUTÓMATAS',
            'home.subtitle':'Resuelve, visualiza y genera código para toda la Jerarquía de Chomsky con precisión de IA.',
            'module.toolbox':'Módulos de Herramientas',
            'module.chomsky':'Jerarquía de Chomsky y Teoría',
            'module.dfa.desc':'Lenguaje Regular',
            'module.nfa.desc':'No Determinístico',
            'module.dfamin.desc':'Optimización',
            'module.re.desc':'Coincidencia de Patrones',
            'module.cfg.desc':'Libre de Contexto',
            'module.pda.desc':'Autómata de Pila',
            'module.lba.desc':'Sensible al Contexto',
            'module.tm.desc':'Completitud de Turing',
            'theory.type3.title':'Tipo 3: Lenguajes Regulares',
            'theory.type3.desc':'Reconocidos por DFA y NFA. Son los más simples, definiendo patrones como longitudes fijas o subcadenas requeridas. Dependen de memoria limitada (estados finitos).',
            'theory.type2.title':'Tipo 2: Lenguajes Libres de Contexto',
            'theory.type2.desc':'Reconocidos por PDA y generados por CFG. Permiten estructuras anidadas y recursivas, cruciales para analizar lenguajes de programación y datos estructurados.',
            'theory.type1.title':'Tipo 1: Lenguajes Sensibles al Contexto',
            'theory.type1.desc':'Reconocidos por LBA. Las reglas gramaticales dependen del contexto de los símbolos, lo que lleva a lenguajes altamente estructurados.',
            'theory.type0.title':'Tipo 0: Recursivamente Enumerable',
            'theory.type0.desc':'La clase más poderosa, reconocida por Máquinas de Turing. Puede calcular cualquier cosa computable por algoritmos modernos, incluidas funciones y problemas de decisión complejos.',
            'theory.ai.title':'Análisis Potenciado por IA',
            'theory.ai.desc':'Aprovechando la API de Gemini para resolver instantáneamente problemas teóricos complejos, proporcionar definiciones formales y generar trazas de cálculo paso a paso y código ejecutable.',
            'cta.start':'Iniciar Cómputo',
            'flyout.title':'🎯 Selecciona tu herramienta',
            'flyout.choose':'Elige idioma',
            'label.selectTool':'Seleccionar herramienta',
            'common.refined':'Consulta refinada:',
            'common.formal':'Definición formal (M)',
            'common.transition':'Tabla de transiciones (δ)',
            'common.gencode':'✨ Generar código Python',
            'common.genlang':'✨ Generar lenguaje formal',
            'common.gentest':'✨ Generar casos de prueba',
            'common.flowchart':'Diagrama de estados (Flujo)',
            'common.error':'Error:',
            'dfa.title':'Solucionador DFA - Autómatas Finitos Deterministas',
            'dfa.prompt':'Indicación de diseño:',
            'dfa.placeholder':'p. ej., Diseña un DFA para el lenguaje de todas las cadenas sobre {a, b} con un número par de a\'s.',
            'dfa.solve':'Resolver y visualizar DFA',
            'dfa.generating':'Generando estructura del DFA...',
            'dfa.vizplace':'Ingresa tu consulta arriba y haz clic en "Resolver y visualizar DFA" para comenzar.',
            'nfa.title':'Solucionador NFA - Autómatas Finitos No Deterministas',
            'nfa.prompt':'Indicación de diseño NFA (soporta transiciones ε en la indicación):',
            'nfa.placeholder':'p. ej., Diseña un NFA para el lenguaje (a*b | c*)*',
            'nfa.solve':'Resolver y visualizar NFA',
            'nfa.generating':'Generando estructura del NFA...',
            'nfa.vizplace':'Ingresa tu consulta arriba y haz clic en "Resolver y visualizar NFA" para comenzar.',
            'dfamin.title':'Minimizador de DFA - Optimizar autómatas finitos',
            'dfamin.prompt':'Descripción del DFA para minimizar:',
            'dfamin.placeholder':'p. ej., Minimiza el DFA con estados {q0, q1, q2, q3}, alfabeto {0,1}, inicio q0, finales {q2}, ...',
            'dfamin.solve':'Minimizar y visualizar DFA',
            'dfamin.generating':'Generando DFA minimizado...',
            'dfamin.formal':'Definición formal minimizada (M\')',
            'dfamin.transition':'Tabla de transiciones (δ\')',
            'dfamin.flowchart':'Diagrama minimizado (Estados)',
            're.title':'Solucionador de Expresiones Regulares - Generador Regex',
            're.prompt':'Indicación de descripción del lenguaje:',
            're.placeholder':'p. ej., Genera una expresión regular para todas las cadenas sobre {0,1} que empiezan con 0 y terminan con 1.',
            're.solve':'Generar expresión regular',
            're.generating':'Generando expresión regular...',
            're.result':'Expresión regular resultante (𝘳)',
            're.vistree':'Árbol de sintaxis visual (Estructura generada)',
            're.vizplace':'La visualización aparecerá aquí (estructura de texto formateada).',
            'cfg.title':'Solucionador de Gramáticas Libres de Contexto - Generador CFG',
            'cfg.prompt':'Indicación de descripción del lenguaje:',
            'cfg.placeholder':'p. ej., Genera una CFG para el lenguaje {a^n b^n | n ≥ 0}',
            'cfg.solve':'Generar CFG',
            'cfg.generating':'Generando CFG...',
            'cfg.formal':'Definición formal (G)',
            'cfg.production':'Reglas de producción (𝙋)',
            'cfg.vistree':'Árbol de sintaxis visual (Derivación de ejemplo)',
            'cfg.vizplace':'La visualización aparecerá aquí (estructura de texto formateada).',
            'pda.title':'Diseñador de PDA - Autómata de Pila',
            'pda.prompt':'Indicación de diseño PDA:',
            'pda.placeholder':'p. ej., Diseña un PDA para el lenguaje {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Cadena de prueba para traza:',
            'pda.testplaceholder':'p. ej., 0011',
            'pda.solve':'Resolver y mostrar PDA',
            'pda.generating':'Generando estructura del PDA...',
            'pda.formal':'Definición formal (M)',
            'pda.transition':'Transiciones ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Traza de cómputo de ejemplo (Pila/Estado)',
            'pda.vizplace':'Ingresa una cadena de prueba y haz clic en "Resolver y mostrar PDA" para generar la traza paso a paso.',
            'lba.title':'Diseñador LBA - Autómata Acotado Lineal (Sensibles al contexto)',
            'lba.prompt':'Indicación de CSG o LBA (sensibles al contexto):',
            'lba.placeholder':'p. ej., Genera una CSG para el lenguaje {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Cadena de prueba para traza:',
            'lba.testplaceholder':'p. ej., aabbcc',
            'lba.solve':'Generar solución LBA/CSG',
            'lba.generating':'Generando estructura LBA/CSG...',
            'lba.formal':'Definición formal (G)',
            'lba.production':'Reglas de producción sensibles al contexto (𝙋)',
            'lba.vistree':'Árbol de sintaxis visual (Derivación de ejemplo)',
            'lba.vizplace':'La visualización aparecerá aquí (estructura de texto formateada).',
            'tm.title':'Simulador TM - Máquina de Turing',
            'tm.prompt':'Indicación de diseño de Máquina de Turing:',
            'tm.placeholder':'p. ej., Diseña una TM que decida el lenguaje {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'Entrada para traza de cinta (p. ej., cadena de entrada):',
            'tm.testplaceholder':'p. ej., 101',
            'tm.solve':'Resolver y simular TM',
            'tm.generating':'Generando estructura de la TM...',
            'tm.formal':'Definición formal (M)',
            'tm.transition':'Transiciones ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Traza de cinta de ejemplo (Simulación paso a paso)',
            'tm.vizplace':'Ingresa una cadena de prueba y haz clic en "Resolver y simular TM" para generar la traza de cinta.'
        },
        fr: {
            'logo.title':'Assistant d\'Automates 🪄',
            'nav.home':'Accueil',
            'nav.language':'Langue',
            'home.title':'MOTEUR D\'AUTOMATES',
            'home.subtitle':'Résolvez, visualisez et générez du code pour toute la hiérarchie de Chomsky avec la précision de l\'IA.',
            'module.toolbox':'Modules d\'outils',
            'module.chomsky':'Hiérarchie de Chomsky & Théorie',
            'module.dfa.desc':'Langage Régulier',
            'module.nfa.desc':'Non Déterministe',
            'module.dfamin.desc':'Optimisation',
            'module.re.desc':'Correspondance de Motifs',
            'module.cfg.desc':'Libre de Contexte',
            'module.pda.desc':'Automate à Pile',
            'module.lba.desc':'Sensible au Contexte',
            'module.tm.desc':'Complétude de Turing',
            'theory.type3.title':'Type 3: Langages Réguliers',
            'theory.type3.desc':'Reconnus par les DFA et NFA. Ce sont les plus simples, définissant des motifs comme des longueurs fixes ou des sous-chaînes requises. Ils s\'appuient sur une mémoire limitée (états finis).',
            'theory.type2.title':'Type 2: Langages Libres de Contexte',
            'theory.type2.desc':'Reconnus par les PDA et générés par les CFG. Ils permettent des structures imbriquées et récursives, essentielles pour l\'analyse des langages de programmation et des données structurées.',
            'theory.type1.title':'Type 1: Langages Sensibles au Contexte',
            'theory.type1.desc':'Reconnus par les LBA. Les règles grammaticales dépendent du contexte des symboles, conduisant à des langages hautement structurés.',
            'theory.type0.title':'Type 0: Récursivement Énumérables',
            'theory.type0.desc':'La classe la plus puissante, reconnue par les machines de Turing. Peut calculer tout ce qui est calculable par des algorithmes modernes, y compris des fonctions et des problèmes de décision complexes.',
            'theory.ai.title':'Analyse Propulsée par l\'IA',
            'theory.ai.desc':'Utilisant l\'API Gemini pour résoudre instantanément des problèmes théoriques complexes, fournir des définitions formelles et générer des traces de calcul pas à pas et du code exécutable.',
            'cta.start':'Démarrer',
            'flyout.title':'🎯 Choisissez votre outil',
            'flyout.choose':'Choisir la langue',
            'label.selectTool':'Choisir l\'outil',
            'common.refined':'Requête affinée :',
            'common.formal':'Définition formelle (M)',
            'common.transition':'Table de transition (δ)',
            'common.gencode':'✨ Générer du code Python',
            'common.genlang':'✨ Générer le langage formel',
            'common.gentest':'✨ Générer des jeux de test',
            'common.flowchart':'Diagramme d\'états (Flux)',
            'common.error':'Erreur :',
            'dfa.title':'Solveur DFA - Automates Finis Déterministes',
            'dfa.prompt':'Indication de conception :',
            'dfa.placeholder':'ex. Concevoir un DFA pour le langage de toutes les chaînes sur {a, b} avec un nombre pair de a.',
            'dfa.solve':'Résoudre et visualiser le DFA',
            'dfa.generating':'Génération de la structure du DFA...',
            'dfa.vizplace':'Saisissez votre requête ci-dessus et cliquez sur "Résoudre et visualiser le DFA" pour commencer.',
            'nfa.title':'Solveur NFA - Automates Finis Non Déterministes',
            'nfa.prompt':'Indication de conception NFA (prise en charge des transitions ε) :',
            'nfa.placeholder':'ex. Concevoir un NFA pour le langage (a*b | c*)*',
            'nfa.solve':'Résoudre et visualiser le NFA',
            'nfa.generating':'Génération de la structure du NFA...',
            'nfa.vizplace':'Saisissez votre requête ci-dessus et cliquez sur "Résoudre et visualiser le NFA" pour commencer.',
            'dfamin.title':'Minimiseur de DFA - Optimiser les automates finis',
            'dfamin.prompt':'Description du DFA à minimiser :',
            'dfamin.placeholder':'ex. Minimiser le DFA avec états {q0, q1, q2, q3}, alphabet {0,1}, départ q0, finaux {q2}, ...',
            'dfamin.solve':'Minimiser et visualiser le DFA',
            'dfamin.generating':'Génération du DFA minimisé...',
            'dfamin.formal':'Définition formelle minimisée (M\')',
            'dfamin.transition':'Table de transition (δ\')',
            'dfamin.flowchart':'Diagramme minimisé (États)',
            're.title':'Solveur d\'Expressions Régulières - Générateur Regex',
            're.prompt':'Indication de description du langage :',
            're.placeholder':'ex. Générer une expression régulière pour toutes les chaînes sur {0,1} qui commencent par 0 et finissent par 1.',
            're.solve':'Générer l\'expression régulière',
            're.generating':'Génération de l\'expression régulière...',
            're.result':'Expression régulière résultante (𝘳)',
            're.vistree':'Arbre de syntaxe visuel (Structure générée)',
            're.vizplace':'La visualisation apparaîtra ici (structure de texte formatée)。',
            'cfg.title':'Solveur de Grammaires Hors-Contexte - Générateur CFG',
            'cfg.prompt':'Indication de description du langage :',
            'cfg.placeholder':'ex. Générer une CFG pour le langage {a^n b^n | n ≥ 0}',
            'cfg.solve':'Générer CFG',
            'cfg.generating':'Génération de la CFG...',
            'cfg.formal':'Définition formelle (G)',
            'cfg.production':'Règles de production (𝙋)',
            'cfg.vistree':'Arbre de syntaxe visuel (Dérivation d\'exemple)',
            'cfg.vizplace':'La visualisation apparaîtra ici (structure de texte formatée).',
            'pda.title':'Concepteur de PDA - Automate à Pile',
            'pda.prompt':'Indication de conception du PDA :',
            'pda.placeholder':'ex. Concevoir un PDA pour le langage {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Chaîne de test pour la trace :',
            'pda.testplaceholder':'ex. 0011',
            'pda.solve':'Résoudre et afficher le PDA',
            'pda.generating':'Génération de la structure du PDA...',
            'pda.formal':'Définition formelle (M)',
            'pda.transition':'Transitions ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Trace de calcul (Pile/État)',
            'pda.vizplace':'Entrez une chaîne de test et cliquez sur "Résoudre et afficher le PDA" pour générer la trace étape par étape。',
            'lba.title':'Concepteur LBA - Automate à Bornes Linéaires (Sensible au contexte)',
            'lba.prompt':'Indication CSG ou LBA (sensible au contexte) :',
            'lba.placeholder':'ex. Générer une CSG pour le langage {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Chaîne de test pour la trace :',
            'lba.testplaceholder':'ex. aabbcc',
            'lba.solve':'Générer la solution LBA/CSG',
            'lba.generating':'Génération de la structure LBA/CSG...',
            'lba.formal':'Définition formelle (G)',
            'lba.production':'Règles de production sensibles au contexte (𝙋)',
            'lba.vistree':'Arbre de syntaxe visuel (Dérivation d\'exemple)',
            'lba.vizplace':'La visualisation apparaîtra ici (structure de texte formatée).',
            'tm.title':'Simulateur TM - Machine de Turing',
            'tm.prompt':'Indication de conception de Machine de Turing :',
            'tm.placeholder':'ex. Concevoir une TM qui décide le langage {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'Entrée pour la trace de bande (ex. chaîne d\'entrée) :',
            'tm.testplaceholder':'ex. 101',
            'tm.solve':'Résoudre et simuler la TM',
            'tm.generating':'Génération de la structure de la TM...',
            'tm.formal':'Définition formelle (M)',
            'tm.transition':'Transitions ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Trace de bande (Simulation pas à pas)',
            'tm.vizplace':'Entrez une chaîne de test et cliquez sur "Résoudre et simuler la TM" pour générer la trace de bande.'
        },
        de: {
            'logo.title':'Automaten-Assistent 🪄',
            'nav.home':'Start',
            'nav.language':'Sprache',
            'home.title':'AUTOMATEN-ENGINE',
            'home.subtitle':'Lösen, visualisieren und generieren Sie Code für die gesamte Chomsky-Hierarchie mit KI-Präzision.',
            'module.toolbox':'Werkzeugkasten',
            'module.chomsky':'Chomsky-Hierarchie & Theorie',
            'module.dfa.desc':'Reguläre Sprache',
            'module.nfa.desc':'Nicht-Deterministisch',
            'module.dfamin.desc':'Optimierung',
            'module.re.desc':'Mustererkennung',
            'module.cfg.desc':'Kontextfrei',
            'module.pda.desc':'Kellerautomat',
            'module.lba.desc':'Kontextsensitiv',
            'module.tm.desc':'Turing-Vollständigkeit',
            'theory.type3.title':'Typ 3: Reguläre Sprachen',
            'theory.type3.desc':'Erkannt von DFAs und NFAs. Dies sind die einfachsten und definieren Muster wie feste Längen oder erforderliche Teilzeichenfolgen. Sie verlassen sich auf begrenzten Speicher (endliche Zustände).',
            'theory.type2.title':'Typ 2: Kontextfreie Sprachen',
            'theory.type2.desc':'Erkannt von PDAs und generiert von CFGs. Sie ermöglichen verschachtelte und rekursive Strukturen, die für die Analyse von Programmiersprachen und strukturierten Daten entscheidend sind.',
            'theory.type1.title':'Typ 1: Kontextsensitive Sprachen',
            'theory.type1.desc':'Erkannt von LBAs. Die Grammatikregeln hängen vom Kontext der Symbole ab, was zu hochstrukturierten Sprachen führt.',
            'theory.type0.title':'Typ 0: Rekursiv Aufzählbar',
            'theory.type0.desc':'Die mächtigste Klasse, erkannt von Turing-Maschinen. Kann alles berechnen, was von modernen Algorithmen berechnet werden kann, einschließlich Funktionen und komplexer Entscheidungsprobleme.',
            'theory.ai.title':'KI-gestützte Analyse',
            'theory.ai.desc':'Nutzung der Gemini-API zur sofortigen Lösung komplexer theoretischer Probleme, Bereitstellung formaler Definitionen und Generierung schrittweiser Berechnungsspuren und ausführbaren Codes.',
            'cta.start':'Starten',
            'flyout.title':'🎯 Wähle dein Werkzeug',
            'flyout.choose':'Sprache wählen',
            'label.selectTool':'Werkzeug wählen',
            'common.refined':'Verfeinerte Anfrage:',
            'common.formal':'Formale Definition (M)',
            'common.transition':'Übergangstabelle (δ)',
            'common.gencode':'✨ Python-Code generieren',
            'common.genlang':'✨ Formale Sprache generieren',
            'common.gentest':'✨ Testfälle generieren',
            'common.flowchart':'Zustandsdiagramm (Fluss)',
            'common.error':'Fehler:',
            'dfa.title':'DFA-Löser - Deterministische Endliche Automaten',
            'dfa.prompt':'Entwurfsanweisung:',
            'dfa.placeholder':'z. B. Entwirf einen DFA für alle Zeichenketten über {a,b} mit gerader Anzahl von a.',
            'dfa.solve':'DFA lösen und visualisieren',
            'dfa.generating':'DFA-Struktur wird erzeugt...',
            'dfa.vizplace':'Gib oben deine Anfrage ein und klicke auf „DFA lösen und visualisieren“, um zu starten.',
            'nfa.title':'NFA-Löser - Nichtdeterministische Endliche Automaten',
            'nfa.prompt':'NFA-Entwurfsanweisung (unterstützt ε-Übergänge in der Anweisung):',
            'nfa.placeholder':'z. B. Entwirf einen NFA für die Sprache (a*b | c*)*',
            'nfa.solve':'NFA lösen und visualisieren',
            'nfa.generating':'NFA-Struktur wird erzeugt...',
            'nfa.vizplace':'Gib oben deine Anfrage ein und klicke auf „NFA lösen und visualisieren“, um zu starten.',
            'dfamin.title':'DFA-Minimierer - Endliche Automaten optimieren',
            'dfamin.prompt':'DFA-Beschreibung zur Minimierung:',
            'dfamin.placeholder':'z. B. Minimiere den DFA mit Zuständen {q0, q1, q2, q3}, Alphabet {0,1}, Start q0, final {q2}, ...',
            'dfamin.solve':'DFA minimieren und visualisieren',
            'dfamin.generating':'Minimierter DFA wird erzeugt...',
            'dfamin.formal':'Minimierte formale Definition (M\')',
            'dfamin.transition':'Übergangstabelle (δ\')',
            'dfamin.flowchart':'Minimiertes Zustandsdiagramm',
            're.title':'Regulärer Ausdruck Löser - Regex-Generator',
            're.prompt':'Sprachbeschreibung:',
            're.placeholder':'z. B. Generiere einen regulären Ausdruck für alle Strings über {0,1}, die mit 0 beginnen und mit 1 enden.',
            're.solve':'Regulären Ausdruck generieren',
            're.generating':'Regulärer Ausdruck wird erzeugt...',
            're.result':'Resultierender regulärer Ausdruck (𝘳)',
            're.vistree':'Visueller Syntaxbaum (Generierte Struktur)',
            're.vizplace':'Die Visualisierung erscheint hier (formatierte Textstruktur).',
            'cfg.title':'Kontextfreie Grammatik Löser - CFG-Generator',
            'cfg.prompt':'Sprachbeschreibung:',
            'cfg.placeholder':'z. B. Generiere eine CFG für die Sprache {a^n b^n | n ≥ 0}',
            'cfg.solve':'CFG generieren',
            'cfg.generating':'CFG wird erzeugt...',
            'cfg.formal':'Formale Definition (G)',
            'cfg.production':'Produktionsregeln (𝙋)',
            'cfg.vistree':'Visueller Syntaxbaum (Beispielableitung)',
            'cfg.vizplace':'Die Visualisierung erscheint hier (formatierte Textstruktur).',
            'pda.title':'PDA-Designer - Kellerautomat',
            'pda.prompt':'PDA-Entwurfsanweisung:',
            'pda.placeholder':'z. B. Entwirf einen PDA für die Sprache {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Testzeichenkette für die Spur:',
            'pda.testplaceholder':'z. B. 0011',
            'pda.solve':'PDA lösen und anzeigen',
            'pda.generating':'PDA-Struktur wird erzeugt...',
            'pda.formal':'Formale Definition (M)',
            'pda.transition':'Übergänge ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Beispielhafte Berechnungsspur (Stack/Zustand)',
            'pda.vizplace':'Gib eine Testzeichenkette ein und klicke auf „PDA lösen und anzeigen“, um die Schritt-für-Schritt-Spur zu erzeugen.',
            'lba.title':'LBA-Designer - Linear beschränkter Automat (Kontextsensitive)',
            'lba.prompt':'CSG oder LBA (kontextsensitiver) Anfrage:',
            'lba.placeholder':'z. B. Generiere eine CSG für die Sprache {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Testzeichenkette für die Spur:',
            'lba.testplaceholder':'z. B. aabbcc',
            'lba.solve':'LBA/CSG-Lösung generieren',
            'lba.generating':'LBA/CSG-Struktur wird erzeugt...',
            'lba.formal':'Formale Definition (G)',
            'lba.production':'Kontextsensitive Produktionsregeln (𝙋)',
            'lba.vistree':'Visueller Syntaxbaum (Beispielableitung)',
            'lba.vizplace':'Die Visualisierung erscheint hier (formatierte Textstruktur).',
            'tm.title':'TM-Simulator - Turing-Maschine',
            'tm.prompt':'Turing-Maschine Entwurfsanweisung:',
            'tm.placeholder':'z. B. Entwirf eine TM, die die Sprache {0^n 1^n | n ≥ 1} entscheidet',
            'tm.testlabel':'Eingabe für Bandspur (z. B. Eingabestring):',
            'tm.testplaceholder':'z. B. 101',
            'tm.solve':'TM lösen und simulieren',
            'tm.generating':'TM-Struktur wird erzeugt...',
            'tm.formal':'Formale Definition (M)',
            'tm.transition':'Übergänge ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Bandspur (Schritt-für-Schritt-Simulation)',
            'tm.vizplace':'Gib eine Testzeichenkette ein und klicke auf „TM lösen und simulieren“, um die Bandspur zu erzeugen.'
        },
        zh: {
            'logo.title':'自动机向导 🪄',
            'nav.home':'主页',
            'nav.language':'语言',
            'home.title':'自动机引擎',
            'home.subtitle':'利用AI精度为整个Chomsky层次结构求解、可视化和生成代码。',
            'module.toolbox':'工具箱模块',
            'module.chomsky':'Chomsky层次与理论',
            'module.dfa.desc':'正则语言',
            'module.nfa.desc':'非确定性',
            'module.dfamin.desc':'优化',
            'module.re.desc':'模式匹配',
            'module.cfg.desc':'上下文无关',
            'module.pda.desc':'下推自动机',
            'module.lba.desc':'上下文相关',
            'module.tm.desc':'图灵完备',
            'theory.type3.title':'类型3：正则语言',
            'theory.type3.desc':'由DFA和NFA识别。这些是最简单的，定义固定长度或所需子字符串等模式。它们依赖有限的内存（有限状态）。',
            'theory.type2.title':'类型2：上下文无关语言',
            'theory.type2.desc':'由PDA识别并由CFG生成。它们允许嵌套和递归结构，对于解析编程语言和结构化数据至关重要。',
            'theory.type1.title':'类型1：上下文相关语言',
            'theory.type1.desc':'由LBA识别。语法规则取决于符号的上下文，导致高度结构化的语言。',
            'theory.type0.title':'类型0：递归可枚举',
            'theory.type0.desc':'最强大的类别，由图灵机识别。可以计算现代算法可计算的任何内容，包括函数和复杂的决策问题。',
            'theory.ai.title':'AI驱动分析',
            'theory.ai.desc':'利用Gemini API即时解决复杂的理论问题，提供形式化定义，并生成逐步计算轨迹和可运行代码。',
            'cta.start':'开始计算',
            'flyout.title':'🎯 选择工具',
            'flyout.choose':'选择语言',
            'label.selectTool':'选择工具',
            'common.refined':'优化后的查询：',
            'common.formal':'形式化定义（M）',
            'common.transition':'转移表（δ）',
            'common.gencode':'✨ 生成 Python 代码',
            'common.genlang':'✨ 生成形式语言',
            'common.gentest':'✨ 生成测试用例',
            'common.flowchart':'状态图（流程图）',
            'common.error':'错误：',
            'dfa.title':'DFA 求解器 - 确定型有限自动机',
            'dfa.prompt':'设计提示：',
            'dfa.placeholder':'例如：为 {a, b} 上所有含有偶数个 a 的字符串设计一个 DFA。',
            'dfa.solve':'求解并可视化 DFA',
            'dfa.generating':'正在生成 DFA 结构…',
            'dfa.vizplace':'在上方输入你的查询并点击“求解并可视化 DFA”开始。',
            'nfa.title':'NFA 求解器 - 非确定型有限自动机',
            'nfa.prompt':'NFA 设计提示（支持 ε 转移）：',
            'nfa.placeholder':'例如：为语言 (a*b | c*)* 设计一个 NFA',
            'nfa.solve':'求解并可视化 NFA',
            'nfa.generating':'正在生成 NFA 结构…',
            'nfa.vizplace':'在上方输入你的查询并点击“求解并可视化 NFA”开始。',
            'dfamin.title':'DFA 最小化器 - 优化有限自动机',
            'dfamin.prompt':'待最小化的 DFA 描述：',
            'dfamin.placeholder':'例如：最小化具有状态 {q0, q1, q2, q3}，字母表 {0,1}，初态 q0，终态 {q2} … 的 DFA',
            'dfamin.solve':'最小化并可视化 DFA',
            'dfamin.generating':'正在生成最小化的 DFA…',
            'dfamin.formal':'最小化的形式化定义（M\'）',
            'dfamin.transition':'转移表（δ\'）',
            'dfamin.flowchart':'最小化状态图',
            're.title':'正则表达式求解器 - Regex 生成器',
            're.prompt':'语言描述提示：',
            're.placeholder':'例如：为 {0,1} 上所有以 0 开头、以 1 结尾的字符串生成一个正则表达式。',
            're.solve':'生成正则表达式',
            're.generating':'正在生成正则表达式…',
            're.result':'生成的正则表达式（𝘳）',
            're.vistree':'可视语法树（生成结构）',
            're.vizplace':'可视化内容将在此显示（格式化文本结构）。',
            'cfg.title':'上下文无关文法求解器 - CFG 生成器',
            'cfg.prompt':'语言描述提示：',
            'cfg.placeholder':'例如：为语言 {a^n b^n | n ≥ 0} 生成一个 CFG',
            'cfg.solve':'生成 CFG',
            'cfg.generating':'正在生成 CFG…',
            'cfg.formal':'形式化定义（G）',
            'cfg.production':'生成式（𝙋）',
            'cfg.vistree':'可视语法树（示例推导）',
            'cfg.vizplace':'可视化内容将在此显示（格式化文本结构）。',
            'pda.title':'PDA 设计器 - 下推自动机',
            'pda.prompt':'PDA 设计提示：',
            'pda.placeholder':'例如：为语言 {w c w^R | w ∈ {a, b}*} 设计一个 PDA',
            'pda.testlabel':'跟踪用测试串：',
            'pda.testplaceholder':'例如：0011',
            'pda.solve':'求解并显示 PDA',
            'pda.generating':'正在生成 PDA 结构…',
            'pda.formal':'形式化定义（M）',
            'pda.transition':'转移（(qᵢ, a, Z) → (qⱼ, γ)）',
            'pda.trace':'示例计算跟踪（栈/状态）',
            'pda.vizplace':'输入一个测试串并点击“求解并显示 PDA”以生成逐步跟踪。',
            'lba.title':'LBA 设计器 - 线性有界自动机（上下文相关）',
            'lba.prompt':'CSG 或 LBA 提示（上下文相关）：',
            'lba.placeholder':'例如：为语言 {a^n b^n c^n | n ≥ 1} 生成一个 CSG',
            'lba.testlabel':'跟踪用测试串：',
            'lba.testplaceholder':'例如：aabbcc',
            'lba.solve':'生成 LBA/CSG 解决方案',
            'lba.generating':'正在生成 LBA/CSG 结构…',
            'lba.formal':'形式化定义（G）',
            'lba.production':'上下文相关生成式（𝙋）',
            'lba.vistree':'可视语法树（示例推导）',
            'lba.vizplace':'可视化内容将在此显示（格式化文本结构）。',
            'tm.title':'TM 模拟器 - 图灵机',
            'tm.prompt':'图灵机设计提示：',
            'tm.placeholder':'例如：设计一个 TM 来判定语言 {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'纸带跟踪输入（如输入串）：',
            'tm.testplaceholder':'例如：101',
            'tm.solve':'求解并模拟 TM',
            'tm.generating':'正在生成 TM 结构…',
            'tm.formal':'形式化定义（M）',
            'tm.transition':'转移（(qᵢ, x) → (qⱼ, y, D)）',
            'tm.trace':'纸带跟踪（逐步模拟）',
            'tm.vizplace':'输入一个测试串并点击“求解并模拟 TM”以生成纸带跟踪。'
        },
        ar: {
            'logo.title':'مساعد الآلات 🪄',
            'nav.home':'الرئيسية',
            'nav.language':'اللغة',
            'home.title':'محرك الآلات',
            'home.subtitle':'حل وتصور وإنشاء الشفرة لهرمية تشومسكي بالكامل بدقة الذكاء الاصطناعي.',
            'module.toolbox':'وحدات الأدوات',
            'module.chomsky':'هرمية تشومسكي والنظرية',
            'module.dfa.desc':'لغة منتظمة',
            'module.nfa.desc':'غير حتمي',
            'module.dfamin.desc':'تحسين',
            'module.re.desc':'مطابقة الأنماط',
            'module.cfg.desc':'خالية من السياق',
            'module.pda.desc':'آلة مكدسية',
            'module.lba.desc':'حساسة للسياق',
            'module.tm.desc':'اكتمال تورنج',
            'theory.type3.title':'النوع 3: اللغات المنتظمة',
            'theory.type3.desc':'معترف بها من قبل DFA و NFA. هذه هي الأبسط، وتحدد أنماطًا مثل الأطوال الثابتة أو السلاسل الفرعية المطلوبة. تعتمد على ذاكرة محدودة (حالات محدودة).',
            'theory.type2.title':'النوع 2: اللغات الخالية من السياق',
            'theory.type2.desc':'معترف بها من قبل PDA وتولدها CFG. تسمح بالبنى المتداخلة والتكرارية، وهي ضرورية لتحليل لغات البرمجة والبيانات المنظمة.',
            'theory.type1.title':'النوع 1: اللغات الحساسة للسياق',
            'theory.type1.desc':'معترف بها من قبل LBA. تعتمد القواعد النحوية على سياق الرموز، مما يؤدي إلى لغات منظمة للغاية.',
            'theory.type0.title':'النوع 0: قابلة للعد بشكل تكراري',
            'theory.type0.desc':'الفئة الأكثر قوة، معترف بها من قبل آلات تورنج. يمكنها حساب أي شيء قابل للحساب بواسطة الخوارزميات الحديثة، بما في ذلك الوظائف ومشاكل القرار المعقدة.',
            'theory.ai.title':'تحليل مدعوم بالذكاء الاصطناعي',
            'theory.ai.desc':'الاستفادة من واجهة برمجة التطبيقات Gemini لحل المشكلات النظرية المعقدة على الفور، وتوفير التعريفات الرسمية، وإنشاء آثار الحساب خطوة بخطوة والشفرة القابلة للتشغيل.',
            'cta.start':'بدء الحساب',
            'flyout.title':'🎯 اختر أداتك',
            'flyout.choose':'اختر اللغة',
            'label.selectTool':'اختر الأداة',
            'common.refined':'الاستعلام المحسّن:',
            'common.formal':'التعريف الشكلي (M)',
            'common.transition':'جدول الانتقال (δ)',
            'common.gencode':'✨ توليد كود بايثون',
            'common.genlang':'✨ توليد اللغة الشكلية',
            'common.gentest':'✨ توليد حالات الاختبار',
            'common.flowchart':'مخطط الحالات (تدفق)',
            'common.error':'خطأ:',
            'dfa.title':'محلّل DFA - الأوتوماتا المحددة القطعية',
            'dfa.prompt':'موجه التصميم:',
            'dfa.placeholder':'مثلاً: صمّم DFA للغة كل السلاسل على {a, b} التي تحتوي عددًا زوجيًا من الحرف a.',
            'dfa.solve':'حل وعرض DFA',
            'dfa.generating':'جارٍ إنشاء بنية الـ DFA...',
            'dfa.vizplace':'أدخل استعلامك أعلاه ثم انقر "حل وعرض DFA" للبدء.',
            'nfa.title':'محلّل NFA - الأوتوماتا غير المحددة',
            'nfa.prompt':'موجه تصميم NFA (يدعم انتقالات ε في الموجه):',
            'nfa.placeholder':'مثلاً: صمّم NFA للغة (a*b | c*)*',
            'nfa.solve':'حل وعرض NFA',
            'nfa.generating':'جارٍ إنشاء بنية الـ NFA...',
            'nfa.vizplace':'أدخل استعلامك أعلاه ثم انقر "حل وعرض NFA" للبدء.',
            'dfamin.title':'مقلّص DFA - تحسين الأوتوماتا المنتهية',
            'dfamin.prompt':'وصف الـ DFA المراد تقليصه:',
            'dfamin.placeholder':'مثلاً: قلّص DFA بحالات {q0, q1, q2, q3} وحروف {0,1} والبداية q0 والنهائية {q2} ...',
            'dfamin.solve':'قلّص واعرض DFA',
            'dfamin.generating':'جارٍ إنشاء DFA المقلّص...',
            'dfamin.formal':'التعريف الشكلي المُقلَّص (M\')',
            'dfamin.transition':'جدول الانتقال (δ\')',
            'dfamin.flowchart':'مخطط الحالات المُقلَّص',
            're.title':'محلّل التعابير النمطية - مولّد Regex',
            're.prompt':'موجه وصف اللغة:',
            're.placeholder':'مثلاً: أنشئ تعبيرًا نمطيًا لكل السلاسل على {0,1} التي تبدأ بـ 0 وتنتهي بـ 1.',
            're.solve':'توليد تعبير نمطي',
            're.generating':'جارٍ إنشاء التعبير النمطي...',
            're.result':'التعبير النمطي الناتج (𝘳)',
            're.vistree':'شجرة البنية المرئية (البنية المتولدة)',
            're.vizplace':'ستظهر المرئية هنا (بنية نصية منسّقة).',
            'cfg.title':'محلّل القواعد الخالية من السياق - مولّد CFG',
            'cfg.prompt':'موجه وصف اللغة:',
            'cfg.placeholder':'مثلاً: أنشئ CFG للغة {a^n b^n | n ≥ 0}',
            'cfg.solve':'توليد CFG',
            'cfg.generating':'جارٍ إنشاء CFG...',
            'cfg.formal':'التعريف الشكلي (G)',
            'cfg.production':'قواعد الإنتاج (𝙋)',
            'cfg.vistree':'شجرة البنية المرئية (اشتقاق نموذجي)',
            'cfg.vizplace':'ستظهر المرئية هنا (بنية نصية منسّقة).',
            'pda.title':'مصمّم PDA - أوتوماتا ذات دافعة',
            'pda.prompt':'موجه تصميم PDA:',
            'pda.placeholder':'مثلاً: صمّم PDA للغة {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'سلسلة اختبار للتتبّع:',
            'pda.testplaceholder':'مثلاً: 0011',
            'pda.solve':'حل واعرض PDA',
            'pda.generating':'جارٍ إنشاء بنية الـ PDA...',
            'pda.formal':'التعريف الشكلي (M)',
            'pda.transition':'الانتقالات ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'تتبّع حسابي نموذجي (المكدس/الحالة)',
            'pda.vizplace':'أدخل سلسلة اختبار وانقر "حل واعرض PDA" لتوليد التتبّع خطوة بخطوة.',
            'lba.title':'مصمّم LBA - أوتوماتا محدودة خطيًا (حسّاسة للسياق)',
            'lba.prompt':'موجه CSG أو LBA (حسّاسة للسياق):',
            'lba.placeholder':'مثلاً: أنشئ CSG للغة {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'سلسلة اختبار للتتبّع:',
            'lba.testplaceholder':'مثلاً: aabbcc',
            'lba.solve':'توليد حل LBA/CSG',
            'lba.generating':'جارٍ إنشاء بنية LBA/CSG...',
            'lba.formal':'التعريف الشكلي (G)',
            'lba.production':'قواعد إنتاج حسّاسة للسياق (𝙋)',
            'lba.vistree':'شجرة البنية المرئية (اشتقاق نموذجي)',
            'lba.vizplace':'ستظهر المرئية هنا (بنية نصية منسّقة).',
            'tm.title':'محاكي TM - آلة تورنج',
            'tm.prompt':'موجه تصميم آلة تورنج:',
            'tm.placeholder':'مثلاً: صمّم TM يقرّر اللغة {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'مدخل لتتبّع الشريط (مثل سلسلة الإدخال):',
            'tm.testplaceholder':'مثلاً: 101',
            'tm.solve':'حل ومحاكاة TM',
            'tm.generating':'جارٍ إنشاء بنية الـ TM...',
            'tm.formal':'التعريف الشكلي (M)',
            'tm.transition':'الانتقالات ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'تتبّع الشريط (محاكاة خطوة بخطوة)',
            'tm.vizplace':'أدخل سلسلة اختبار ثم انقر "حل ومحاكاة TM" لتوليد تتبّع الشريط.'
        },
        ru: {
            'logo.title':'Мастер автоматов 🪄',
            'nav.home':'Главная',
            'nav.language':'Язык',
            'home.title':'ДВИЖОК АВТОМАТОВ',
            'home.subtitle':'Решайте, визуализируйте и генерируйте код для всей иерархии Хомского с точностью ИИ.',
            'module.toolbox':'Модули инструментов',
            'module.chomsky':'Иерархия Хомского и теория',
            'module.dfa.desc':'Регулярный язык',
            'module.nfa.desc':'Недетерминированный',
            'module.dfamin.desc':'Оптимизация',
            'module.re.desc':'Сопоставление шаблонов',
            'module.cfg.desc':'Контекстно-свободный',
            'module.pda.desc':'Автомат со стеком',
            'module.lba.desc':'Контекстно-зависимый',
            'module.tm.desc':'Полнота Тьюринга',
            'theory.type3.title':'Тип 3: Регулярные языки',
            'theory.type3.desc':'Распознаются DFA и NFA. Это самые простые, определяющие шаблоны, такие как фиксированные длины или требуемые подстроки. Они полагаются на ограниченную память (конечные состояния).',
            'theory.type2.title':'Тип 2: Контекстно-свободные языки',
            'theory.type2.desc':'Распознаются PDA и генерируются CFG. Они позволяют вложенные и рекурсивные структуры, важные для анализа языков программирования и структурированных данных.',
            'theory.type1.title':'Тип 1: Контекстно-зависимые языки',
            'theory.type1.desc':'Распознаются LBA. Грамматические правила зависят от контекста символов, что приводит к высоко структурированным языкам.',
            'theory.type0.title':'Тип 0: Рекурсивно перечислимые',
            'theory.type0.desc':'Самый мощный класс, распознаваемый машинами Тьюринга. Может вычислить все, что вычислимо современными алгоритмами, включая функции и сложные задачи принятия решений.',
            'theory.ai.title':'Анализ на основе ИИ',
            'theory.ai.desc':'Использование API Gemini для мгновенного решения сложных теоретических задач, предоставления формальных определений и генерации пошаговых вычислительных трасс и исполняемого кода.',
            'cta.start':'Запустить',
            'flyout.title':'🎯 Выберите инструмент',
            'flyout.choose':'Выберите язык',
            'label.selectTool':'Выбрать инструмент',
            'common.refined':'Уточненный запрос:',
            'common.formal':'Формальное определение (M)',
            'common.transition':'Таблица переходов (δ)',
            'common.gencode':'✨ Сгенерировать код Python',
            'common.genlang':'✨ Сгенерировать формальный язык',
            'common.gentest':'✨ Сгенерировать тестовые случаи',
            'common.flowchart':'Диаграмма состояний (поток)',
            'common.error':'Ошибка:',
            'dfa.title':'Решатель DFA — Детерминированные конечные автоматы',
            'dfa.prompt':'Описание задачи:',
            'dfa.placeholder':'напр., Спроектируйте DFA для языка всех строк над {a, b} с четным числом a.',
            'dfa.solve':'Решить и визуализировать DFA',
            'dfa.generating':'Генерация структуры DFA...',
            'dfa.vizplace':'Введите запрос выше и нажмите «Решить и визуализировать DFA», чтобы начать.',
            'nfa.title':'Решатель NFA — Неп determ. конечные автоматы',
            'nfa.prompt':'Описание задачи NFA (поддержка ε-переходов):',
            'nfa.placeholder':'напр., Спроектируйте NFA для языка (a*b | c*)*',
            'nfa.solve':'Решить и визуализировать NFA',
            'nfa.generating':'Генерация структуры NFA...',
            'nfa.vizplace':'Введите запрос выше и нажмите «Решить и визуализировать NFA», чтобы начать.',
            'dfamin.title':'Минимизатор DFA — Оптимизация конечных автоматов',
            'dfamin.prompt':'Описание DFA для минимизации:',
            'dfamin.placeholder':'напр., Минимизируйте DFA с состояниями {q0, q1, q2, q3}, алфавитом {0,1}, нач. q0, конечн. {q2}, ...',
            'dfamin.solve':'Минимизировать и визуализировать DFA',
            'dfamin.generating':'Генерация минимизированного DFA...',
            'dfamin.formal':'Минимизированное формальное определение (M\')',
            'dfamin.transition':'Таблица переходов (δ\')',
            'dfamin.flowchart':'Минимизированная диаграмма состояний',
            're.title':'Решатель регулярных выражений — Генератор Regex',
            're.prompt':'Описание языка:',
            're.placeholder':'напр., Сгенерируйте регулярное выражение для всех строк над {0,1}, начинающихся с 0 и заканчивающихся на 1.',
            're.solve':'Сгенерировать регулярное выражение',
            're.generating':'Генерация регулярного выражения...',
            're.result':'Полученное регулярное выражение (𝘳)',
            're.vistree':'Визуальное синтаксическое дерево (Сформированная структура)',
            're.vizplace':'Визуализация появится здесь (форматированная текстовая структура).',
            'cfg.title':'Решатель КС-грамматик — Генератор CFG',
            'cfg.prompt':'Описание языка:',
            'cfg.placeholder':'напр., Сгенерируйте CFG для языка {a^n b^n | n ≥ 0}',
            'cfg.solve':'Сгенерировать CFG',
            'cfg.generating':'Генерация CFG...',
            'cfg.formal':'Формальное определение (G)',
            'cfg.production':'Правила вывода (𝙋)',
            'cfg.vistree':'Визуальное синтаксическое дерево (Пример вывода)',
            'cfg.vizplace':'Визуализация появится здесь (форматированная текстовая структура).',
            'pda.title':'Конструктор PDA — Автомат с магазинной памятью',
            'pda.prompt':'Описание задачи PDA:',
            'pda.placeholder':'напр., Спроектируйте PDA для языка {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Тестовая строка для трассировки:',
            'pda.testplaceholder':'напр., 0011',
            'pda.solve':'Решить и показать PDA',
            'pda.generating':'Генерация структуры PDA...',
            'pda.formal':'Формальное определение (M)',
            'pda.transition':'Переходы ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Пример вычислительной трассы (Стек/Состояние)',
            'pda.vizplace':'Введите тестовую строку и нажмите «Решить и показать PDA», чтобы получить пошаговую трассу.',
            'lba.title':'Конструктор LBA — Линейно-ограниченный автомат (Контекстно-зависимый)',
            'lba.prompt':'CSG или LBA (контекстно-зависимый) запрос:',
            'lba.placeholder':'напр., Сгенерируйте CSG для языка {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Тестовая строка для трассировки:',
            'lba.testplaceholder':'напр., aabbcc',
            'lba.solve':'Сгенерировать решение LBA/CSG',
            'lba.generating':'Генерация структуры LBA/CSG...',
            'lba.formal':'Формальное определение (G)',
            'lba.production':'Контекстно-зависимые правила вывода (𝙋)',
            'lba.vistree':'Визуальное синтаксическое дерево (Пример вывода)',
            'lba.vizplace':'Визуализация появится здесь (форматированная текстовая структура).',
            'tm.title':'Симулятор TM — Машина Тьюринга',
            'tm.prompt':'Описание задачи Машины Тьюринга:',
            'tm.placeholder':'напр., Спроектируйте TM, решающую язык {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'Ввод для трассировки ленты (напр., входная строка):',
            'tm.testplaceholder':'напр., 101',
            'tm.solve':'Решить и смоделировать TM',
            'tm.generating':'Генерация структуры TM...',
            'tm.formal':'Формальное определение (M)',
            'tm.transition':'Переходы ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Трассировка ленты (пошаговая симуляция)',
            'tm.vizplace':'Введите тестовую строку и нажмите «Решить и смоделировать TM», чтобы получить трассировку.'
        },
        pt: {
            'logo.title':'Assistente de Autômatos 🪄',
            'nav.home':'Início',
            'nav.language':'Idioma',
            'home.title':'MOTOR DE AUTÔMATOS',
            'home.subtitle':'Resolva, visualize e gere código para toda a Hierarquia de Chomsky com precisão de IA.',
            'module.toolbox':'Módulos de Ferramentas',
            'module.chomsky':'Hierarquia de Chomsky & Teoria',
            'module.dfa.desc':'Linguagem Regular',
            'module.nfa.desc':'Não Determinístico',
            'module.dfamin.desc':'Otimização',
            'module.re.desc':'Correspondência de Padrões',
            'module.cfg.desc':'Livre de Contexto',
            'module.pda.desc':'Autômato de Pilha',
            'module.lba.desc':'Sensível ao Contexto',
            'module.tm.desc':'Completude de Turing',
            'theory.type3.title':'Tipo 3: Linguagens Regulares',
            'theory.type3.desc':'Reconhecidas por DFAs e NFAs. Estas são as mais simples, definindo padrões como comprimentos fixos ou substrings necessárias. Elas dependem de memória limitada (estados finitos).',
            'theory.type2.title':'Tipo 2: Linguagens Livres de Contexto',
            'theory.type2.desc':'Reconhecidas por PDAs e geradas por CFGs. Elas permitem estruturas aninhadas e recursivas, cruciais para análise de linguagens de programação e dados estruturados.',
            'theory.type1.title':'Tipo 1: Linguagens Sensíveis ao Contexto',
            'theory.type1.desc':'Reconhecidas por LBAs. As regras gramaticais dependem do contexto dos símbolos, levando a linguagens altamente estruturadas.',
            'theory.type0.title':'Tipo 0: Recursivamente Enumeráveis',
            'theory.type0.desc':'A classe mais poderosa, reconhecida por Máquinas de Turing. Pode computar qualquer coisa computável por algoritmos modernos, incluindo funções e problemas de decisão complexos.',
            'theory.ai.title':'Análise Impulsionada por IA',
            'theory.ai.desc':'Aproveitando a API Gemini para resolver instantaneamente problemas teóricos complexos, fornecer definições formais e gerar rastros de computação passo a passo e código executável.',
            'cta.start':'Iniciar',
            'flyout.title':'🎯 Escolha sua ferramenta',
            'flyout.choose':'Escolha o idioma',
            'label.selectTool':'Selecionar ferramenta',
            'common.refined':'Consulta refinada:',
            'common.formal':'Definição formal (M)',
            'common.transition':'Tabela de transições (δ)',
            'common.gencode':'✨ Gerar código Python',
            'common.genlang':'✨ Gerar linguagem formal',
            'common.gentest':'✨ Gerar casos de teste',
            'common.flowchart':'Diagrama de estados (Fluxo)',
            'common.error':'Erro:',
            'dfa.title':'Solucionador DFA - Autômatos Finitos Determinísticos',
            'dfa.prompt':'Instrução de design:',
            'dfa.placeholder':'ex.: Projete um DFA para a linguagem de todas as cadeias sobre {a, b} com número par de a.',
            'dfa.solve':'Resolver e visualizar DFA',
            'dfa.generating':'Gerando estrutura do DFA...',
            'dfa.vizplace':'Digite sua consulta acima e clique em "Resolver e visualizar DFA" para começar.',
            'nfa.title':'Solucionador NFA - Autômatos Finitos Não Determinísticos',
            'nfa.prompt':'Instrução de design NFA (suporta transições ε):',
            'nfa.placeholder':'ex.: Projete um NFA para a linguagem (a*b | c*)*',
            'nfa.solve':'Resolver e visualizar NFA',
            'nfa.generating':'Gerando estrutura do NFA...',
            'nfa.vizplace':'Digite sua consulta acima e clique em "Resolver e visualizar NFA" para começar.',
            'dfamin.title':'Minimizador de DFA - Otimizar autômatos finitos',
            'dfamin.prompt':'Descrição do DFA para minimização:',
            'dfamin.placeholder':'ex.: Minimize o DFA com estados {q0, q1, q2, q3}, alfabeto {0,1}, início q0, finais {q2}, ...',
            'dfamin.solve':'Minimizar e visualizar DFA',
            'dfamin.generating':'Gerando DFA minimizado...',
            'dfamin.formal':'Definição formal minimizada (M\')',
            'dfamin.transition':'Tabela de transições (δ\')',
            'dfamin.flowchart':'Diagrama minimizado (Estados)',
            're.title':'Solucionador de Expressões Regulares - Gerador Regex',
            're.prompt':'Instrução de descrição da linguagem:',
            're.placeholder':'ex.: Gere uma expressão regular para todas as cadeias sobre {0,1} que começam com 0 e terminam com 1.',
            're.solve':'Gerar expressão regular',
            're.generating':'Gerando expressão regular...',
            're.result':'Expressão regular resultante (𝘳)',
            're.vistree':'Árvore de sintaxe visual (Estrutura gerada)',
            're.vizplace':'A visualização aparecerá aqui (estrutura de texto formatada).',
            'cfg.title':'Solucionador de Gramática Livre de Contexto - Gerador CFG',
            'cfg.prompt':'Instrução de descrição da linguagem:',
            'cfg.placeholder':'ex.: Gere uma CFG para a linguagem {a^n b^n | n ≥ 0}',
            'cfg.solve':'Gerar CFG',
            'cfg.generating':'Gerando CFG...',
            'cfg.formal':'Definição formal (G)',
            'cfg.production':'Regras de produção (𝙋)',
            'cfg.vistree':'Árvore de sintaxe visual (Derivação de exemplo)',
            'cfg.vizplace':'A visualização aparecerá aqui (estrutura de texto formatada).',
            'pda.title':'Designer de PDA - Autômato com Pilha',
            'pda.prompt':'Instrução de design do PDA:',
            'pda.placeholder':'ex.: Projete um PDA para a linguagem {w c w^R | w ∈ {a, b}*}',
            'pda.testlabel':'Cadeia de teste para a trilha:',
            'pda.testplaceholder':'ex.: 0011',
            'pda.solve':'Resolver e exibir PDA',
            'pda.generating':'Gerando estrutura do PDA...',
            'pda.formal':'Definição formal (M)',
            'pda.transition':'Transições ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'Trilha de computação (Pilha/Estado)',
            'pda.vizplace':'Digite uma cadeia de teste e clique em "Resolver e exibir PDA" para gerar a trilha passo a passo.',
            'lba.title':'Designer LBA - Autômato Limitado Linearmente (Sensível ao contexto)',
            'lba.prompt':'Instrução de CSG ou LBA (sensível ao contexto):',
            'lba.placeholder':'ex.: Gere uma CSG para a linguagem {a^n b^n c^n | n ≥ 1}',
            'lba.testlabel':'Cadeia de teste para a trilha:',
            'lba.testplaceholder':'ex.: aabbcc',
            'lba.solve':'Gerar solução LBA/CSG',
            'lba.generating':'Gerando estrutura LBA/CSG...',
            'lba.formal':'Definição formal (G)',
            'lba.production':'Regras de produção sensíveis ao contexto (𝙋)',
            'lba.vistree':'Árvore de sintaxe visual (Derivação de exemplo)',
            'lba.vizplace':'A visualização aparecerá aqui (estrutura de texto formatada).',
            'tm.title':'Simulador TM - Máquina de Turing',
            'tm.prompt':'Instrução de design da Máquina de Turing:',
            'tm.placeholder':'ex.: Projete uma TM que decida a linguagem {0^n 1^n | n ≥ 1}',
            'tm.testlabel':'Entrada para trilha da fita (ex.: cadeia de entrada):',
            'tm.testplaceholder':'ex.: 101',
            'tm.solve':'Resolver e simular TM',
            'tm.generating':'Gerando estrutura da TM...',
            'tm.formal':'Definição formal (M)',
            'tm.transition':'Transições ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'Trilha da fita (Simulação passo a passo)',
            'tm.vizplace':'Digite uma cadeia de teste e clique em "Resolver e simular TM" para gerar a trilha da fita.'
        },
        hi: {
            'logo.title':'ऑटोमेटा सहायक 🪄',
            'nav.home':'होम',
            'nav.language':'भाषा',
            'home.title':'ऑटोमेटा इंजन',
            'home.subtitle':'AI सटीकता के साथ पूरे चॉम्स्की पदानुक्रम के लिए हल करें, विज़ुअलाइज़ करें और कोड जेनरेट करें।',
            'module.toolbox':'टूलबॉक्स मॉड्यूल',
            'module.chomsky':'चॉम्स्की पदानुक्रम और सिद्धांत',
            'module.dfa.desc':'नियमित भाषा',
            'module.nfa.desc':'गैर-निर्धारक',
            'module.dfamin.desc':'अनुकूलन',
            'module.re.desc':'पैटर्न मिलान',
            'module.cfg.desc':'संदर्भ-मुक्त',
            'module.pda.desc':'स्टैक ऑटोमेटा',
            'module.lba.desc':'संदर्भ-संवेदनशील',
            'module.tm.desc':'ट्यूरिंग पूर्णता',
            'theory.type3.title':'प्रकार 3: नियमित भाषाएँ',
            'theory.type3.desc':'DFA और NFA द्वारा मान्यता प्राप्त। ये सबसे सरल हैं, निश्चित लंबाई या आवश्यक सबस्ट्रिंग जैसे पैटर्न को परिभाषित करते हैं।',
            'theory.type2.title':'प्रकार 2: संदर्भ-मुक्त भाषाएँ',
            'theory.type2.desc':'PDA द्वारा मान्यता प्राप्त और CFG द्वारा उत्पन्न। वे नेस्टेड और पुनरावर्ती संरचनाओं की अनुमति देते हैं।',
            'theory.type1.title':'प्रकार 1: संदर्भ-संवेदनशील भाषाएँ',
            'theory.type1.desc':'LBA द्वारा मान्यता प्राप्त। व्याकरण नियम प्रतीकों के संदर्भ पर निर्भर करते हैं।',
            'theory.type0.title':'प्रकार 0: पुनरावर्ती रूप से गणनीय',
            'theory.type0.desc':'सबसे शक्तिशाली वर्ग, ट्यूरिंग मशीनों द्वारा मान्यता प्राप्त। आधुनिक एल्गोरिदम द्वारा गणना योग्य कुछ भी गणना कर सकता है।',
            'theory.ai.title':'AI-संचालित विश्लेषण',
            'theory.ai.desc':'जटिल सैद्धांतिक समस्याओं को तुरंत हल करने के लिए Gemini API का लाभ उठाना।',
            'cta.start':'शुरू करें',
            'flyout.title':'🎯 अपना उपकरण चुनें',
            'flyout.choose':'भाषा चुनें',
            'label.selectTool':'उपकरण चुनें',
            'common.refined':'परिष्कृत प्रश्न:',
            'common.formal':'औपचारिक परिभाषा (M)',
            'common.transition':'ट्रांज़िशन टेबल (δ)',
            'common.gencode':'✨ Python कोड जनरेट करें',
            'common.genlang':'✨ औपचारिक भाषा जनरेट करें',
            'common.gentest':'✨ परीक्षण मामलों का जनरेशन',
            'common.flowchart':'स्टेट डायग्राम (फ़्लोचार्ट)',
            'common.error':'त्रुटि:',
            'dfa.title':'DFA सॉल्वर - निर्धारक सीमित ऑटोमेटा',
            'dfa.prompt':'डिज़ाइन संकेत:',
            'dfa.placeholder':'उदा., {a, b} पर सभी स्ट्रिंग जिनमें a की संख्या सम हो, उसके लिए DFA डिज़ाइन करें।',
            'dfa.solve':'DFA हल करें और दृश्य बनाएं',
            'dfa.generating':'DFA संरचना बनाई जा रही है...',
            'dfa.vizplace':'ऊपर प्रश्न दर्ज करें और "DFA हल करें और दृश्य बनाएं" पर क्लिक करें।',
            'nfa.title':'NFA सॉल्वर - अनिर्धारक सीमित ऑटोमेटा',
            'nfa.prompt':'NFA डिज़ाइन संकेत (ε-ट्रांज़िशन का समर्थन):',
            'nfa.placeholder':'उदा., भाषा (a*b | c*)* के लिए NFA डिज़ाइन करें',
            'nfa.solve':'NFA हल करें और दृश्य बनाएं',
            'nfa.generating':'NFA संरचना बनाई जा रही है...',
            'nfa.vizplace':'ऊपर प्रश्न दर्ज करें और "NFA हल करें और दृश्य बनाएं" पर क्लिक करें।',
            'dfamin.title':'DFA मिनिमाइज़र - सीमित ऑटोमेटा का अनुकूलन',
            'dfamin.prompt':'मिनिमाइज़ करने हेतु DFA का विवरण:',
            'dfamin.placeholder':'उदा., {q0, q1, q2, q3} स्थितियों, {0,1} वर्णमाला, प्रारंभ q0, अंतिम {q2} … वाला DFA मिनिमाइज़ करें',
            'dfamin.solve':'DFA मिनिमाइज़ करें और दृश्य बनाएं',
            'dfamin.generating':'मिनिमाइज़्ड DFA बनाया जा रहा है...',
            'dfamin.formal':'मिनिमाइज़्ड औपचारिक परिभाषा (M\')',
            'dfamin.transition':'ट्रांज़िशन टेबल (δ\')',
            'dfamin.flowchart':'मिनिमाइज़्ड स्टेट डायग्राम',
            're.title':'रेगुलर एक्सप्रेशन सॉल्वर - Regex जेनरेटर',
            're.prompt':'भाषा विवरण संकेत:',
            're.placeholder':'उदा., {0,1} पर वे सभी स्ट्रिंग जो 0 से शुरू और 1 पर खत्म हों, उनके लिए Regex बनाएं।',
            're.solve':'रेगुलर एक्सप्रेशन जनरेट करें',
            're.generating':'रेगुलर एक्सप्रेशन बनाया जा रहा है...',
            're.result':'प्राप्त रेगुलर एक्सप्रेशन (𝘳)',
            're.vistree':'दृश्य सिंटैक्स ट्री (उत्पन्न संरचना)',
            're.vizplace':'विज़ुअलाइज़ेशन यहाँ दिखाई देगा (फ़ॉर्मेटेड टेक्स्ट संरचना)।',
            'cfg.title':'कॉन्टेक्स्ट-फ्री ग्रामर सॉल्वर - CFG जेनरेटर',
            'cfg.prompt':'भाषा विवरण संकेत:',
            'cfg.placeholder':'उदा., {a^n b^n | n ≥ 0} के लिए CFG बनाएं',
            'cfg.solve':'CFG जनरेट करें',
            'cfg.generating':'CFG बनाया जा रहा है...',
            'cfg.formal':'औपचारिक परिभाषा (G)',
            'cfg.production':'उत्पादन नियम (𝙋)',
            'cfg.vistree':'दृश्य सिंटैक्स ट्री (उदाहरण व्युत्पत्ति)',
            'cfg.vizplace':'विज़ुअलाइज़ेशन यहाँ दिखाई देगा (फ़ॉर्मेटेड टेक्स्ट संरचना)।',
            'pda.title':'PDA डिज़ाइनर - पुषडाउन ऑटोमेटा',
            'pda.prompt':'PDA डिज़ाइन संकेत:',
            'pda.placeholder':'उदा., {w c w^R | w ∈ {a, b}*} के लिए PDA डिज़ाइन करें',
            'pda.testlabel':'ट्रेस के लिए परीक्षण स्ट्रिंग:',
            'pda.testplaceholder':'उदा., 0011',
            'pda.solve':'PDA हल करें और दिखाएँ',
            'pda.generating':'PDA संरचना बनाई जा रही है...',
            'pda.formal':'औपचारिक परिभाषा (M)',
            'pda.transition':'ट्रांज़िशन ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'उदाहरण कम्प्यूटेशन ट्रेस (स्टैक/स्टेट)',
            'pda.vizplace':'एक परीक्षण स्ट्रिंग दर्ज करें और "PDA हल करें और दिखाएँ" पर क्लिक करके स्टेप-बाय-स्टेप ट्रेस जनरेट करें।',
            'lba.title':'LBA डिज़ाइनर - रैखिक-सीमाबद्ध ऑटोमेटा (संदर्भ-संवेदनशील)',
            'lba.prompt':'CSG या LBA संकेत (संदर्भ-संवेदनशील):',
            'lba.placeholder':'उदा., {a^n b^n c^n | n ≥ 1} के लिए CSG बनाएं',
            'lba.testlabel':'ट्रेस के लिए परीक्षण स्ट्रिंग:',
            'lba.testplaceholder':'उदा., aabbcc',
            'lba.solve':'LBA/CSG समाधान जनरेट करें',
            'lba.generating':'LBA/CSG संरचना बनाई जा रही है...',
            'lba.formal':'औपचारिक परिभाषा (G)',
            'lba.production':'संदर्भ-संवेदनशील उत्पादन नियम (𝙋)',
            'lba.vistree':'दृश्य सिंटैक्स ट्री (उदाहरण व्युत्पत्ति)',
            'lba.vizplace':'विज़ुअलाइज़ेशन यहाँ दिखाई देगा (फ़ॉर्मेटेड टेक्स्ट संरचना)।',
            'tm.title':'TM सिम्युलेटर - ट्यूरिंग मशीन',
            'tm.prompt':'ट्यूरिंग मशीन डिज़ाइन संकेत:',
            'tm.placeholder':'उदा., वह TM डिज़ाइन करें जो भाषा {0^n 1^n | n ≥ 1} निर्णय करे',
            'tm.testlabel':'टेप ट्रेस के लिए इनपुट (जैसे इनपुट स्ट्रिंग):',
            'tm.testplaceholder':'उदा., 101',
            'tm.solve':'TM हल करें और सिम्युलेट करें',
            'tm.generating':'TM संरचना बनाई जा रही है...',
            'tm.formal':'औपचारिक परिभाषा (M)',
            'tm.transition':'ट्रांज़िशन ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'टेप ट्रेस (कदम-दर-कदम सिमुलेशन)',
            'tm.vizplace':'एक परीक्षण स्ट्रिंग दर्ज करें और "TM हल करें और सिम्युलेट करें" पर क्लिक करके टेप ट्रेस जनरेट करें।'
        },
        ja: {
            'logo.title':'オートマタ ウィザード 🪄',
            'nav.home':'ホーム',
            'nav.language':'言語',
            'home.title':'オートマタエンジン',
            'home.subtitle':'AIの精度でChomsky階層全体を解決、視覚化、コード生成。',
            'module.toolbox':'ツールボックスモジュール',
            'module.chomsky':'Chomsky階層と理論',
            'module.dfa.desc':'正規言語',
            'module.nfa.desc':'非決定性',
            'module.dfamin.desc':'最適化',
            'module.re.desc':'パターンマッチング',
            'module.cfg.desc':'文脈自由',
            'module.pda.desc':'スタックオートマトン',
            'module.lba.desc':'文脈依存',
            'module.tm.desc':'チューリング完全',
            'theory.type3.title':'タイプ3：正規言語',
            'theory.type3.desc':'DFAとNFAによって認識されます。これらは最も単純で、固定長や必要な部分文字列などのパターンを定義します。',
            'theory.type2.title':'タイプ2：文脈自由言語',
            'theory.type2.desc':'PDAによって認識され、CFGによって生成されます。ネストされた再帰構造を可能にします。',
            'theory.type1.title':'タイプ1：文脈依存言語',
            'theory.type1.desc':'LBAによって認識されます。文法規則はシンボルの文脈に依存します。',
            'theory.type0.title':'タイプ0：再帰的に列挙可能',
            'theory.type0.desc':'最も強力なクラスで、チューリングマシンによって認識されます。現代のアルゴリズムで計算可能なものすべてを計算できます。',
            'theory.ai.title':'AI駆動分析',
            'theory.ai.desc':'Gemini APIを活用して、複雑な理論的問題を即座に解決します。',
            'cta.start':'開始',
            'flyout.title':'🎯 ツールを選択',
            'flyout.choose':'言語を選択',
            'label.selectTool':'ツールを選択',
            'common.refined':'精緻化されたクエリ：',
            'common.formal':'形式的定義 (M)',
            'common.transition':'遷移表 (δ)',
            'common.gencode':'✨ Pythonコードを生成',
            'common.genlang':'✨ 形式言語を生成',
            'common.gentest':'✨ テストケースを生成',
            'common.flowchart':'状態遷移図 (フローチャート)',
            'common.error':'エラー：',
            'dfa.title':'DFAソルバー - 決定性有限オートマトン',
            'dfa.prompt':'設計プロンプト：',
            'dfa.placeholder':'例：{a, b} 上の a の個数が偶数の文字列の言語のための DFA を設計する。',
            'dfa.solve':'DFA を解いて可視化',
            'dfa.generating':'DFA 構造を生成中…',
            'dfa.vizplace':'上にクエリを入力し「DFA を解いて可視化」をクリックしてください。',
            'nfa.title':'NFAソルバー - 非決定性有限オートマトン',
            'nfa.prompt':'NFA 設計プロンプト（ε 遷移対応）：',
            'nfa.placeholder':'例：(a*b | c*)* の言語に対する NFA を設計',
            'nfa.solve':'NFA を解いて可視化',
            'nfa.generating':'NFA 構造を生成中…',
            'nfa.vizplace':'上にクエリを入力し「NFA を解いて可視化」をクリックしてください。',
            'dfamin.title':'DFA 最小化 - 有限オートマトンの最適化',
            'dfamin.prompt':'最小化する DFA の説明：',
            'dfamin.placeholder':'例：状態 {q0, q1, q2, q3}，アルファベット {0,1}，初期 q0，受理 {q2} … の DFA を最小化',
            'dfamin.solve':'DFA を最小化して可視化',
            'dfamin.generating':'最小化 DFA を生成中…',
            'dfamin.formal':'最小化された形式的定義 (M\')',
            'dfamin.transition':'遷移表 (δ\')',
            'dfamin.flowchart':'最小化された状態遷移図',
            're.title':'正規表現ソルバー - Regex 生成',
            're.prompt':'言語説明プロンプト：',
            're.placeholder':'例：{0,1} 上で 0 で始まり 1 で終わる全ての文字列の正規表現を生成',
            're.solve':'正規表現を生成',
            're.generating':'正規表現を生成中…',
            're.result':'生成された正規表現 (𝘳)',
            're.vistree':'可視構文木（生成された構造）',
            're.vizplace':'ここに可視化が表示されます（整形テキスト構造）。',
            'cfg.title':'文脈自由文法ソルバー - CFG 生成',
            'cfg.prompt':'言語説明プロンプト：',
            'cfg.placeholder':'例：言語 {a^n b^n | n ≥ 0} の CFG を生成',
            'cfg.solve':'CFG を生成',
            'cfg.generating':'CFG を生成中…',
            'cfg.formal':'形式的定義 (G)',
            'cfg.production':'生成規則 (𝙋)',
            'cfg.vistree':'可視構文木（サンプル導出）',
            'cfg.vizplace':'ここに可視化が表示されます（整形テキスト構造）。',
            'pda.title':'PDA デザイナー - プッシュダウン・オートマトン',
            'pda.prompt':'PDA 設計プロンプト：',
            'pda.placeholder':'例：言語 {w c w^R | w ∈ {a, b}*} のための PDA を設計',
            'pda.testlabel':'トレース用テスト文字列：',
            'pda.testplaceholder':'例：0011',
            'pda.solve':'PDA を解いて表示',
            'pda.generating':'PDA 構造を生成中…',
            'pda.formal':'形式的定義 (M)',
            'pda.transition':'遷移 ((qᵢ, a, Z) → (qⱼ, γ))',
            'pda.trace':'サンプル計算トレース（スタック/状態）',
            'pda.vizplace':'テスト文字列を入力し「PDA を解いて表示」をクリックしてステップごとのトレースを生成します。',
            'lba.title':'LBA デザイナー - 線形有界オートマトン（文脈依存）',
            'lba.prompt':'CSG または LBA プロンプト（文脈依存）：',
            'lba.placeholder':'例：言語 {a^n b^n c^n | n ≥ 1} の CSG を生成',
            'lba.testlabel':'トレース用テスト文字列：',
            'lba.testplaceholder':'例：aabbcc',
            'lba.solve':'LBA/CSG 解を生成',
            'lba.generating':'LBA/CSG 構造を生成中…',
            'lba.formal':'形式的定義 (G)',
            'lba.production':'文脈依存の生成規則 (𝙋)',
            'lba.vistree':'可視構文木（サンプル導出）',
            'lba.vizplace':'ここに可視化が表示されます（整形テキスト構造）。',
            'tm.title':'TM シミュレータ - チューリングマシン',
            'tm.prompt':'チューリングマシン設計プロンプト：',
            'tm.placeholder':'例：言語 {0^n 1^n | n ≥ 1} を判定する TM を設計',
            'tm.testlabel':'テープトレースの入力（例：入力文字列）：',
            'tm.testplaceholder':'例：101',
            'tm.solve':'TM を解いてシミュレート',
            'tm.generating':'TM 構造を生成中…',
            'tm.formal':'形式的定義 (M)',
            'tm.transition':'遷移 ((qᵢ, x) → (qⱼ, y, D))',
            'tm.trace':'テープトレース（ステップごとのシミュレーション）',
            'tm.vizplace':'テスト文字列を入力し「TM を解いてシミュレート」をクリックしてテープトレースを生成します。'
        }
    };

    // Helper: apply translations to elements with data-i18n
    function applyTranslations(code){
        const dict = translations[code] || translations['en'];
        const fallback = translations['en'];

        // Set text direction for RTL languages (e.g., Arabic)
        try {
            document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
        } catch(e) {}

        // Inner HTML translations
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = (dict && dict[key] !== undefined) ? dict[key] : fallback[key];
            if (val !== undefined) {
                el.innerHTML = val;
            }
        });

        // Placeholder translations for inputs/textarea
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = (dict && dict[key] !== undefined) ? dict[key] : fallback[key];
            if (val !== undefined) {
                el.setAttribute('placeholder', val);
            }
        });
    }

    // Populate language list
    const langListContainer = document.querySelector('.lang-list');
    function populateLangList(){
        if (!langListContainer) return;
        langListContainer.innerHTML = '';
        languages.forEach(l => {
            const div = document.createElement('div');
            div.className = 'lang-item';
            div.dataset.lang = l.code;
            div.innerHTML = `<span class="flag">${l.flag}</span><div style=\"display:flex;flex-direction:column;\"><span class=\"name\">${l.name}</span><span class=\"country\">${l.country}</span></div>`;
            div.addEventListener('click', () => selectLanguage(l.code));
            langListContainer.appendChild(div);
        });
    }

    // Set lang label and flag (just update flag, translation handles label)
    function setLangUI(code){
        const l = languages.find(x=>x.code===code) || languages[0];
        const flag = document.getElementById('lang-flag');
        if (flag) flag.textContent = l.flag;
    }

    function selectLanguage(code){
        localStorage.setItem(LANG_KEY, code);
        applyTranslations(code);
        setLangUI(code);
        // Update aria attribute
        const langBtn = document.getElementById('lang-button');
        if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
        const sel = document.querySelector('.lang-selector');
        if (sel) sel.classList.remove('open');
    }

    // detect system language
    function detectInitialLang(){
        const saved = localStorage.getItem(LANG_KEY);
        if (saved && translations[saved]) {
            console.log('Language: Using saved language -', saved);
            return saved;
        }
        
        // Try to get browser language
        let browserLang = 'en';
        if (navigator.languages && navigator.languages.length > 0) {
            browserLang = navigator.languages[0];
        } else if (navigator.language) {
            browserLang = navigator.language;
        }
        
        // Extract language code (e.g., 'en-US' -> 'en')
        const short = browserLang.toLowerCase().split('-')[0];
        console.log('Language: Browser language detected -', browserLang, '-> Short code:', short);
        
        // Check if we have translations for this language
        const finalLang = translations[short] ? short : 'en';
        console.log('Language: Using language -', finalLang);
        return finalLang;
    }

    // Initialize - wrapped in setTimeout to ensure DOM is ready
    setTimeout(() => {
        console.log('Language: Initializing language selector...');
        populateLangList();
        const initial = detectInitialLang();
        console.log('Language: Initial language set to -', initial);
        applyTranslations(initial);
        setLangUI(initial);

        // Add hover event handlers for aria-expanded
        const langSelector = document.querySelector('.lang-selector');
        const langButton = document.getElementById('lang-button');
        const langFlyout = document.querySelector('.lang-flyout');
        
        if (langSelector && langButton && langFlyout) {
            console.log('Language: Adding smooth hover/focus listeners to language selector');

            let langOpenTimer = null;
            let langCloseTimer = null;

            const openLang = () => {
                clearTimeout(langCloseTimer);
                if (langButton.getAttribute('aria-expanded') === 'true') return;
                langOpenTimer = setTimeout(() => {
                    langButton.setAttribute('aria-expanded', 'true');
                    langSelector.classList.add('open');
                }, 120);
            };

            const closeLang = () => {
                clearTimeout(langOpenTimer);
                langCloseTimer = setTimeout(() => {
                    langButton.setAttribute('aria-expanded', 'false');
                    langSelector.classList.remove('open');
                }, 220);
            };

            // Pointer/mouse hover handling
            ['mouseenter','pointerenter','focusin'].forEach(evt => {
                langSelector.addEventListener(evt, openLang);
                langFlyout.addEventListener(evt, openLang);
            });
            ['mouseleave','pointerleave','focusout'].forEach(evt => {
                langSelector.addEventListener(evt, closeLang);
                langFlyout.addEventListener(evt, closeLang);
            });

            // Click toggles as a fallback (for touch devices)
            langButton.addEventListener('click', (e) => {
                e.preventDefault();
                const expanded = langButton.getAttribute('aria-expanded') === 'true';
                if (expanded) {
                    closeLang();
                } else {
                    openLang();
                }
            });
        } else {
            console.error('Language: Could not find language selector elements');
        }
        
        console.log('Language: Initialization complete');
    }, 100);

    // Expose for debug
    window.selectLanguage = selectLanguage;
    window.detectInitialLang = detectInitialLang;
})();

// --- Smooth Home Flyout Hover ---
(function(){
    const homeLink = document.querySelector('.nav-home-link');
    const homeFlyout = document.querySelector('.flyout-container');
    if (!homeLink || !homeFlyout) return;

    let openTimer = null;
    let closeTimer = null;

    const openMenu = () => {
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => {
            homeFlyout.classList.add('open');
        }, 100);
    };

    const closeMenu = () => {
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => {
            homeFlyout.classList.remove('open');
        }, 220);
    };

    ['mouseenter','pointerenter','focusin'].forEach(evt => {
        homeLink.addEventListener(evt, openMenu);
        homeFlyout.addEventListener(evt, openMenu);
    });
    ['mouseleave','pointerleave','focusout'].forEach(evt => {
        homeLink.addEventListener(evt, closeMenu);
        homeFlyout.addEventListener(evt, closeMenu);
    });
})();

// --- Modal Functions ---
function openModal(title, content) {
    const modal = document.getElementById('code-modal');
    document.querySelector('#code-modal .modal-content h2').textContent = title;
    document.getElementById('code-modal-content').innerHTML = content;
    document.getElementById('code-loading-indicator').classList.add('hidden');
    document.getElementById('code-error-message').classList.add('hidden');
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('code-modal').classList.add('hidden');
}

function displayCodeError(message) {
    document.getElementById('code-loading-indicator').classList.add('hidden');
    document.getElementById('code-error-text').textContent = message;
    document.getElementById('code-error-message').classList.remove('hidden');
}

function copyToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Provide visual feedback
    const copyButton = document.getElementById('copy-code-button');
    if (copyButton) {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy Code';
        }, 1500);
    }
}

// --- Utility Functions ---

function getElements(prefix) {
    return {
        solveButton: document.getElementById(`solve-${prefix}-button`),
        questionInput: document.getElementById(`${prefix}-question`),
        loadingIndicator: document.getElementById(`${prefix}-loading-indicator`),
        formalDefinitionElement: document.getElementById(`${prefix}-formal-definition`),
        formalDefinitionCard: document.getElementById(`${prefix}-formal-definition-card`),
        correctedPromptElement: document.getElementById(`${prefix}-corrected-prompt`),
        promptFeedback: document.getElementById(`${prefix}-prompt-feedback`),
        errorMessageDiv: document.getElementById(`${prefix}-error-message`),
        errorText: document.getElementById(`${prefix}-error-text`),
        transitionTableElement: document.getElementById(`${prefix}-transition-table`),
        // New elements for timing
        timerText: document.getElementById(`${prefix}-timer-text`),
        timeElapsed: document.getElementById(`${prefix}-time-elapsed`),
        // New inputs for trace
        testStringInput: document.getElementById(`${prefix}-test-string`), 
        // Visualization elements
        networkContainer: document.getElementById(`${prefix}-network`),
        visualizationPlaceholder: document.getElementById(`${prefix}-visualization-placeholder`),
    };
}

/**
 * Starts a tool-specific timer - REDESIGNED for core automation tools
 * Simple, robust implementation that prevents stuck timers
 * @param {object} elements - The element collection for the current page
 * @param {string} prefix - The tool prefix (dfa, nfa, dfamin, re, cfg, pda, lba, tm)
 */
function startTimer(elements, prefix) {
    if (!prefix || !toolTimers[prefix]) {
        console.error(`Invalid timer prefix: ${prefix}`);
        return;
    }
    
    // CRITICAL: Force complete cleanup of any existing timer first
    stopTimer(prefix);
    
    // Small delay to ensure cleanup completes before starting new timer
    setTimeout(() => {
        // Reset display to zero
        if (elements && elements.timeElapsed) {
            elements.timeElapsed.textContent = '0.00s';
        }
        
        // Record new start time
        toolTimers[prefix].startTime = Date.now();
        
        // Create completely fresh interval
        toolTimers[prefix].interval = setInterval(() => {
            // Safety check - stop if timer was cleared
            if (!toolTimers[prefix] || !toolTimers[prefix].startTime) {
                if (toolTimers[prefix] && toolTimers[prefix].interval) {
                    clearInterval(toolTimers[prefix].interval);
                    toolTimers[prefix].interval = null;
                }
                return;
            }
            
            // Calculate and display elapsed time
            const elapsed = (Date.now() - toolTimers[prefix].startTime) / 1000;
            if (elements && elements.timeElapsed) {
                elements.timeElapsed.textContent = `${elapsed.toFixed(2)}s`;
            }
        }, 100);
    }, 50); // 50ms delay ensures previous timer is fully cleared
}

/**
 * Stops a tool-specific timer - REDESIGNED for complete reliability
 * Ensures timer is fully cleared with aggressive cleanup
 * @param {string} prefix - The tool prefix
 */
function stopTimer(prefix) {
    if (!prefix || !toolTimers[prefix]) {
        // Fallback: aggressively clear ALL timers
        Object.keys(toolTimers).forEach(key => {
            if (toolTimers[key] && toolTimers[key].interval) {
                clearInterval(toolTimers[key].interval);
                clearInterval(toolTimers[key].interval); // Double clear for safety
            }
            if (toolTimers[key]) {
                toolTimers[key].interval = null;
                toolTimers[key].startTime = null;
            }
        });
        return;
    }
    
    // AGGRESSIVE CLEANUP: Multiple clears to ensure timer stops
    if (toolTimers[prefix].interval) {
        const intervalId = toolTimers[prefix].interval;
        clearInterval(intervalId);
        clearInterval(intervalId); // Double clear
        
        // Force additional clear after small delay
        setTimeout(() => {
            clearInterval(intervalId);
        }, 10);
    }
    
    // Immediately null out all references
    toolTimers[prefix].interval = null;
    toolTimers[prefix].startTime = null;
    
    // Force garbage collection hint
    toolTimers[prefix] = { interval: null, startTime: null };
}

// --- ENHANCED REQUEST MANAGER WITH PRIORITY QUEUE ---
// Manages simultaneous API requests with smart queuing
const requestManager = {
    activeRequests: new Map(),
    requestQueue: [],
    maxConcurrent: 5, // Increased from 3 to 5 for better parallelism
    
    async executeWithLimit(key, fn, priority = 'normal') {
        const request = { key, fn, priority, timestamp: Date.now() };
        
        // Add to queue
        this.requestQueue.push(request);
        
        // Process queue
        while (this.requestQueue.length > 0 && this.activeRequests.size < this.maxConcurrent) {
            const currentRequest = this.requestQueue.shift();
            
            this.activeRequests.set(currentRequest.key, true);
            
            try {
                const result = await currentRequest.fn();
                this.activeRequests.delete(currentRequest.key);
                return result;
            } catch (error) {
                this.activeRequests.delete(currentRequest.key);
                throw error;
            }
        }
        
        // If queue is full, wait and retry
        if (this.activeRequests.size >= this.maxConcurrent) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return this.executeWithLimit(key, fn, priority);
        }
    },
    
    /**
     * Check how many requests are active
     */
    getActiveCount() {
        return this.activeRequests.size;
    },
    
    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            active: this.activeRequests.size,
            queued: this.requestQueue.length,
            maxConcurrent: this.maxConcurrent
        };
    }
};

// --- DOM Update Debouncer ---
// Throttles DOM updates to prevent excessive repaints
const domDebouncer = {
    timers: new Map(),
    
    debounce(key, fn, delay = 100) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        const timer = setTimeout(() => {
            fn();
            this.timers.delete(key);
        }, delay);
        this.timers.set(key, timer);
    },
    
    cancelAll() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
    }
};

// --- Core Gemini API Call Function ---
async function callGeminiApi(prompt, type, maxRetries = 3, isCodeGeneration = false, isTraceGeneration = false, isFormalLanguage = false, isTestCases = false) {
    const automataType = type.toUpperCase();
    let symbolNote = '';

    // 1. Determine Prompt and Schema based on type
    let systemPrompt = '';
    let jsonSchema = null;
    let specialOutputContainer = '';

    if (isCodeGeneration) {
        // Code generation specific setup
        systemPrompt = `You are an expert Python programmer specializing in Automata Theory. Generate a complete, runnable Python script that defines and simulates the provided ${automataType}. The script must include clear documentation and a function (e.g., 'check_string') to test if an input string is accepted. Output ONLY the raw Python code within a single string property 'pythonCode'.`;
        jsonSchema = {
            type: "OBJECT",
            properties: {
                "pythonCode": { "type": "STRING", "description": "The complete Python code for the automaton simulation." }
            }
        };
    } else if (isTraceGeneration) {
         // Trace generation specific setup (used for PDA and TM)
        systemPrompt = `You are a meticulous Automata Simulator. Generate a detailed, step-by-step computation trace for the provided automaton and test string. Output ONLY the trace steps as a single formatted text block within the 'traceOutput' property.`;
        jsonSchema = {
            type: "OBJECT",
            properties: {
                "traceOutput": { "type": "STRING", "description": "The formatted step-by-step trace simulation." }
            }
        };
        specialOutputContainer = 'traceOutput';

    } else if (isFormalLanguage) {
        // Formal Language (Set-Builder Notation) generation setup
        systemPrompt = `You are an expert in formal language theory. Based on the provided automaton parameters, output the precise mathematical definition of the accepted language L(M) using **set-builder notation** and **latex math formatting**. Do not include any explanations or extra text, only the formal definition string.`;
        jsonSchema = {
            type: "OBJECT",
            properties: {
                "formalLanguage": { "type": "STRING", "description": "The formal language definition in set-builder notation." }
            }
        };
        specialOutputContainer = 'formalLanguage';
    } else if (isTestCases) {
        // Test Case generation setup
        systemPrompt = `You are an expert in test case generation for automata. Based on the provided automaton parameters, generate 3 example **valid** strings (accepted) and 3 example **invalid** strings (rejected) that are representative of the language. Output the results as a single formatted markdown list.`;
        jsonSchema = {
            type: "OBJECT",
            properties: {
                "testCases": { "type": "STRING", "description": "Markdown list of valid and invalid test strings." }
            }
        };
        specialOutputContainer = 'testCases';

    } else {
        // Standard Automata Solving setup
        switch (automataType) {
            case 'DFA':
            case 'NFA':
            case 'DFAMIN': 
                symbolNote = (automataType === 'NFA') ? "NFA can include an epsilon transition symbol (represented as 'epsilon')." : "DFA must be deterministic and complete.";
                jsonSchema = {
                    type: "OBJECT",
                    properties: {
                        "correctedPrompt": { "type": "STRING" },
                        "formalDefinition": { "type": "STRING" },
                        "states": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "startState": { "type": "STRING" },
                        "finalStates": { "type": "ARRAY", "items": { "type": "STRING" } },
                        "transitions": { type: "ARRAY", items: { type: "OBJECT", properties: {
                            "from": { "type": "STRING" }, "to": { "type": "STRING" }, "symbol": { "type": "STRING" }
                        } } },
                        // Added visualization output for automata which need it
                        "visualizationOutput": { "type": "STRING" }
                    }
                };
                jsonSchema.propertyOrdering = ["correctedPrompt", "formalDefinition", "states", "startState", "finalStates", "transitions", "visualizationOutput"];
                
                if (automataType === 'DFAMIN') {
                     systemPrompt = `You are a world-class Automata Engineer. The user will provide a DFA definition. Your task is to apply the Minimization algorithm to this DFA and return the resulting MINIMAL DFA in the structured JSON format. The solution must be minimal and correct.
                        If the input prompt is slightly ambiguous or incorrect, you MUST first correct or refine it and provide the refined version in the 'correctedPrompt' field.
                        The JSON structure MUST strictly adhere to the provided schema.`;
                }
                
                break;
            
            case 'RE':
                symbolNote = "Output must be a minimal Regular Expression for the described language.";
                jsonSchema = { type: "OBJECT", properties: {
                    "correctedPrompt": { "type": "STRING" },
                    "regularExpression": { "type": "STRING" },
                    "visualizationOutput": { "type": "STRING", "description": "Generate a visual representation of the derivation or syntax tree using text and indentation (like a tree diagram)." }
                }};
                jsonSchema.propertyOrdering = ["correctedPrompt", "regularExpression", "visualizationOutput"];
                specialOutputContainer = 'regularExpression'; 
                break;

            case 'CFG':
                symbolNote = "Output must be a minimal Context-Free Grammar (CFG) G=(V, Σ, R, S).";
                jsonSchema = { type: "OBJECT", properties: {
                    "correctedPrompt": { "type": "STRING" },
                    "formalDefinition": { "type": "STRING" },
                    "productionRules": { "type": "STRING", "description": "The production rules, one per line, using -> (e.g., S -> aSb | epsilon)." },
                    "visualizationOutput": { "type": "STRING", "description": "Generate a sample derivation/Parse Tree for a representative short string of the language using text and indentation." }
                }};
                jsonSchema.propertyOrdering = ["correctedPrompt", "formalDefinition", "productionRules", "visualizationOutput"];
                specialOutputContainer = 'productionRules'; 
                break;
            
            case 'PDA':
                symbolNote = "PDA requires states (Q), input alphabet (Σ), stack alphabet (Γ), transition function (δ), start state (q0), start stack symbol (Z0), and final states (F). The output must be the full formal definition and a neatly formatted string of transition rules: (qi, a, Z) -> (qj, γ)";
                jsonSchema = { type: "OBJECT", properties: {
                    "correctedPrompt": { "type": "STRING" },
                    "formalDefinition": { "type": "STRING" },
                    "transitions": { "type": "STRING", "description": "The transition function delta, formatted neatly with one transition per line (e.g., (q1, a, Z) -> (q2, YZ)). Use epsilon for null symbol." },
                }};
                jsonSchema.propertyOrdering = ["correctedPrompt", "formalDefinition", "transitions"];
                specialOutputContainer = 'transitions';
                break;

            case 'LBA': // LBA logic outputs CSG rules
                symbolNote = "Output must be a detailed definition of a Context-Sensitive Grammar (CSG) G=(V, Σ, R, S) for the language recognized by the LBA. CSG rules follow the form $\alpha \to \beta$ where $|\alpha| \le |\beta|$.";
                jsonSchema = { type: "OBJECT", properties: {
                    "correctedPrompt": { "type": "STRING" },
                    "formalDefinition": { "type": "STRING" },
                    "productionRules": { "type": "STRING", "description": "The Context-Sensitive production rules, one per line, using -> (e.g., S -> ABC | aSBC)." },
                    "visualizationOutput": { "type": "STRING", "description": "Generate a sample derivation/Parse Tree for the provided test string using text and indentation." }
                }};
                jsonSchema.propertyOrdering = ["correctedPrompt", "formalDefinition", "productionRules", "visualizationOutput"];
                specialOutputContainer = 'productionRules';
                break;

            case 'TM':
                symbolNote = "Output must be a detailed definition of a Turing Machine (TM) M=(Q, Σ, Γ, δ, q0, qaccept, qreject).";
                jsonSchema = { type: "OBJECT", properties: {
                    "correctedPrompt": { "type": "STRING" },
                    "formalDefinition": { "type": "STRING" },
                    "transitions": { "type": "STRING", "description": "The transition function delta, formatted neatly with one transition per line (e.g., (q1, 0) -> (q2, X, R)). Use the blank symbol 'B'." }
                }};
                jsonSchema.propertyOrdering = ["correctedPrompt", "formalDefinition", "transitions"];
                specialOutputContainer = 'transitions';
                break;
        }

        if (!systemPrompt) {
            systemPrompt = `You are a world-class Automata Engineer. Your task is to interpret a natural language request for a ${automataType} and convert it into a structured JSON object. 
            If the input prompt is slightly ambiguous or incorrect, you MUST first correct or refine it and provide the refined version in the 'correctedPrompt' field.
            The solution must be minimal and correct. ${symbolNote}
            The JSON structure MUST strictly adhere to the provided schema.`;
        }
    }

    // 2. Perform API Call with Exponential Backoff
    for (let i = 0; i < maxRetries; i++) {
        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: jsonSchema
                }
            };
            
            const response = await fetch(API_URL_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
                    console.warn(`Rate limit hit (429). Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const jsonText = candidate.content.parts[0].text;
                const data = JSON.parse(jsonText);
                
                if (isCodeGeneration || isTraceGeneration || isFormalLanguage || isTestCases) {
                     return data.pythonCode || data.traceOutput || data.formalLanguage || data.testCases;
                }

                // For standard solve, check for special output container
                if (specialOutputContainer) {
                     data.specialOutput = data[specialOutputContainer];
                }
                return data;
            } else {
                throw new Error("API response was missing expected content.");
            }
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error(`${automataType} Solving failed after retries:`, error);
                throw new Error("Could not connect to the generation service or parse the response.");
            }
        }
    }
}

// --- NEW FEATURE: Code Generation Logic ---

async function generatePythonCode(type) {
    const elements = getElements(type);
    
    // For DFAMin, use the data from the minimized structure
    const dataKey = (type === 'dfamin' ? 'dfa' : type);
    const data = currentAutomatonData[dataKey];

    if (!data || !data.states || data.states.length === 0) {
        openModal('Code Generation Error', '<p class="text-red-600">Please solve the Automaton problem first to generate the corresponding Python code.</p>');
        return;
    }

    openModal('Python Simulation Code', '');
    document.getElementById('code-loading-indicator').classList.remove('hidden');
    
    // Start tool-specific timer
    startToolTimer('pythonCode');

    try {
        // Use request manager to allow concurrent execution
        const requestKey = `codegen-${type}-${Date.now()}`;
        
        await requestManager.executeWithLimit(requestKey, async () => {
            // Prepare the prompt for the LLM
            const machineType = (type === 'dfamin' ? 'Minimized DFA' : type.toUpperCase());

            const codePrompt = `Generate a Python class/script for this ${machineType} using the following parameters: 
            States: ${data.states.join(', ')}
            Start State: ${data.startState}
            Final States: ${data.finalStates.join(', ')}
            Transitions (from, to, symbol): ${JSON.stringify(data.transitions)}
            The code should include a simulation function and a test example.`;
            
            const apiType = (type === 'dfamin' ? 'dfa' : type);
            const pythonCode = await callGeminiApi(codePrompt, apiType, 3, true);

            // Display the generated code
            const codeHtml = `
                <pre class="whitespace-pre-wrap bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto mb-4">${pythonCode}</pre>
                <button id="copy-code-button" 
                    class="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 solver-button"
                    onclick="copyToClipboard(document.querySelector('#code-modal-content pre').textContent)"
                >
                    Copy Code
                </button>
                <div data-timer="pythonCode" class="text-sm text-gray-600 dark:text-gray-400 mt-2"></div>
            `;
            
            document.getElementById('code-modal-content').innerHTML = codeHtml;
            document.getElementById('code-loading-indicator').classList.add('hidden');
            stopToolTimer('pythonCode');
        });

    } catch (error) {
        console.error("Code generation failed:", error);
        displayCodeError(`Code generation failed. Details: ${error.message}`);
        stopToolTimer('pythonCode');
    }
}

// --- NEW FEATURE: Formal Language Generator ---

async function generateFormalLanguage(type) {
    const data = currentAutomatonData[(type === 'dfamin' ? 'dfa' : type)];
    
    if (!data || !data.states || data.states.length === 0) {
        openModal('Formal Language Error', '<p class="text-red-600">Please solve the Automaton problem first to generate the formal language definition.</p>');
        return;
    }

    openModal('Formal Language Definition', '');
    document.getElementById('code-loading-indicator').classList.remove('hidden');
    
    // Start tool-specific timer
    startToolTimer('formalLanguage');

    try {
        const requestKey = `formlang-${type}-${Date.now()}`;
        
        await requestManager.executeWithLimit(requestKey, async () => {
            const prompt = `Automaton type: ${type.toUpperCase()}. Formal Definition: ${data.formalDefinition}. Transitions: ${JSON.stringify(data.transitions)}.`;
            const languageDefinition = await callGeminiApi(prompt, type, 3, false, false, true, false);

            const title = type === 'dfamin' ? 'Formal Language $L(M\')$' : 'Formal Language $L(M)$';
            const contentHtml = `
                <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">Set-Builder Notation for the accepted language:</p>
                <div class="text-2xl font-mono text-gray-900 dark:text-gray-100 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">${languageDefinition}</div>
                <div data-timer="formalLanguage" class="text-sm text-gray-600 dark:text-gray-400 mt-2"></div>
            `;
            
            document.querySelector('#code-modal .modal-content h2').textContent = title;
            document.getElementById('code-modal-content').innerHTML = contentHtml;
            document.getElementById('code-loading-indicator').classList.add('hidden');
            stopToolTimer('formalLanguage');
        });

    } catch (error) {
        console.error("Formal Language generation failed:", error);
        displayCodeError(`Formal language generation failed. Details: ${error.message}`);
        stopToolTimer('formalLanguage');
    }
}

// --- NEW FEATURE: Test Case Generator ---

async function generateTestCases(type) {
    const data = currentAutomatonData[(type === 'dfamin' ? 'dfa' : type)];
    
    if (!data || !data.states || data.states.length === 0) {
        openModal('Test Case Error', '<p class="text-red-600">Please solve the Automaton problem first to generate test cases.</p>');
        return;
    }

    openModal('Automaton Test Cases', '');
    document.getElementById('code-loading-indicator').classList.remove('hidden');
    
    // Start tool-specific timer
    startToolTimer('testCases');

    try {
        const requestKey = `testcases-${type}-${Date.now()}`;
        
        await requestManager.executeWithLimit(requestKey, async () => {
            const prompt = `Automaton type: ${type.toUpperCase()}. Formal Definition: ${data.formalDefinition}. Transitions: ${JSON.stringify(data.transitions)}.`;
            const testCases = await callGeminiApi(prompt, type, 3, false, false, false, true);

            const title = type === 'dfamin' ? 'Test Cases for $M\'$' : 'Test Cases for $M$';
            const contentHtml = `
                <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">Generated strings to test acceptance and rejection:</p>
                <div class="prose dark:prose-invert max-w-none">
                    ${testCases}
                </div>
                <div data-timer="testCases" class="text-sm text-gray-600 dark:text-gray-400 mt-2"></div>
            `;
            
            document.querySelector('#code-modal .modal-content h2').textContent = title;
            document.getElementById('code-modal-content').innerHTML = contentHtml;
            document.getElementById('code-loading-indicator').classList.add('hidden');
            stopToolTimer('testCases');
        });

    } catch (error) {
        console.error("Test Case generation failed:", error);
        displayCodeError(`Test case generation failed. Details: ${error.message}`);
        stopToolTimer('testCases');
    }
}

// --- NEW TRACE GENERATION FUNCTION FOR PDA/TM ---

async function generateTrace(prefix, question, testString) {
    const elements = getElements(prefix);
    const machineType = prefix.toUpperCase();
    
    elements.networkContainer.innerHTML = elements.visualizationPlaceholder.outerHTML;
    elements.visualizationPlaceholder.classList.remove('hidden');
    elements.networkContainer.classList.add('hidden'); 
    
    // Re-show loading indicator over the visualization section
    const visPlaceholderBox = elements.visualizationPlaceholder.parentElement;
    const tempLoading = document.createElement('div');
    
    const themeColor = document.body.classList.contains('dark') ? 'gray' : prefix;

    tempLoading.className = `flex flex-col justify-center items-center py-12 bg-${themeColor}-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 loading-pulse`;
    tempLoading.innerHTML = `<div class="spinner bg-${themeColor}-600"></div>
                                 <div class="time-indicator-content mt-4 text-${themeColor}-700 dark:text-gray-300">
                                     <svg class="text-${themeColor}-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clip-rule="evenodd"></path></svg>
                                     <span>Generating Trace...</span>
                                     <span class="time-elapsed text-${themeColor}-800 dark:text-gray-500">0.00s</span>
                                 </div>`;
    visPlaceholderBox.appendChild(tempLoading);
    
    // Set up a local timer for the trace generation step
    const startTime = performance.now();
    let traceTimerInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const elapsedEl = tempLoading.querySelector('.time-elapsed');
        if (elapsedEl) {
            elapsedEl.textContent = `${elapsed.toFixed(2)}s`;
        }
    }, 100);


    try {
        // The full prompt for trace generation
        const tracePrompt = `Generate a Computation Trace for the following ${machineType} problem and input string:
        Problem: ${question}
        Input String: ${testString}`;

        const traceOutput = await callGeminiApi(tracePrompt, prefix, 3, false, true);

        if (!traceOutput) {
            throw new Error("Trace generation returned empty content.");
        }

        elements.networkContainer.innerHTML = traceOutput;
        elements.networkContainer.classList.remove('hidden');
        elements.networkContainer.classList.add('overflow-y-scroll'); // Ensure scrollable for long traces
        elements.visualizationPlaceholder.classList.add('hidden');
        
    } catch (error) {
        console.error("Trace generation failed:", error);
        elements.visualizationPlaceholder.textContent = `Trace generation failed. Details: ${error.message}`;
        elements.visualizationPlaceholder.classList.remove('hidden');

    } finally {
        clearInterval(traceTimerInterval);
        visPlaceholderBox.removeChild(tempLoading);
    }
}


// Renders the structured textual output for RE, CFG, LBA
function renderStructuredVisualization(data, elements) {
    if (!data.visualizationOutput || !elements.networkContainer) {
        if (elements.visualizationPlaceholder) {
            elements.visualizationPlaceholder.classList.remove('hidden');
        }
        if (elements.networkContainer) {
            elements.networkContainer.classList.add('hidden');
        }
        return;
    }
    
    if (elements.networkContainer) {
        elements.networkContainer.innerHTML = data.visualizationOutput;
        elements.networkContainer.classList.remove('hidden');
    }
    if (elements.visualizationPlaceholder) {
        elements.visualizationPlaceholder.classList.add('hidden');
    }
}

// Renders Formal Definition and Transition Table/Rules
function renderFormalDefinition(data, elements, type) {
    // Null checks for transition table and formal definition element
    if (elements.transitionTableElement) {
        elements.transitionTableElement.innerHTML = '';
    }
    if (elements.formalDefinitionElement) {
        elements.formalDefinitionElement.innerHTML = data.formalDefinition;
    }

    if (type === 'dfa' || type === 'nfa' || type === 'dfamin') {
        // *** DFA/NFA/DFAMin Transition Table Logic (UNCHANGED) ***
        let alphabet = Array.from(new Set(data.transitions.map(t => t.symbol))).sort();
        
        const epsilonIndex = alphabet.indexOf('epsilon');
        if (epsilonIndex > -1) {
            alphabet.splice(epsilonIndex, 1);
            alphabet.unshift('&epsilon;');
        }

        let tableHtml = `<table class="transition-table"><thead><tr><th>&delta;</th>`;
        alphabet.forEach(symbol => {
            tableHtml += `<th>${symbol.replace('epsilon', '&epsilon;')}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;

        const transitionMap = new Map();
        data.states.forEach(state => transitionMap.set(state, new Map()));
        data.transitions.forEach(t => {
            const sym = t.symbol.replace('epsilon', '&epsilon;');
            if (!transitionMap.get(t.from).has(sym)) {
                transitionMap.get(t.from).set(sym, []);
            }
            transitionMap.get(t.from).get(sym).push(t.to);
        });

        data.states.forEach(state => {
            const isStart = state === data.startState;
            const isFinal = data.finalStates.includes(state);
            
            let stateClass = '';
            if (isStart) stateClass += ' start-state';
            if (isFinal) stateClass += ' final-state';
            
            tableHtml += `<tr><td class="${stateClass}">${isStart ? '&rarr; ' : ''}${isFinal ? '* ' : ''}${state}</td>`;
            
            alphabet.forEach(symbol => {
                const nextStates = transitionMap.get(state).get(symbol) || []; 
                let cellContent;

                if (type === 'dfa' || type === 'dfamin') {
                    cellContent = nextStates[0] || '-';
                } else { // NFA
                    cellContent = nextStates.length > 0 ? `{${nextStates.join(', ')}}` : '&#8709;';
                }

                tableHtml += `<td>${cellContent}</td>`;
            });
            tableHtml += `</tr>`;
        });

        tableHtml += `</tbody></table>`;
        if (elements.transitionTableElement) {
            elements.transitionTableElement.innerHTML = `<div class="transition-table-container">${tableHtml}</div>`;
        }
    
    } else if (type === 'cfg' || type === 'lba') { // CFG and LBA output Production Rules
        // *** CFG/LBA Production Rules Logic ***
        const rulesHtml = data.productionRules.split('\n').map(line => `<div>${line}</div>`).join('');
        if (elements.transitionTableElement) {
            elements.transitionTableElement.innerHTML = `<div class="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-lg font-mono whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-200">${rulesHtml}</div>`;
        }
    } else if (type === 'pda') {
        // *** PDA Transitions Logic ***
        const transitionsHtml = data.transitions.split('\n').map(line => `<div>${line}</div>`).join('');
        if (elements.transitionTableElement) {
            elements.transitionTableElement.innerHTML = `<div class="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-lg font-mono whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-200">${transitionsHtml}</div>`;
        }
    } else if (type === 'tm') {
        // *** TM Transitions Logic ***
        const transitionsHtml = data.transitions.split('\n').map(line => `<div>${line}</div>`).join('');
        if (elements.transitionTableElement) {
            elements.transitionTableElement.innerHTML = `<div class="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-lg font-mono whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-200">${transitionsHtml}</div>`;
        }
    }
}

// Renders Simple Output (for RE)
function renderSimpleOutput(data, elements) {
    if (elements.formalDefinitionElement) {
        elements.formalDefinitionElement.innerHTML = data.specialOutput;
    }
    if (elements.formalDefinitionCard) {
        elements.formalDefinitionCard.classList.remove('hidden');
    }
}

// Renders the Flow Chart (State Diagram) - DFA/NFA/DFAMIN ONLY
function visualizeAutomaton(dfaData, elements) {
    if (!dfaData.states || dfaData.states.length === 0 || !elements.networkContainer) {
        return;
    }

    const R_NODE = 30; // State circle radius
    const W = 800;    
    const H = 600;    
    const CX = W / 2; 
    const CY = H / 2; 
    
    const N = dfaData.states.length;
    const R_LAYOUT = N > 1 ? Math.min(W / 2, H / 2) * 0.6 : 0; 

    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Determine colors based on theme
    const isDark = document.body.classList.contains('dark');
    const arrowColor = isDark ? '#D1D5DB' : '#4A5568';
    const stateTextColor = isDark ? '#1F2937' : '#2D3748';
    const stateFillColor = isDark ? '#374151' : '#EBF8FF'; /* Slightly adjusted dark state fill */
    const finalRingColor = isDark ? '#A78BFA' : '#9F7AEA';
    const startArrowColor = isDark ? '#6EE7B7' : '#48BB78';
    const stateBorderColor = isDark ? '#6B7280' : '#3182CE';

    svg += `<defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="${arrowColor}" />
                </marker>
            </defs>`;

    const positions = {};
    const angleOffset = -Math.PI / 2;
    
    dfaData.states.forEach((state, i) => {
        let x, y;
        if (N === 1) {
            x = CX;
            y = CY;
        } else {
            const angle = angleOffset + (2 * Math.PI * i / N);
            x = CX + R_LAYOUT * Math.cos(angle);
            y = CY + R_LAYOUT * Math.sin(angle);
        }
        positions[state] = { x: x, y: y };
    });

    const pointOnCircumference = (cx, cy, tx, ty, radius) => {
        const angle = Math.atan2(ty - cy, tx - cx);
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    };
    
    const midpoint = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

    const transitionGroups = new Map();
    dfaData.transitions.forEach(t => {
        const key = `${t.from}-${t.to}`;
        if (!transitionGroups.has(key)) {
            transitionGroups.set(key, { from: t.from, to: t.to, symbols: [] });
        }
        transitionGroups.get(key).symbols.push(t.symbol);
    });

    const existingTransitions = new Map();

    transitionGroups.forEach(t => {
        const source = positions[t.from];
        const target = positions[t.to];
        const labelText = t.symbols.join(',').replace(/epsilon/g, 'ε');
        
        const forwardKey = `${t.from}-${t.to}`;
        const reverseKey = `${t.to}-${t.from}`;

        existingTransitions.set(forwardKey, true);

        if (t.from === t.to) {
            const arcRadius = R_NODE * 1.5;
            const pathD = `M ${source.x - R_NODE * 0.5} ${source.y - R_NODE} 
                           A ${arcRadius} ${arcRadius} 0 1 1 ${source.x + R_NODE * 0.5} ${source.y - R_NODE}`;

            svg += `<path d="${pathD}" 
                        stroke="${arrowColor}" fill="none" stroke-width="2" marker-end="url(#arrowhead)" />`;
            
            svg += `<text x="${source.x}" y="${source.y - R_NODE - 15}" text-anchor="middle" fill="${arrowColor}" font-size="14"
                        stroke="${isDark ? '#1F293B' : 'white'}" stroke-width="4" paint-order="stroke">${labelText}</text>`;

        } else if (existingTransitions.has(reverseKey) && t.from < t.to) {
            
            const mid = midpoint(source, target);
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const perpX = -dy * 0.1;
            const perpY = dx * 0.1;
            
            const controlX = mid.x + perpX * 3;
            const controlY = mid.y + perpY * 3;

            const startPoint = pointOnCircumference(source.x, source.y, controlX, controlY, R_NODE);
            const endPoint = pointOnCircumference(target.x, target.y, controlX, controlY, R_NODE);

            const pathD = `M ${startPoint.x} ${startPoint.y} Q ${controlX} ${controlY} ${endPoint.x} ${endPoint.y}`;

            svg += `<path d="${pathD}" 
                        stroke="${arrowColor}" fill="none" stroke-width="2" marker-end="url(#arrowhead)" />`;
            
            const labelX = mid.x + perpX * 1.5;
            const labelY = mid.y + perpY * 1.5;

            svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" fill="${arrowColor}" font-size="14"
                        stroke="${isDark ? '#1F293B' : 'white'}" stroke-width="4" paint-order="stroke" dominant-baseline="middle">${labelText}</text>`;

        } else if (!existingTransitions.has(reverseKey)) {
            
            const startPoint = pointOnCircumference(source.x, source.y, target.x, target.y, R_NODE);
            const endPoint = pointOnCircumference(target.x, target.y, source.x, source.y, R_NODE);
            
            svg += `<line x1="${startPoint.x}" y1="${startPoint.y}" x2="${endPoint.x}" y2="${endPoint.y}" 
                        stroke="${arrowColor}" stroke-width="2" marker-end="url(#arrowhead)" />`;

            const mid = midpoint(startPoint, endPoint);
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            const offset = 18; 
            const labelX = mid.x - offset * Math.sin(angle);
            const labelY = mid.y + offset * Math.cos(angle);

            svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" fill="${arrowColor}" font-size="14"
                        stroke="${isDark ? '#1F293B' : 'white'}" stroke-width="4" paint-order="stroke" dominant-baseline="middle">${labelText}</text>`;
        }
    });

    // 4. Draw States (Nodes) and Labels
    dfaData.states.forEach(state => {
        const pos = positions[state];
        const isFinal = dfaData.finalStates.includes(state);
        
        if (isFinal) {
            svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${R_NODE + 5}" fill="none" stroke="${finalRingColor}" stroke-width="3" />`;
        }

        const stateColor = isFinal ? (isDark ? '#374151' : '#F3E8FF') : stateFillColor;
        const stateBorder = state === dfaData.startState ? startArrowColor : stateBorderColor;
        const borderWidth = state === dfaData.startState ? 4 : 2;

        svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${R_NODE}" fill="${stateColor}" stroke="${stateBorder}" stroke-width="${borderWidth}" />`;

        svg += `<text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" fill="${stateTextColor}" font-weight="bold">${state}</text>`;

        // Start Arrow (if this is the start state)
        if (state === dfaData.startState) {
            const START_ARROW_LENGTH = 35;
            
            const stateIndex = dfaData.states.indexOf(state);
            const angle = N === 1 
                ? Math.PI 
                : angleOffset + (2 * Math.PI * stateIndex / N);
            
            const startX = pos.x + (R_NODE + START_ARROW_LENGTH) * Math.cos(angle - Math.PI);
            const startY = pos.y + (R_NODE + START_ARROW_LENGTH) * Math.sin(angle - Math.PI);

            const endPoint = pointOnCircumference(pos.x, pos.y, startX, startY, R_NODE);
            
            svg += `<line x1="${startX}" y1="${startY}" x2="${endPoint.x}" y2="${endPoint.y}" 
                        stroke="${startArrowColor}" stroke-width="3" marker-end="url(#arrowhead)" />`;
        }
    });

    svg += `</svg>`;
    
    // Update DOM with null checks
    if (elements.networkContainer) {
        elements.networkContainer.innerHTML = svg;
        elements.networkContainer.classList.remove('hidden');
    }
    if (elements.visualizationPlaceholder) {
        elements.visualizationPlaceholder.classList.add('hidden');
    }
}

// --- Core Solver Logic (Shared and Type-Specific) ---

async function solveAutomaton(prefix) {
    const elements = getElements(prefix);
    
    // CRITICAL: Stop any running timer FIRST before anything else
    stopTimer(prefix);
    
    // Validate critical elements exist
    if (!elements.questionInput) {
        console.error(`${prefix}: Question input element not found`);
        return;
    }
    if (!elements.solveButton) {
        console.error(`${prefix}: Solve button element not found`);
        return;
    }
    
    const question = elements.questionInput.value.trim();
    const testString = elements.testStringInput ? elements.testStringInput.value.trim() : null;

    // Early validation checks (BEFORE disabling button or starting timer)
    if (!question) {
        displayError(elements, `Please enter a ${prefix.toUpperCase()} design question.`);
        return;
    }
    if (['pda', 'tm', 'lba'].includes(prefix) && !testString && prefix !== 'lba' ) {
         // LBA derivation can use a default test string if available
        displayError(elements, `Please provide an Input string for the **Computation Trace** in the field below the prompt.`);
        return;
    }
    
    if (apiKey === "") {
        displayError(elements, "To run this application, you must provide a valid Gemini API Key.");
        return;
    }

    // COMPLETE UI RESET: Clear all previous state before starting
    if (elements.solveButton) {
        elements.solveButton.disabled = true;
    }
    if (elements.loadingIndicator) {
        elements.loadingIndicator.classList.remove('hidden');
    }
    if (elements.formalDefinitionCard) {
        elements.formalDefinitionCard.classList.add('hidden');
    }
    if (elements.promptFeedback) {
        elements.promptFeedback.classList.add('hidden');
    }
    if (elements.errorMessageDiv) {
        elements.errorMessageDiv.classList.add('hidden');
    }
    
    // Reset timer display to zero before starting
    if (elements.timeElapsed) {
        elements.timeElapsed.textContent = '0.00s';
    }
    
    // Clear previous results completely
    if (elements.networkContainer) {
        elements.networkContainer.innerHTML = '';
        if (elements.visualizationPlaceholder) {
            elements.visualizationPlaceholder.classList.remove('hidden');
        }
        elements.networkContainer.classList.add('hidden');
    } else {
        const placeholder = document.getElementById(`${prefix}-visualization-placeholder`);
        const network = document.getElementById(`${prefix}-network`);
        if (placeholder) placeholder.classList.remove('hidden');
        if (network) network.classList.add('hidden');
    }

    // Clear output containers
    if (elements.transitionTableElement) {
        elements.transitionTableElement.innerHTML = '';
    }
    if (elements.formalDefinitionElement) {
        elements.formalDefinitionElement.innerHTML = '';
    }
    
    // NOW start the fresh timer after complete cleanup
    startTimer(elements, prefix);

    try {
        // Construct the full prompt for non-automata
        let fullPrompt = question;
        
        // Only PDA/TM split into two calls. LBA/CFG/RE still get their viz output in the first call.
        const isTwoStep = ['pda', 'tm'].includes(prefix);

        // --- STEP 1: Get Formal Definition and Transitions ---
        
        // For two-step models, only send the core question first.
        if (!isTwoStep) {
            // For single-step models (LBA/CFG/RE), add the test string for visualization/derivation now
            if (testString) {
                fullPrompt += ` The specific test string to simulate or derive is: "${testString}"`;
            }
        }
        
        const data = await callGeminiApi(fullPrompt, prefix);

        if (!data) {
            throw new Error("The API returned an empty or invalid structure.");
        }

        // Store data globally for code generation. DFAMin maps its data to the 'dfa' key for code generation
        const dataKey = (prefix === 'dfamin' ? 'dfa' : prefix);
        currentAutomatonData[dataKey] = data;

        // Update corrected prompt with null check
        if (elements.correctedPromptElement) {
            elements.correctedPromptElement.textContent = data.correctedPrompt;
        }
        if (elements.promptFeedback) {
            elements.promptFeedback.classList.remove('hidden');
        }

        // Render Formal Definition and Transitions/Rules first
        if (prefix === 're') {
            renderSimpleOutput(data, elements);
        } else {
            // Ensure appropriate classes for card elements in dark mode
            if (elements.formalDefinitionCard) {
                elements.formalDefinitionCard.classList.add('bg-card');
                if (document.body.classList.contains('dark')) {
                    elements.formalDefinitionCard.classList.remove('bg-white');
                }
            }
            renderFormalDefinition(data, elements, prefix);
            if (elements.formalDefinitionCard) {
                elements.formalDefinitionCard.classList.remove('hidden');
            }
        }

        // --- STEP 2: Render Visualization ---
        if (isTwoStep) {
            // For PDA/TM: Trigger the separate Trace Generation API call
            if (!testString) {
                stopTimer(prefix);
                if (elements.loadingIndicator) elements.loadingIndicator.classList.add('hidden');
                if (elements.solveButton) elements.solveButton.disabled = false;
                displayError(elements, `Please provide an Input string for the **Computation Trace** in the field below the prompt.`);
                return;
            }
            // Pass the formal definition data to the trace generator
            await generateTrace(prefix, data.formalDefinition + "\nTransitions: " + data.transitions, testString);
        } else if (prefix === 'dfa' || prefix === 'nfa' || prefix === 'dfamin') {
            // DFA/NFA/DFAMIN: Render SVG Flow Chart
            if (!data.states || data.states.length === 0) {
                throw new Error("The API returned an empty or invalid Automaton structure (no states found).");
            }
            visualizeAutomaton(data, elements);
        } else {
            // RE/CFG/LBA: Render Structured Text Visualization (Parse Tree / Derivation)
            renderStructuredVisualization(data, elements);
        }

    } catch (error) {
        console.error(`${prefix.toUpperCase()} Solving failed:`, error);
        displayError(elements, `Failed to generate the ${prefix.toUpperCase()}. Details: ${error.message}. Please check your prompt and try again.`);
        
        // Ensure visualization placeholder is visible on failure if it exists
        if (elements.visualizationPlaceholder) {
            elements.visualizationPlaceholder.classList.remove('hidden');
        }
        if (elements.networkContainer) {
            elements.networkContainer.classList.add('hidden');
        }
    } finally {
        // CRITICAL: AGGRESSIVE cleanup to prevent stuck state
        
        // Stop timer with delay to ensure it completes
        stopTimer(prefix);
        
        // Additional delayed cleanup to ensure state is fully reset
        setTimeout(() => {
            // Force stop again in case of race condition
            stopTimer(prefix);
            
            // Reset ALL UI elements to ready state
            if (elements.loadingIndicator) {
                elements.loadingIndicator.classList.add('hidden');
            }
            if (elements.solveButton) {
                elements.solveButton.disabled = false;
            }
            
            // Ensure timer display is visible and reset
            if (elements.timeElapsed) {
                elements.timeElapsed.style.display = '';
                // Don't reset to 0 here - let it show final time
            }
        }, 100);
    }
}

// --- Type-Specific Wrappers with Double-Click Prevention ---
// Prevents multiple simultaneous executions
const executionLocks = {
    dfa: false, nfa: false, dfamin: false, re: false,
    cfg: false, pda: false, lba: false, tm: false
};

async function solveDFA() { 
    if (executionLocks.dfa) return;
    executionLocks.dfa = true;
    try {
        await solveAutomaton('dfa');
    } finally {
        executionLocks.dfa = false;
    }
}

async function solveNFA() { 
    if (executionLocks.nfa) return;
    executionLocks.nfa = true;
    try {
        await solveAutomaton('nfa');
    } finally {
        executionLocks.nfa = false;
    }
}

async function solveDFAMin() { 
    if (executionLocks.dfamin) return;
    executionLocks.dfamin = true;
    try {
        await solveAutomaton('dfamin');
    } finally {
        executionLocks.dfamin = false;
    }
}

async function solveRE() { 
    if (executionLocks.re) return;
    executionLocks.re = true;
    try {
        await solveAutomaton('re');
    } finally {
        executionLocks.re = false;
    }
}

async function solveCFG() { 
    if (executionLocks.cfg) return;
    executionLocks.cfg = true;
    try {
        await solveAutomaton('cfg');
    } finally {
        executionLocks.cfg = false;
    }
}

async function solvePDA() { 
    if (executionLocks.pda) return;
    executionLocks.pda = true;
    try {
        await solveAutomaton('pda');
    } finally {
        executionLocks.pda = false;
    }
}

async function solveLBA() { 
    if (executionLocks.lba) return;
    executionLocks.lba = true;
    try {
        await solveAutomaton('lba');
    } finally {
        executionLocks.lba = false;
    }
}

async function solveTM() { 
    if (executionLocks.tm) return;
    executionLocks.tm = true;
    try {
        await solveAutomaton('tm');
    } finally {
        executionLocks.tm = false;
    }
}

// ============================================================
// NEW FEATURES: NFA to DFA, Moore Machine, Mealy Machine
// COMPLETELY REDESIGNED FROM SCRATCH
// ============================================================

// NFA to DFA Conversion - FRESH IMPLEMENTATION
async function solveNFAtoDFA() {
    const questionInput = document.getElementById('nfatodfa-question');
    const loadingIndicator = document.getElementById('nfatodfa-loading-indicator');
    const timeElapsed = document.getElementById('nfatodfa-time-elapsed');
    const solveButton = document.getElementById('solve-nfatodfa-button');
    const promptFeedback = document.getElementById('nfatodfa-prompt-feedback');
    const correctedPrompt = document.getElementById('nfatodfa-corrected-prompt');
    const originalNFACard = document.getElementById('nfatodfa-original-nfa-card');
    const convertedDFACard = document.getElementById('nfatodfa-converted-dfa-card');
    const errorMessageDiv = document.getElementById('nfatodfa-error-message');
    const errorText = document.getElementById('nfatodfa-error-text');

    const question = questionInput.value.trim();
    if (!question) {
        errorText.textContent = 'Please enter an NFA description.';
        errorMessageDiv.classList.remove('hidden');
        return;
    }

    // Reset UI
    if (originalNFACard) originalNFACard.classList.add('hidden');
    if (convertedDFACard) convertedDFACard.classList.add('hidden');
    if (errorMessageDiv) errorMessageDiv.classList.add('hidden');
    if (promptFeedback) promptFeedback.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (solveButton) solveButton.disabled = true;

    // Start tool-specific timer
    if (toolTimers.nfatodfa.interval) clearInterval(toolTimers.nfatodfa.interval);
    toolTimers.nfatodfa.startTime = performance.now();
    toolTimers.nfatodfa.interval = setInterval(() => {
        if (timeElapsed) {
            const elapsed = (performance.now() - toolTimers.nfatodfa.startTime) / 1000;
            timeElapsed.textContent = `${elapsed.toFixed(2)}s`;
        }
    }, 100);

    try {
        // Simplified prompt - ask for plain JSON only
        const prompt = `Convert the following NFA description to DFA using subset construction.

Description: ${question}

Provide ONLY a JSON response (no markdown, no explanations) in this exact format:
{
  "originalNFA": {
    "states": ["q0", "q1"],
    "alphabet": ["a", "b"],
    "transitions": {"q0": {"a": ["q1"], "b": ["q0"]}},
    "startState": "q0",
    "acceptStates": ["q1"]
  },
  "convertedDFA": {
    "states": ["{q0}", "{q1}"],
    "alphabet": ["a", "b"],
    "transitions": {"{q0}": {"a": "{q1}", "b": "{q0}"}},
    "startState": "{q0}",
    "acceptStates": ["{q1}"]
  },
  "conversionSteps": ["Step 1: ...", "Step 2: ..."]
}`;

        const response = await fetch(API_URL_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        
        clearInterval(window.nfaToDfaTimer);
        loadingIndicator.classList.add('hidden');
        solveButton.disabled = false;

        // Extract and parse JSON
        let responseText = data.candidates[0].content.parts[0].text;
        console.log('Raw API Response:', responseText);
        
        // Clean up response - remove markdown and extra text
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find JSON object
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('No JSON found in response');
        }
        
        const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
        console.log('Extracted JSON:', jsonStr.substring(0, 200) + '...');
        
        const result = JSON.parse(jsonStr);

        // Display NFA
        document.getElementById('nfatodfa-original-nfa').innerHTML = `
            <p class="mb-2"><strong>States:</strong> {${result.originalNFA.states.join(', ')}}</p>
            <p class="mb-2"><strong>Alphabet:</strong> {${result.originalNFA.alphabet.join(', ')}}</p>
            <p class="mb-2"><strong>Start:</strong> ${result.originalNFA.startState}</p>
            <p class="mb-2"><strong>Accept:</strong> {${result.originalNFA.acceptStates.join(', ')}}</p>
        `;

        // NFA Table
        let nfaTable = '<table class="transition-table"><thead><tr><th>State</th>';
        result.originalNFA.alphabet.forEach(sym => nfaTable += `<th>${sym}</th>`);
        nfaTable += '</tr></thead><tbody>';
        result.originalNFA.states.forEach(state => {
            nfaTable += `<tr><td>${state}</td>`;
            result.originalNFA.alphabet.forEach(sym => {
                const next = result.originalNFA.transitions[state]?.[sym] || [];
                nfaTable += `<td>{${Array.isArray(next) ? next.join(', ') : next}}</td>`;
            });
            nfaTable += '</tr>';
        });
        nfaTable += '</tbody></table>';
        document.getElementById('nfatodfa-nfa-table').innerHTML = nfaTable;

        originalNFACard.classList.remove('hidden');

        // Display DFA
        document.getElementById('nfatodfa-converted-dfa').innerHTML = `
            <p class="mb-2"><strong>States:</strong> {${result.convertedDFA.states.join(', ')}}</p>
            <p class="mb-2"><strong>Alphabet:</strong> {${result.convertedDFA.alphabet.join(', ')}}</p>
            <p class="mb-2"><strong>Start:</strong> ${result.convertedDFA.startState}</p>
            <p class="mb-2"><strong>Accept:</strong> {${result.convertedDFA.acceptStates.join(', ')}}</p>
        `;

        // DFA Table
        let dfaTable = '<table class="transition-table"><thead><tr><th>State</th>';
        result.convertedDFA.alphabet.forEach(sym => dfaTable += `<th>${sym}</th>`);
        dfaTable += '</tr></thead><tbody>';
        result.convertedDFA.states.forEach(state => {
            dfaTable += `<tr><td>${state}</td>`;
            result.convertedDFA.alphabet.forEach(sym => {
                const next = result.convertedDFA.transitions[state]?.[sym] || '∅';
                dfaTable += `<td>${next}</td>`;
            });
            dfaTable += '</tr>';
        });
        dfaTable += '</tbody></table>';
        document.getElementById('nfatodfa-dfa-table').innerHTML = dfaTable;

        // Steps
        document.getElementById('nfatodfa-steps').innerHTML = 
            result.conversionSteps.map((s, i) => `<div class="mb-2"><strong>Step ${i+1}:</strong> ${s}</div>`).join('');

        convertedDFACard.classList.remove('hidden');

        // Simple text diagrams (no Mermaid complexity)
        document.getElementById('nfatodfa-nfa-viz').innerHTML = createSimpleDiagram(result.originalNFA, 'NFA');
        document.getElementById('nfatodfa-dfa-viz').innerHTML = createSimpleDiagram(result.convertedDFA, 'DFA');

    } catch (error) {
        console.error('NFA to DFA Error:', error);
        if (errorText) errorText.textContent = error.message;
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    } finally {
        // Stop tool-specific timer
        if (toolTimers.nfatodfa.interval) {
            clearInterval(toolTimers.nfatodfa.interval);
            toolTimers.nfatodfa.interval = null;
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (solveButton) solveButton.disabled = false;
    }
}

// Moore Machine - FRESH IMPLEMENTATION
async function solveMoore() {
    const questionInput = document.getElementById('moore-question');
    const loadingIndicator = document.getElementById('moore-loading-indicator');
    const timeElapsed = document.getElementById('moore-time-elapsed');
    const solveButton = document.getElementById('solve-moore-button');
    const formalDefinitionCard = document.getElementById('moore-formal-definition-card');
    const errorMessageDiv = document.getElementById('moore-error-message');
    const errorText = document.getElementById('moore-error-text');

    if (!questionInput) {
        console.error('Moore question input element not found');
        return;
    }

    const question = questionInput.value.trim();
    if (!question) {
        if (errorText) errorText.textContent = 'Please enter a Moore machine description.';
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
        return;
    }

    // Reset UI
    if (formalDefinitionCard) formalDefinitionCard.classList.add('hidden');
    if (errorMessageDiv) errorMessageDiv.classList.add('hidden');
    const testOutput = document.getElementById('moore-test-output');
    if (testOutput) testOutput.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (solveButton) solveButton.disabled = true;

    // Timer
    if (toolTimers.moore.interval) clearInterval(toolTimers.moore.interval);
    toolTimers.moore.startTime = performance.now();
    toolTimers.moore.interval = setInterval(() => {
        if (timeElapsed) {
            const elapsed = (performance.now() - toolTimers.moore.startTime) / 1000;
            timeElapsed.textContent = `${elapsed.toFixed(2)}s`;
        }
    }, 100);

    try {
        const prompt = `Design a Moore machine for: ${question}

In Moore machines, outputs are on states (not transitions).

Provide ONLY a JSON response (no markdown) in this format:
{
  "states": ["q0", "q1", "q2"],
  "alphabet": ["a", "b"],
  "outputs": ["0", "1"],
  "transitions": {"q0": {"a": "q1", "b": "q0"}, "q1": {"a": "q2", "b": "q1"}},
  "outputFunction": {"q0": "0", "q1": "1", "q2": "0"},
  "startState": "q0"
}`;

        const response = await fetch(API_URL_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        
        // Stop timer on successful response
        if (toolTimers.moore.interval) {
            clearInterval(toolTimers.moore.interval);
            toolTimers.moore.interval = null;
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (solveButton) solveButton.disabled = false;

        // Parse JSON
        let responseText = data.candidates[0].content.parts[0].text;
        console.log('Moore Response:', responseText);
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found');
        
        const result = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
        window.mooreMachineData = result;

        // Display
        document.getElementById('moore-formal-definition').innerHTML = `
            <p class="mb-2"><strong>States:</strong> {${result.states.join(', ')}}</p>
            <p class="mb-2"><strong>Input Alphabet:</strong> {${result.alphabet.join(', ')}}</p>
            <p class="mb-2"><strong>Output Alphabet:</strong> {${result.outputs.join(', ')}}</p>
            <p class="mb-2"><strong>Start State:</strong> ${result.startState}</p>
        `;

        // Table
        let table = '<table class="transition-table"><thead><tr><th>State</th>';
        result.alphabet.forEach(s => table += `<th>δ(${s})</th>`);
        table += '<th>Output λ</th></tr></thead><tbody>';
        result.states.forEach(state => {
            table += `<tr><td>${state}</td>`;
            result.alphabet.forEach(s => {
                table += `<td>${result.transitions[state]?.[s] || '-'}</td>`;
            });
            table += `<td class="font-bold text-teal-600">${result.outputFunction[state]}</td></tr>`;
        });
        table += '</tbody></table>';
        document.getElementById('moore-transition-table').innerHTML = table;

        // Diagram
        const mooreNetwork = document.getElementById('moore-network');
        const moorePlaceholder = document.getElementById('moore-visualization-placeholder');
        if (mooreNetwork) mooreNetwork.innerHTML = createMooreDiagram(result);
        if (moorePlaceholder) moorePlaceholder.classList.add('hidden');
        
        if (formalDefinitionCard) formalDefinitionCard.classList.remove('hidden');

    } catch (error) {
        console.error('Moore Error:', error);
        if (errorText) errorText.textContent = error.message;
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    } finally {
        // Stop tool-specific timer
        if (toolTimers.moore.interval) {
            clearInterval(toolTimers.moore.interval);
            toolTimers.moore.interval = null;
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (solveButton) solveButton.disabled = false;
    }
}

// Mealy Machine - FRESH IMPLEMENTATION
async function solveMealy() {
    const questionInput = document.getElementById('mealy-question');
    const loadingIndicator = document.getElementById('mealy-loading-indicator');
    const timeElapsed = document.getElementById('mealy-time-elapsed');
    const solveButton = document.getElementById('solve-mealy-button');
    const formalDefinitionCard = document.getElementById('mealy-formal-definition-card');
    const errorMessageDiv = document.getElementById('mealy-error-message');
    const errorText = document.getElementById('mealy-error-text');

    if (!questionInput) {
        console.error('Mealy question input element not found');
        return;
    }

    const question = questionInput.value.trim();
    if (!question) {
        if (errorText) errorText.textContent = 'Please enter a Mealy machine description.';
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
        return;
    }

    // Reset UI
    if (formalDefinitionCard) formalDefinitionCard.classList.add('hidden');
    if (errorMessageDiv) errorMessageDiv.classList.add('hidden');
    const testOutput = document.getElementById('mealy-test-output');
    if (testOutput) testOutput.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (solveButton) solveButton.disabled = true;

    // Timer
    if (toolTimers.mealy.interval) clearInterval(toolTimers.mealy.interval);
    toolTimers.mealy.startTime = performance.now();
    toolTimers.mealy.interval = setInterval(() => {
        if (timeElapsed) {
            const elapsed = (performance.now() - toolTimers.mealy.startTime) / 1000;
            timeElapsed.textContent = `${elapsed.toFixed(2)}s`;
        }
    }, 100);

    try {
        const prompt = `Design a Mealy machine for: ${question}

In Mealy machines, outputs are on transitions (not states).

Provide ONLY a JSON response (no markdown) in this format:
{
  "states": ["q0", "q1"],
  "alphabet": ["a", "b"],
  "outputs": ["0", "1"],
  "transitions": {"q0": {"a": {"state": "q1", "output": "1"}, "b": {"state": "q0", "output": "0"}}},
  "startState": "q0"
}`;

        const response = await fetch(API_URL_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        
        // Stop timer on successful response
        if (toolTimers.mealy.interval) {
            clearInterval(toolTimers.mealy.interval);
            toolTimers.mealy.interval = null;
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (solveButton) solveButton.disabled = false;

        // Parse JSON
        let responseText = data.candidates[0].content.parts[0].text;
        console.log('Mealy Response:', responseText);
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found');
        
        const result = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
        window.mealyMachineData = result;

        // Display
        document.getElementById('mealy-formal-definition').innerHTML = `
            <p class="mb-2"><strong>States:</strong> {${result.states.join(', ')}}</p>
            <p class="mb-2"><strong>Input Alphabet:</strong> {${result.alphabet.join(', ')}}</p>
            <p class="mb-2"><strong>Output Alphabet:</strong> {${result.outputs.join(', ')}}</p>
            <p class="mb-2"><strong>Start State:</strong> ${result.startState}</p>
        `;

        // Table
        let table = '<table class="transition-table"><thead><tr><th>State</th>';
        result.alphabet.forEach(s => table += `<th>δ(${s}) / λ(${s})</th>`);
        table += '</tr></thead><tbody>';
        result.states.forEach(state => {
            table += `<tr><td>${state}</td>`;
            result.alphabet.forEach(s => {
                const trans = result.transitions[state]?.[s];
                if (trans) {
                    table += `<td>${trans.state} / <span class="text-orange-600 font-bold">${trans.output}</span></td>`;
                } else {
                    table += `<td>-</td>`;
                }
            });
            table += '</tr>';
        });
        table += '</tbody></table>';
        document.getElementById('mealy-transition-table').innerHTML = table;

        // Diagram
        const mealyNetwork = document.getElementById('mealy-network');
        const mealyPlaceholder = document.getElementById('mealy-visualization-placeholder');
        if (mealyNetwork) mealyNetwork.innerHTML = createMealyDiagram(result);
        if (mealyPlaceholder) mealyPlaceholder.classList.add('hidden');
        
        if (formalDefinitionCard) formalDefinitionCard.classList.remove('hidden');

    } catch (error) {
        console.error('Mealy Error:', error);
        if (errorText) errorText.textContent = error.message;
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    } finally {
        // Stop tool-specific timer
        if (toolTimers.mealy.interval) {
            clearInterval(toolTimers.mealy.interval);
            toolTimers.mealy.interval = null;
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (solveButton) solveButton.disabled = false;
    }
}

// Helper: Create simple text-based diagrams
function createSimpleDiagram(machine, type) {
    let html = '<div class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600">';
    html += `<div class="text-center font-bold text-xl mb-6 text-blue-600 dark:text-blue-400">${type} State Diagram</div>`;
    html += '<div class="space-y-4 font-mono text-sm">';
    
    machine.states.forEach(state => {
        const isStart = state === machine.startState;
        const isAccept = machine.acceptStates?.includes(state);
        let stateLabel = state;
        if (isStart) stateLabel = '→ ' + stateLabel;
        if (isAccept) stateLabel = '((' + stateLabel + '))';
        
        html += `<div class="p-3 bg-white dark:bg-gray-700 rounded border-l-4 ${isAccept ? 'border-green-500' : 'border-blue-500'}">`;
        html += `<div class="font-bold text-lg mb-2">${stateLabel}</div>`;
        
        // Show transitions
        const trans = machine.transitions[state];
        if (trans) {
            Object.entries(trans).forEach(([symbol, next]) => {
                const nextStates = Array.isArray(next) ? next.join(', ') : next;
                html += `<div class="ml-4 text-gray-700 dark:text-gray-300">--${symbol}→ ${nextStates}</div>`;
            });
        }
        html += '</div>';
    });
    
    html += '</div></div>';
    return html;
}

function createMooreDiagram(machine) {
    let html = '<div class="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 rounded-lg border-2 border-teal-300 dark:border-teal-600">';
    html += '<div class="text-center font-bold text-xl mb-6 text-teal-600 dark:text-teal-300">Moore Machine State Diagram</div>';
    html += '<div class="space-y-4 font-mono text-sm">';
    
    machine.states.forEach(state => {
        const isStart = state === machine.startState;
        const output = machine.outputFunction[state];
        
        html += `<div class="p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-teal-500">`;
        html += `<div class="font-bold text-lg">${isStart ? '→ ' : ''}(${state}) / Output: <span class="text-teal-600 dark:text-teal-400">${output}</span></div>`;
        
        const trans = machine.transitions[state];
        if (trans) {
            Object.entries(trans).forEach(([symbol, next]) => {
                html += `<div class="ml-4 text-gray-700 dark:text-gray-300">--${symbol}→ ${next}</div>`;
            });
        }
        html += '</div>';
    });
    
    html += '</div></div>';
    return html;
}

function createMealyDiagram(machine) {
    let html = '<div class="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg border-2 border-orange-300 dark:border-orange-600">';
    html += '<div class="text-center font-bold text-xl mb-6 text-orange-600 dark:text-orange-300">Mealy Machine State Diagram</div>';
    html += '<div class="space-y-4 font-mono text-sm">';
    
    machine.states.forEach(state => {
        const isStart = state === machine.startState;
        
        html += `<div class="p-3 bg-white dark:bg-gray-700 rounded border-l-4 border-orange-500">`;
        html += `<div class="font-bold text-lg">${isStart ? '→ ' : ''}(${state})</div>`;
        
        const trans = machine.transitions[state];
        if (trans) {
            Object.entries(trans).forEach(([symbol, t]) => {
                html += `<div class="ml-4 text-gray-700 dark:text-gray-300">--${symbol}/<span class="text-orange-600 dark:text-orange-400 font-bold">${t.output}</span>→ ${t.state}</div>`;
            });
        }
        html += '</div>';
    });
    
    html += '</div></div>';
    return html;
}

// Test functions
function testMooreString() {
    const testString = document.getElementById('moore-test-string').value;
    const outputDiv = document.getElementById('moore-test-output');
    const resultDiv = document.getElementById('moore-test-result');
    
    if (!window.mooreMachineData) {
        resultDiv.textContent = 'Please generate a Moore machine first!';
        outputDiv.classList.remove('hidden');
        return;
    }
    
    const machine = window.mooreMachineData;
    let currentState = machine.startState;
    let outputs = [machine.outputFunction[currentState]];
    
    for (const symbol of testString) {
        if (!machine.alphabet.includes(symbol)) {
            resultDiv.textContent = `Error: Symbol '${symbol}' not in alphabet!`;
            outputDiv.classList.remove('hidden');
            return;
        }
        const nextState = machine.transitions[currentState]?.[symbol];
        if (!nextState) {
            resultDiv.textContent = `Error: No transition from ${currentState} on ${symbol}`;
            outputDiv.classList.remove('hidden');
            return;
        }
        currentState = nextState;
        outputs.push(machine.outputFunction[currentState]);
    }
    
    resultDiv.textContent = outputs.join(' ');
    outputDiv.classList.remove('hidden');
}

function testMealyString() {
    const testString = document.getElementById('mealy-test-string').value;
    const outputDiv = document.getElementById('mealy-test-output');
    const resultDiv = document.getElementById('mealy-test-result');
    
    if (!window.mealyMachineData) {
        resultDiv.textContent = 'Please generate a Mealy machine first!';
        outputDiv.classList.remove('hidden');
        return;
    }
    
    const machine = window.mealyMachineData;
    let currentState = machine.startState;
    let outputs = [];
    
    for (const symbol of testString) {
        if (!machine.alphabet.includes(symbol)) {
            resultDiv.textContent = `Error: Symbol '${symbol}' not in alphabet!`;
            outputDiv.classList.remove('hidden');
            return;
        }
        const trans = machine.transitions[currentState]?.[symbol];
        if (!trans) {
            resultDiv.textContent = `Error: No transition from ${currentState} on ${symbol}`;
            outputDiv.classList.remove('hidden');
            return;
        }
        outputs.push(trans.output);
        currentState = trans.state;
    }
    
    resultDiv.textContent = outputs.join(' ');
    outputDiv.classList.remove('hidden');
}

// --- General App/Routing Functions ---

function displayError(elements, message) {
    if (elements.errorText) {
        elements.errorText.textContent = message;
    }
    if (elements.errorMessageDiv) {
        elements.errorMessageDiv.classList.remove('hidden');
    }
}

function setActiveNav(pageId) {
    // Only 'Home' nav link exists now, so we only need to manage its state
    const navLink = document.getElementById(`nav-home`);
    if (navLink) {
        if (pageId === 'home') {
            navLink.classList.add('active');
        } else {
            navLink.classList.remove('active');
        }
    }
    
    // Also manage active state for flyout menu links (visually only)
    document.querySelectorAll('.flyout-link').forEach(link => {
        const linkId = link.getAttribute('href').substring(1);
        if (linkId === pageId) {
            link.classList.add('bg-blue-100/50', 'dark:bg-blue-900/50');
        } else {
            link.classList.remove('bg-blue-100/50', 'dark:bg-blue-900/50');
        }
    });
}

function navigate(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        setActiveNav(pageId);
        window.location.hash = pageId; // Update URL hash
    }
}

function handleInitialLoad() {
    applyInitialTheme(); // Apply saved theme first

    const hash = window.location.hash.substring(1);
    let pageId = 'home'; 

    if (['dfa', 'nfa', 'dfamin', 're', 'cfg', 'pda', 'lba', 'tm', 'nfatodfa', 'moore', 'mealy'].includes(hash)) {
        pageId = hash;
    }
    
    navigate(pageId);

    // Attach event listeners to buttons
    document.getElementById('solve-dfa-button')?.addEventListener('click', solveDFA);
    document.getElementById('solve-nfa-button')?.addEventListener('click', solveNFA);
    document.getElementById('solve-dfamin-button')?.addEventListener('click', solveDFAMin); 
    document.getElementById('solve-re-button')?.addEventListener('click', solveRE);
    document.getElementById('solve-cfg-button')?.addEventListener('click', solveCFG);
    document.getElementById('solve-pda-button')?.addEventListener('click', solvePDA);
    document.getElementById('solve-lba-button')?.addEventListener('click', solveLBA); 
    document.getElementById('solve-tm-button')?.addEventListener('click', solveTM);
    document.getElementById('solve-nfatodfa-button')?.addEventListener('click', solveNFAtoDFA);
    document.getElementById('solve-moore-button')?.addEventListener('click', solveMoore);
    document.getElementById('solve-mealy-button')?.addEventListener('click', solveMealy);
    
    // Mobile menu toggle event listener
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Populate mobile language list
    populateMobileLangList();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const drawer = document.getElementById('mobile-menu-drawer');
        const toggle = document.getElementById('mobile-menu-toggle');
        if (drawer && toggle && !drawer.contains(e.target) && !toggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

window.onload = handleInitialLoad;
window.onhashchange = handleInitialLoad;
