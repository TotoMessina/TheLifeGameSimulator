
// --- GAME STATE ---
const state = {
    totalMonths: 144, // Start at 12 years old
    money: 100, // Less money for a kid
    physicalHealth: 100,
    mentalHealth: 100,
    happiness: 100,
    diet: 'balanced',
    intelligence: 10,
    energy: 100,
    experience: 0,
    jobXP: 0,
    // School
    school: {
        grades: 70, // 0-100
        popularity: 50,
        pressure: 0,
        focus: 'study' // study, social, hobby
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
    world: { currentTrend: null, activeOpps: [] }, // Init explicitly
    unlockedTrophies: [], // Init empty array
    traits: [] // Init empty array
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
