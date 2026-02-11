

// --- GAME STATE ---
const state = {
    totalMonths: 144, // Start at 12 years old
    characterName: 'Jugador', // Player's chosen name
    gender: 'male', // 'male' or 'female'
    money: 100, // Less money for a kid
    physicalHealth: 100,
    mentalHealth: 100,
    happiness: 100,
    stress: 0,
    diet: 'balanced',
    intelligence: 10,
    charisma: 10, // New Stat
    creativity: 10, // New Stat
    fame: {
        followers: 0,
        channel: null, // 'youtube', 'twitch', 'linkedin'
        status: 'active', // 'active', 'cancelled'
        revenue: 0,
        perks: []
    },

    energy: 100,
    experience: 0,
    jobXP: 0,
    // School
    school: {
        grades: 70, // 0-100
        popularity: 50,
        pressure: 0,
        focus: 'study', // study, social, hobby
        major: null, // Engineering, Business, Arts, Medicine
        universityPrestige: null, // 'public', 'elite', 'online'
        scholarship: null // 'academic', 'sports', 'none'
    },
    // Business
    business: null,
    athletics: {
        stamina: 0,
        training: 'none', // none, low, med, high
        gear: { shoes_pro: false, coach: false },
        race: null,
        medals: []
    },
    // Routine
    routine: { work: 8, sleep: 8, study: 0, exercise: 1, leisure: 7 },
    upgrades: {},

    // Collections: 0,
    currJobId: 'unemployed', // Current job ID
    isStudent: false, // Flag for university phase
    graduationHandled: false, // Flag for 18yo event
    loans: 0,
    network: 0,
    education: [],

    // JOB SYSTEM EXPANSION
    jobLevel: 0, // 0=Trainee, 1=Junior, 2=SSr, 3=Senior, 4=Lead
    lastMonthBonus: false, // Track if bonus was received
    headhuntingOffers: [], // Array of job offers
    workedThisMonth: false, // Track if player worked this month (reset monthly)
    jobMonths: 0, // Months in current job
    careerExperience: { // Experience by career (in months)
        tech: 0,
        product: 0,
        corp: 0,
        medical: 0,
        law: 0,
        trade: 0,
        creative: 0,
        service: 0,
        sport: 0,
        education: 0
    },

    work_relations: {
        boss: 50,       // 0-100 Relationship
        colleagues: 50, // 0-100 Relationship
        performance: 50 // 0-100 Job Performance
    },
    activeCourse: null,
    activeProject: null, // { id, name, typeId, progress, duration, penalty }
    creations: [], // { name, type, royalty, quality }
    inventory: [],
    consecutiveWork: 0,
    sickDuration: 0,
    portfolio: { stock: { qty: 0, avg: 0 }, crypto: { qty: 0, avg: 0 }, gold: { qty: 0, avg: 0 } },
    marketPrices: { stock: 100, crypto: 5000, gold: 200 },
    realEstate: [], // Array of owned IDs
    rePrices: {}, // Dynamic prices for RE
    pendingEvent: null, // { id, timer }
    financialFreedom: false,
    friends: [], // {id, name, jobTitle, relation, bonusJobId}
    partner: null, // {name, salary, relation, status: 'dating'|'living'|'married', jobTitle}
    children: [], // { name, ageMonths, gender }
    pets: [], // { id, name }
    housing: 'couch', // Current housing ID
    vehicle: 'none', // Current vehicle ID
    status: 0, // Social status (0-250+)
    world: {
        currentTrend: null,
        activeOpps: [],
        economicState: 'stable', // stable, boom, recession, depression
        inflation: 1.0, // Multiplier for expenses
        econTimer: 24 // Months until next economic state change check
    }, // Init explicitly
    unlockedTrophies: [], // Init empty array
    traits: [], // Init empty array

    // INTERNATIONAL TRAVEL SYSTEM
    currentCountry: 'home', // Current country ID
    homeCountry: 'home', // Origin country (never changes)
    visaStatus: null, // {countryId, type, expiryMonths, allowWork, workRestriction}
    monthsInCountry: 999, // Months in current country (for adaptation)
    adaptationLevel: 100, // 0-100, affects happiness
    currencies: { // Multi-currency wallet
        HOME: 100,
        USD: 0,
        CAD: 0,
        EUR: 0,
        JPY: 0,
        MXN: 0
    }
};

// Init RE Prices if empty
REAL_ESTATE.forEach(re => {
    if (!state.rePrices[re.id]) state.rePrices[re.id] = re.price;
});

// Load Legacy
const legacyData = JSON.parse(localStorage.getItem('lifeSim_legacy'));
if (legacyData) {
    if (legacyData.type === 'money') state.money += legacyData.val;
    if (legacyData.type === 'genetics') state.intelligence += legacyData.val;
    console.log("Legacy loaded:", legacyData);
    // Clear legacy after loading so it's one-time use
    localStorage.removeItem('lifeSim_legacy');
}
