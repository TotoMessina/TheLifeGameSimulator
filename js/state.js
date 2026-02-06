
// --- GAME STATE ---
let state = {
    totalMonths: 0,
    money: 600,
    physicalHealth: 100,
    mentalHealth: 100,
    happiness: 100,
    diet: 'balanced', // fast_food, balanced, chef
    intelligence: 10,
    energy: 100,
    experience: 0,
    jobXP: 0,
    promotions: 0,
    currJobId: 'unemployed', // Current job ID
    education: [],
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
