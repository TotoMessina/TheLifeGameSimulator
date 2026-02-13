
// --- CONFIG & DATA ---
const CONFIG = {
    version: '1.2.2', // App Version - Change this to force client refresh
    startAge: 18,
    costOfLiving: 500,
    studyCost: 200,
    baseWage: 0 // Base added to job salary if relevant
};

const CHILD_COST = 400; // Monthly cost per child

const PETS = [
    { id: 'dog', name: 'Perro 🐶', cost: 200, maint: 50, desc: 'Fiel amigo. Evita tristeza extrema.' },
    { id: 'cat', name: 'Gato 🐱', cost: 150, maint: 40, desc: 'Independiente. Compañía tranquila.' },
    { id: 'hamster', name: 'Hamster 🐹', cost: 50, maint: 10, desc: 'Pequeño y fácil de cuidar.' },
    { id: 'cat_stray', name: 'Gato Callejero 🐈', cost: 0, maint: 50, desc: 'Rescatado.', canBuy: false }
];

const TRAITS = [
    { id: 'genius', name: 'Genio 🧠', desc: 'Gana inteligencia 50% más rápido.' },
    { id: 'charming', name: 'Carismático ✨', desc: 'Gana felicidad y relaciones más fácil.' },
    { id: 'athletic', name: 'Atlético 🏃', desc: 'Salud decae más lento. Gana energía.' },
    { id: 'lucky', name: 'Suertudo 🍀', desc: 'Mejores eventos aleatorios.' },
    { id: 'immune', name: 'Inmune 🛡️', desc: 'Rara vez se enferma.' },
    { id: 'ambitious', name: 'Ambicioso 💼', desc: 'Gana experiencia laboral más rápido.' },
    { id: 'frugal', name: 'Ahorrador 🐷', desc: 'Gastos de vida reducidos un 10%.' },
    { id: 'bookworm', name: 'Ratón de Biblioteca 📚', desc: 'Estudiar cuesta menos energía.' }
];

const TROPHIES = [
    { id: 'nerd_king', name: 'Rey de los Nerds', desc: 'Gana una competencia académica.', icon: '🤓', condition: (s) => false },
    { id: 'first_million', name: 'Primer Millón', desc: 'Acumula $1,000,000 en efectivo.', icon: '💰', condition: (s) => s.money >= 1000000 },
    { id: 'marathon', name: 'Maratonista', desc: 'Completa una maratón.', icon: '🏃', condition: (s) => false }, // Manually triggers
    { id: 'ceo', name: 'CEO', desc: 'Alcanza el puesto de CEO.', icon: '📈', condition: (s) => s.currJobId === 'tech_cto' || s.currJobId === 'corp_ceo' },
    { id: 'famous_spouse', name: 'Amor Estelar', desc: 'Cásate con un famoso.', icon: '💍', condition: (s) => s.partner && (s.partner.jobTitle.includes('Estrella') || s.partner.jobTitle.includes('Famoso')) && s.partner.status === 'married' },
    { id: 'polymath', name: 'Polímata', desc: 'Maximea inteligencia y completa 3 cursos.', icon: '🧠', condition: (s) => s.intelligence >= 100 && s.education.length >= 3 },
    { id: 'centenarian', name: 'Centenario', desc: 'Vive hasta los 100 años.', icon: '🎂', condition: (s) => s.totalMonths >= 1200 }
];

const RARE_ITEMS = [
    { id: 'classic_car', name: 'Ferrari 250 GTO', price: 5000000, desc: 'Una joya clásica única. (+50 Estatus)', icon: '🏎️', maint: 5000, effect: { type: 'status', val: 50 } },
    { id: 'limited_watch', name: 'Patek Philippe', price: 250000, desc: 'Edición limitada. (+20 Estatus)', icon: '⌚', maint: 100, effect: { type: 'status', val: 20 } }
];

const JOB_LEVELS = [
    { id: 0, name: 'Trainee', salaryMult: 1.0, req: { xp: 0, rep: 0, int: 0 }, energyMult: 1.0, stressMult: 1.0 },
    { id: 1, name: 'Junior', salaryMult: 1.5, req: { xp: 6, rep: 60, int: 20 }, energyMult: 1.2, stressMult: 1.2 },
    { id: 2, name: 'Semi-Senior', salaryMult: 2.2, req: { xp: 18, rep: 75, int: 40 }, energyMult: 1.5, stressMult: 1.5 },
    { id: 3, name: 'Senior', salaryMult: 3.5, req: { xp: 36, rep: 85, int: 60 }, energyMult: 1.8, stressMult: 1.8 },
    { id: 4, name: 'Lead', salaryMult: 5.0, req: { xp: 60, rep: 95, int: 80 }, energyMult: 2.5, stressMult: 2.5 }
];

const WORK_EVENTS = [
    {
        id: 'dilemma_mistake',
        title: 'Error de un Colega',
        desc: 'Un compañero de trabajo ha borrado accidentalmente una base de datos importante. Nadie más lo sabe todavía.',
        choices: [
            { text: 'Reportarlo al Jefe', effect: { bossRep: 10, colleagueRep: -20, stress: -5 } },
            { text: 'Ayudarlo a arreglarlo (Coste: Energía)', effect: { bossRep: 0, colleagueRep: 15, energy: -20, stress: 5 } },
            { text: 'Ignorarlo', effect: { bossRep: -5, colleagueRep: -5, stress: 0 } }
        ]
    },
    {
        id: 'dilemma_credit',
        title: 'Robo de Crédito',
        desc: 'Tu jefe te felicita por un proyecto que en realidad hizo tu equipo, pero él cree que fuiste tú solo.',
        choices: [
            { text: 'Aceptar el elogio', effect: { bossRep: 5, colleagueRep: -15, stress: 2 } },
            { text: 'Dar crédito al equipo', effect: { bossRep: 2, colleagueRep: 10, stress: -2 } }
        ]
    },
    {
        id: 'review_performance',
        title: 'Evaluación de Desempeño',
        desc: 'Es hora de tu revisión trimestral con RRHH y tu supervisor.',
        type: 'review',
        choices: [
            { text: 'Destacar mis logros', effect: { chance: 0.7, success: { bossRep: 10, money: 500 }, fail: { bossRep: -5 } } },
            { text: 'Ser humilde', effect: { bossRep: 5, stress: -5 } }
        ]
    }
];

const CAREER_TRACKS = {
    'service': { label: 'Servicios Básicos', icon: '🧹', desc: 'Empleos de entrada y servicios esenciales.' },
    'trade': { label: 'Oficios', icon: '🛠️', desc: 'Trabajos manuales calificados.' },
    'corp': { label: 'Corporativo', icon: '💼', desc: 'Escalafón empresarial y de negocios.' },
    'tech': { label: 'Tecnología', icon: '💻', desc: 'Desarrollo de software y sistemas.' },
    'creative': { label: 'Arte & Creatividad', icon: '🎨', desc: 'Diseño, escritura y dirección de arte.' },
    'medical': { label: 'Salud & Medicina', icon: '🏥', desc: 'Cuidado de pacientes y cirugía.' },
    'law': { label: 'Leyes & Justicia', icon: '⚖️', desc: 'Abogacía y sistema judicial.' },
    'sport': { label: 'Deportes', icon: '⚽', desc: 'Carrera atlética profesional.' },
    'education': { label: 'Educación', icon: '🎓', desc: 'Enseñanza y academia.' },
    'product': { label: 'Producto', icon: '🎯', desc: 'Gestión y estrategia de productos digitales.' }
};

const COMPANIES = [
    // === TECH SECTOR ===
    { id: 'tech_goggle', name: 'Goggle', logo: '🔵', sector: 'tech', prestige: 90, salaryMult: 1.2, rivals: ['tech_amazone', 'tech_macrohard'] },
    { id: 'tech_amazone', name: 'Amazone', logo: '📦', sector: 'tech', prestige: 85, salaryMult: 1.1, rivals: ['tech_goggle', 'tech_macrohard'] },
    { id: 'tech_macrohard', name: 'Macrohard', logo: '🪟', sector: 'tech', prestige: 88, salaryMult: 1.15, rivals: ['tech_goggle', 'tech_amazone'] },

    // === FINANCE / CORP SECTOR ===
    { id: 'fin_goldman', name: 'Goldman Sax', logo: '💰', sector: 'corp', prestige: 95, salaryMult: 1.5, rivals: ['fin_jp'] },
    { id: 'fin_jp', name: 'JP Moregain', logo: '🏦', sector: 'corp', prestige: 92, salaryMult: 1.4, rivals: ['fin_goldman'] },

    // === MEDIA / CREATIVE ===
    { id: 'media_ny', name: 'The NY Times', logo: '📰', sector: 'creative', prestige: 90, salaryMult: 1.0, rivals: ['media_daily'] },
    { id: 'media_daily', name: 'Daily Planet', logo: '🌍', sector: 'creative', prestige: 80, salaryMult: 0.9, rivals: ['media_ny'] },

    // === SERVICE / RETAIL ===
    { id: 'svc_mcd', name: 'McRonalds', logo: '🍔', sector: 'service', prestige: 30, salaryMult: 0.8, rivals: ['svc_burger'] },
    { id: 'svc_burger', name: 'Burger Queen', logo: '👑', sector: 'service', prestige: 30, salaryMult: 0.8, rivals: ['svc_mcd'] },

    // === MEDICAL ===
    { id: 'med_public', name: 'Hospital General', logo: '🏥', sector: 'medical', prestige: 70, salaryMult: 1.0, rivals: ['med_private'] },
    { id: 'med_private', name: 'Clínica Privada St. Mary', logo: '⚕️', sector: 'medical', prestige: 90, salaryMult: 1.5, rivals: ['med_public'] },

    // === LAW ===
    { id: 'law_shady', name: 'Saul Good & Assoc.', logo: '⚖️', sector: 'law', prestige: 60, salaryMult: 0.9, rivals: ['law_elite'] },
    { id: 'law_elite', name: 'Pearson Specter', logo: '👔', sector: 'law', prestige: 95, salaryMult: 1.8, rivals: ['law_shady'] },

    // === EDUCATION ===
    { id: 'edu_public', name: 'Escuela Pública N°1', logo: '🏫', sector: 'education', prestige: 60, salaryMult: 0.9, rivals: ['edu_private'] },
    { id: 'edu_private', name: 'Elite University', logo: '🎓', sector: 'education', prestige: 92, salaryMult: 1.3, rivals: ['edu_public'] },

    // === SPORTS ===
    { id: 'sport_local', name: 'Club Local', logo: '⚽', sector: 'sport', prestige: 50, salaryMult: 0.8, rivals: ['sport_national'] },
    { id: 'sport_national', name: 'Selección Nacional', logo: '🏆', sector: 'sport', prestige: 95, salaryMult: 2.0, rivals: ['sport_local'] }
];

const JOB_TEMPLATES = [
    // === UNEMPLOYED ===
    {
        id: 'unemployed',
        title: 'Sin Empleo',
        salary: 0,
        career: 'none',
        req: {},
        stress: 2,
        boredom: 10,
        xpGain: 0,
        stressPerMonth: 5,
        energyCost: 0,
        isIndependent: true
    },

    // === SURVIVAL JOBS ===
    {
        id: 'survival_delivery',
        title: 'Repartidor de Comida',
        salary: 1200,
        career: 'service',
        type: 'full_time',
        req: { health: 40 },
        stress: 8,
        boredom: 7,
        xpGain: 0.5,
        stressPerMonth: 8,
        energyCost: 35,
        desc: 'Entregas en bici todo el día. Agotador pero flexible.',
        isIndependent: true
    },
    {
        id: 'survival_cashier',
        title: 'Cajero',
        salary: 1000,
        career: 'service',
        type: 'full_time',
        req: { int: 10 },
        stress: 6,
        boredom: 9,
        xpGain: 0.5,
        stressPerMonth: 6,
        energyCost: 30,
        // Removed explicit companyId, will generate for Service companies
        desc: 'Atención al cliente y manejo de caja.'
    },
    {
        id: 'survival_janitor',
        title: 'Personal de Limpieza',
        salary: 900,
        career: 'service',
        type: 'full_time',
        req: { health: 35 },
        stress: 5,
        boredom: 8,
        xpGain: 0.5,
        stressPerMonth: 5,
        energyCost: 40,
        desc: 'Mantener la higiene del local.'
    },
    {
        id: 'survival_security',
        title: 'Guardia de Seguridad',
        salary: 1100,
        career: 'service',
        type: 'full_time',
        req: { health: 60 },
        stress: 10,
        boredom: 10,
        xpGain: 0.3,
        stressPerMonth: 10,
        energyCost: 25,
        isIndependent: true,
        desc: 'Vigilancia nocturna.'
    },

    // === DEAD-END JOBS ===
    {
        id: 'deadend_telemarketer',
        title: 'Vendedor Telefónico',
        salary: 2500,
        career: 'service',
        type: 'full_time',
        req: { int: 20 },
        stress: 20,
        boredom: 10,
        xpGain: 0,
        stressPerMonth: 20,
        energyCost: 30,
        deadEnd: true,
        isIndependent: true,
        desc: 'Comisiones variables. Te rechazan todo el día.'
    },
    {
        id: 'deadend_callcenter',
        title: 'Operador de Call Center',
        salary: 2000,
        career: 'service',
        type: 'full_time',
        req: { int: 15 },
        stress: 18,
        boredom: 9,
        xpGain: 0,
        stressPerMonth: 18,
        energyCost: 25,
        deadEnd: true,
        isIndependent: true,
        desc: 'Resolución de reclamos.'
    },
    {
        id: 'deadend_collector',
        title: 'Cobrador de Deudas',
        salary: 3000,
        career: 'service',
        type: 'full_time',
        req: { int: 25 },
        stress: 25,
        boredom: 7,
        xpGain: 0,
        stressPerMonth: 25,
        energyCost: 30,
        deadEnd: true,
        mentalHealthCost: 8,
        isIndependent: true,
        desc: 'Presionas a gente desesperada.'
    },

    // === PART TIME JOBS ===
    {
        id: 'pt_barista',
        title: 'Barista',
        salary: 600,
        career: 'service',
        type: 'part_time',
        req: { health: 20 },
        stress: 5,
        boredom: 4,
        xpGain: 0.2,
        stressPerMonth: 5,
        energyCost: 20,
        desc: 'Preparar café y sonreír.'
    },
    {
        id: 'pt_tutor',
        title: 'Tutor Privado',
        salary: 800,
        career: 'education',
        type: 'part_time',
        req: { int: 60, isStudent: true },
        stress: 3,
        boredom: 2,
        xpGain: 0.4,
        stressPerMonth: 3,
        energyCost: 15,
        isIndependent: true,
        desc: 'Ayuda escolar para niños.'
    },

    // === PRODUCT MANAGEMENT ===
    {
        id: 'pm_intern',
        title: 'Product Intern',
        salary: 1000,
        career: 'product',
        type: 'part_time',
        req: { int: 40, isStudent: true },
        stress: 5,
        boredom: 3,
        xpGain: 1.2,
        stressPerMonth: 5,
        energyCost: 20,
        desc: 'Aprende los fundamentos del Product Management.'
    },
    {
        id: 'pm_associate',
        title: 'Associate Product Manager',
        salary: 3500,
        career: 'product',
        type: 'full_time',
        req: { int: 50, deg: 'university_degree' },
        stress: 8,
        boredom: 4,
        xpGain: 1.0,
        stressPerMonth: 8,
        energyCost: 25,
        bonusChance: 0.10,
        bonusAmount: 500,
        desc: 'Define requisitos y coordina con equipos.'
    },
    {
        id: 'pm_junior',
        title: 'Product Manager Jr.',
        salary: 5500,
        career: 'product',
        type: 'full_time',
        req: { int: 60, deg: 'university_degree', careerExp: { product: 24 } },
        stress: 10,
        boredom: 5,
        xpGain: 1.0,
        stressPerMonth: 10,
        energyCost: 28,
        bonusChance: 0.15,
        bonusAmount: 1000,
        desc: 'Lideras el roadmap de productos.'
    },
    {
        id: 'pm_senior',
        title: 'Senior Product Manager',
        salary: 8500,
        career: 'product',
        type: 'full_time',
        req: { int: 70, deg: 'business', careerExp: { product: 48 } },
        stress: 12,
        boredom: 4,
        xpGain: 0.8,
        stressPerMonth: 12,
        energyCost: 30,
        bonusChance: 0.20,
        bonusAmount: 2000,
        desc: 'Estrategia de producto a nivel empresa.'
    },
    {
        id: 'pm_director',
        title: 'Director of Product',
        salary: 15000,
        career: 'product',
        type: 'full_time',
        req: { int: 80, deg: 'business', careerExp: { product: 72 } },
        stress: 15,
        boredom: 3,
        xpGain: 0.5,
        stressPerMonth: 15,
        energyCost: 32,
        bonusChance: 0.25,
        bonusAmount: 5000,
        desc: 'Diriges toda la organización de producto.'
    },

    // === MEDICAL (Independent for now) ===
    {
        id: 'med_student',
        title: 'Residente Médico',
        salary: 1200,
        career: 'medical',
        req: { int: 70, deg: 'med_school' },
        stress: 15,
        onCall: true,
        boredom: 2,
        xpGain: 1.5,
        stressPerMonth: 15,
        energyCost: 40,
    },
    {
        id: 'med_nurse',
        title: 'Enfermero/a',
        salary: 2500,
        career: 'medical',
        req: { int: 60, deg: 'university_degree' },
        stress: 12,
        boredom: 3,
        xpGain: 1.2,
        stressPerMonth: 12,
        energyCost: 35,
    },
    {
        id: 'med_doctor',
        title: 'Médico General',
        salary: 5000,
        career: 'medical',
        req: { int: 85, deg: 'med_school' },
        stress: 18,
        boredom: 3,
        xpGain: 1.0,
        stressPerMonth: 18,
        energyCost: 35,
    },
    {
        id: 'med_surgeon',
        title: 'Cirujano Plástico',
        salary: 15000,
        career: 'medical',
        req: { int: 95, deg: 'med_school', exp: 40 },
        stress: 25,
        boredom: 2,
        xpGain: 0.5,
        stressPerMonth: 25,
        energyCost: 40,
    },

    // === LAW (Independent) ===
    {
        id: 'law_paralegal',
        title: 'Paralegal',
        salary: 2000,
        career: 'law',
        req: { int: 60 },
        stress: 8,
        boredom: 6,
        xpGain: 1.0,
        stressPerMonth: 8,
        energyCost: 22,
    },
    {
        id: 'law_associate',
        title: 'Abogado Jr.',
        salary: 4000,
        career: 'law',
        req: { int: 80, deg: 'law_school' },
        stress: 15,
        boredom: 5,
        xpGain: 1.0,
        stressPerMonth: 15,
        energyCost: 30,
    },
    {
        id: 'law_partner',
        title: 'Socio de Firma',
        salary: 12000,
        career: 'law',
        req: { int: 90, exp: 50, deg: 'law_school' },
        stress: 20,
        boredom: 4,
        xpGain: 0.6,
        stressPerMonth: 20,
        energyCost: 32,
    },
    {
        id: 'law_judge',
        title: 'Juez de la Corte',
        salary: 10000,
        career: 'law',
        req: { int: 85, exp: 80, happy: 60 },
        stress: 10,
        boredom: 3,
        xpGain: 0.3,
        stressPerMonth: 10,
        energyCost: 25,
    },

    // === TRADES (Independent) ===
    {
        id: 'trade_plumber',
        title: 'Plomero',
        salary: 2500,
        career: 'trade',
        type: 'full_time',
        req: { health: 50, energy: 60 },
        stress: 5,
        boredom: 5,
        xpGain: 1.0,
        stressPerMonth: 5,
        energyCost: 28,
    },
    {
        id: 'trade_electrician',
        title: 'Electricista',
        salary: 3000,
        career: 'trade',
        type: 'full_time',
        req: { int: 50, health: 40 },
        stress: 6,
        boredom: 4,
        xpGain: 1.0,
        stressPerMonth: 6,
        energyCost: 26,
    },
    {
        id: 'trade_carpenter',
        title: 'Carpintero',
        salary: 2200,
        career: 'trade',
        type: 'full_time',
        req: { health: 60 },
        stress: 4,
        boredom: 3,
        xpGain: 1.0,
        stressPerMonth: 4,
        energyCost: 30,
    },
    {
        id: 'trade_mechanic',
        title: 'Mecánico',
        salary: 2800,
        career: 'trade',
        type: 'full_time',
        req: { health: 50, int: 40 },
        stress: 7,
        boredom: 5,
        xpGain: 1.0,
        stressPerMonth: 7,
        energyCost: 27,
    },

    // === CREATIVE ===
    {
        id: 'creat_writer',
        title: 'Escritor',
        salary: 1500,
        career: 'creative',
        req: { int: 60, happy: 50 },
        stress: 3,
        boredom: 2,
        xpGain: 1.0,
        stressPerMonth: 3,
        energyCost: 20
    },
    {
        id: 'creat_designer',
        title: 'Diseñador Gráfico',
        salary: 2500,
        career: 'creative',
        req: { int: 50 },
        stress: 5,
        boredom: 3,
        xpGain: 1.0,
        stressPerMonth: 5,
        energyCost: 22
    },
    {
        id: 'creat_director',
        title: 'Director de Arte',
        salary: 6000,
        career: 'creative',
        req: { int: 70, exp: 30 },
        stress: 10,
        boredom: 2,
        xpGain: 0.8,
        stressPerMonth: 10,
        energyCost: 28
    },

    // === SERVICE EXPANSION ===
    {
        id: 'svc_security',
        title: 'Guardia de Seguridad Privada',
        salary: 1100,
        career: 'service',
        req: { health: 60 },
        stress: 6,
        boredom: 9,
        xpGain: 0.4,
        stressPerMonth: 6,
        energyCost: 20,
    },
    {
        id: 'svc_warehouse',
        title: 'Operario de Depósito',
        salary: 1300,
        career: 'service',
        req: { health: 70 },
        stress: 8,
        boredom: 8,
        xpGain: 0.5,
        stressPerMonth: 8,
        energyCost: 35
    },
    {
        id: 'svc_driver',
        title: 'Chofer',
        salary: 1800,
        career: 'service',
        req: { health: 40 },
        stress: 12,
        boredom: 7,
        xpGain: 0.6,
        stressPerMonth: 12,
        energyCost: 25,
    },
    {
        id: 'svc_chef',
        title: 'Cocinero de Línea',
        salary: 2000,
        career: 'service',
        req: { health: 60, energy: 70 },
        stress: 15,
        boredom: 4,
        xpGain: 1.0,
        stressPerMonth: 15,
        energyCost: 32
    },

    // === TECH ===
    {
        id: 'tech_qa',
        title: 'QA Tester',
        salary: 2000,
        career: 'tech',
        req: { int: 40 },
        stress: 4,
        boredom: 8,
        xpGain: 0.8,
        stressPerMonth: 4,
        energyCost: 20
    },
    {
        id: 'tech_admin',
        title: 'SysAdmin',
        salary: 4000,
        career: 'tech',
        req: { int: 65, exp: 10 },
        stress: 10,
        boredom: 6,
        xpGain: 1.0,
        stressPerMonth: 10,
        energyCost: 25
    },
    {
        id: 'tech_trainee',
        title: 'Trainee IT',
        salary: 800,
        career: 'tech',
        req: { int: 20 },
        stress: 3,
        boredom: 5,
        xpGain: 1.2,
        stressPerMonth: 3,
        energyCost: 18
    },
    {
        id: 'tech_jr',
        title: 'Junior Dev',
        salary: 1500,
        career: 'tech',
        req: { int: 40, exp: 5 },
        stress: 5,
        boredom: 4,
        xpGain: 1.1,
        stressPerMonth: 5,
        energyCost: 22
    },
    {
        id: 'tech_sr',
        title: 'Senior Dev',
        salary: 3500,
        career: 'tech',
        req: { int: 70, exp: 20, deg: 'dev_bootcamp' },
        stress: 8,
        boredom: 3,
        xpGain: 0.9,
        stressPerMonth: 8,
        energyCost: 26
    },
    {
        id: 'tech_cto',
        title: 'CTO',
        salary: 8000,
        career: 'tech',
        req: { int: 90, exp: 50, deg: 'dev_bootcamp' },
        stress: 15,
        boredom: 2,
        xpGain: 0.5,
        stressPerMonth: 15,
        energyCost: 30
    },

    // === CORPORATE ===
    {
        id: 'corp_assist',
        title: 'Asistente',
        salary: 1000,
        career: 'corp',
        req: { int: 15, happy: 50 },
        stress: 4,
        boredom: 7,
        xpGain: 1.0,
        stressPerMonth: 4,
        energyCost: 20
    },
    {
        id: 'corp_analyst',
        title: 'Analista',
        salary: 2000,
        career: 'corp',
        req: { int: 40, exp: 10 },
        stress: 10,
        boredom: 6,
        xpGain: 1.0,
        stressPerMonth: 10,
        energyCost: 25
    },
    {
        id: 'corp_manager',
        title: 'Gerente',
        salary: 4000,
        career: 'corp',
        req: { int: 60, exp: 30 },
        stress: 12,
        boredom: 5,
        xpGain: 0.8,
        stressPerMonth: 12,
        energyCost: 28
    },
    {
        id: 'corp_ceo',
        title: 'CEO',
        salary: 12000,
        career: 'corp',
        req: { int: 85, exp: 70, deg: 'mba_biz' },
        stress: 20,
        boredom: 3,
        xpGain: 0.4,
        stressPerMonth: 20,
        energyCost: 32
    },

    // === SPORTS ===
    {
        id: 'sport_amateur',
        title: 'Amateur Deport.',
        salary: 500,
        career: 'sport',
        req: { health: 60, energy: 50 },
        stress: 5,
        boredom: 2,
        xpGain: 1.2,
        stressPerMonth: 5,
        energyCost: 30,
    },
    {
        id: 'sport_pro',
        title: 'Deportista Pro',
        salary: 3000,
        career: 'sport',
        req: { health: 80, exp: 10 },
        stress: 8,
        boredom: 1,
        xpGain: 1.0,
        stressPerMonth: 8,
        energyCost: 35,
    },
    {
        id: 'sport_star',
        title: 'Estrella Mundial',
        salary: 15000,
        career: 'sport',
        req: { health: 95, exp: 40, happy: 70, deg: 'sport_cert' },
        stress: 12,
        boredom: 1,
        xpGain: 0.6,
        stressPerMonth: 12,
        energyCost: 35,
    },

    // === EDUCATION ===
    {
        id: 'edu_teacher',
        title: 'Maestro de Escuela',
        salary: 1800,
        career: 'education',
        req: { int: 50, happy: 40 },
        stress: 10,
        boredom: 4,
        xpGain: 1.0,
        stressPerMonth: 10,
        energyCost: 28,
    },
    {
        id: 'edu_prof',
        title: 'Profesor Universitario',
        salary: 3500,
        career: 'education',
        req: { int: 80, exp: 20, deg: 'university_degree' },
        stress: 6,
        boredom: 3,
        xpGain: 0.8,
        stressPerMonth: 6,
        energyCost: 20,
        isIndependent: true
    }
];

// --- GENERATE PROCEDURAL JOBS ---
const JOBS = [];

JOB_TEMPLATES.forEach(template => {
    // If it's explicitly independent or has no career, just add it
    if (template.isIndependent || template.career === 'none') {
        JOBS.push(template);
        return;
    }

    // Attempt to find companies in this sector
    const sectorCompanies = COMPANIES.filter(c => c.sector === template.career);

    // Also include Tech companies for Product roles if not explicitly defined
    let companiesToUse = [...sectorCompanies];
    if (template.career === 'product' && sectorCompanies.length === 0) {
        companiesToUse = COMPANIES.filter(c => c.sector === 'tech');
    }

    if (companiesToUse.length > 0) {
        companiesToUse.forEach(comp => {
            // Create a specialized instance of this job for the company
            const newJob = JSON.parse(JSON.stringify(template)); // Deep copy

            newJob.id = `${template.id}_${comp.id}`;
            newJob.companyId = comp.id;
            // newJob.title = `${template.title}`; // Keep title clean, UI handles company name

            // Adjust Salary based on Company Multiplier
            newJob.salary = Math.floor(template.salary * comp.salaryMult);

            // Adjust Requirements based on Prestige
            // Prestige 0-100. Base is 50.
            // > 50 increases reqs, < 50 decreases them slightly
            const prestigeFactor = comp.prestige / 50; // e.g. 90/50 = 1.8 (too high?), maybe 1.0 + (prestige-50)/100
            const reqMult = 1.0 + ((comp.prestige - 50) / 100); // 90 -> 1.4x, 30 -> 0.8x

            if (newJob.req) {
                if (newJob.req.int) newJob.req.int = Math.min(100, Math.ceil(newJob.req.int * reqMult));
                if (newJob.req.exp) newJob.req.exp = Math.ceil(newJob.req.exp * reqMult);
                // Health/Happiness usually standard, but maybe stress impacts them? Leave for now.
            }

            JOBS.push(newJob);
        });
    } else {
        // No companies found for this sector, add as independent default
        JOBS.push(template);
    }
});

const FREELANCE_GIGS = [
    // Tech / Dev
    { id: 'gig_debug', title: 'Bugar Código Legacy', type: 'tech', reward: 100, energy: 15, dif: 10, time: 'quick' },
    { id: 'gig_script', title: 'Script de Automatización', type: 'tech', reward: 250, energy: 30, dif: 30, time: 'medium' },
    { id: 'gig_website', title: 'Landing Page Sencilla', type: 'tech', reward: 500, energy: 50, dif: 50, time: 'long' },

    // Creative / Design
    { id: 'gig_logo', title: 'Diseñar Logo Vectorial', type: 'creative', reward: 150, energy: 20, dif: 20, time: 'quick' },
    { id: 'gig_banner', title: 'Banner Redes Sociales', type: 'creative', reward: 100, energy: 15, dif: 10, time: 'quick' },
    { id: 'gig_video', title: 'Edición Video YouTube', type: 'creative', reward: 400, energy: 45, dif: 40, time: 'long' },

    // Services / Admin
    { id: 'gig_transcribe', title: 'Transcribir Audio', type: 'service', reward: 80, energy: 25, dif: 5, time: 'medium' },
    { id: 'gig_data', title: 'Entrada de Datos Excel', type: 'service', reward: 120, energy: 35, dif: 10, time: 'medium' },
    { id: 'gig_repair', title: 'Reparar PC Vecino', type: 'service', reward: 200, energy: 30, dif: 25, time: 'medium' }
];

const SCHOOL_GIGS = [
    { id: 'sch_candy', title: 'Vender Dulces', type: 'service', reward: 20, energy: 10, dif: 5, time: 'quick' },
    { id: 'sch_homework', title: 'Hacer Tarea Ajena', type: 'tech', reward: 40, energy: 20, dif: 15, time: 'medium' },
    { id: 'sch_lawn', title: 'Cortar Pasto', type: 'service', reward: 50, energy: 30, dif: 10, time: 'long' },
    { id: 'sch_tutoring', title: 'Tutoría Escolar', type: 'tech', reward: 60, energy: 25, dif: 20, time: 'medium' }
];

const COURSES = [
    { id: 'dev_bootcamp', title: 'Bootcamp Full Stack', cost: 5000, duration: 6, penalty: 30, degree: 'Dev Certified' },
    { id: 'mba_biz', title: 'MBA Ejecutivo', cost: 15000, duration: 12, penalty: 40, degree: 'Master Business' },
    { id: 'sport_cert', title: 'Certificación Entrenador', cost: 3000, duration: 4, penalty: 20, degree: 'Coach Lic.' }
];

const ASSETS = [
    { id: 'stock', name: 'Acciones (S&P)', startPrice: 100, vol: 0.05 },
    { id: 'crypto', name: 'Bitcoin', startPrice: 5000, vol: 0.25 },
    { id: 'gold', name: 'Oro', startPrice: 200, vol: 0.02 }
];

const REAL_ESTATE = [
    { id: 'apt_small', name: 'Apt. Pequeño', price: 50000, rent: 200, maint: 50 },
    { id: 'house', name: 'Casa Familiar', price: 150000, rent: 650, maint: 150 },
    { id: 'office', name: 'Oficina Comercial', price: 500000, rent: 2200, maint: 600 },
    { id: 'building', name: 'Edificio Residencial', price: 2000000, rent: 9000, maint: 3000 }
];

const SHOP_ITEMS = [
    { id: 'book_stats', name: 'Libros Técnicos', price: 150, maint: 0, desc: '+10% ganancia al Estudiar', effect: { type: 'study_boost', val: 1.1 } },
    { id: 'bike', name: 'Bicicleta', price: 300, maint: 0, desc: 'Reduce costos transporte (-$20/mes)', effect: { type: 'col_red', val: 20 } },
    { id: 'phone', name: 'Smartphone Alta Gama', price: 800, maint: 20, desc: '+2 Felicidad/mes', effect: { type: 'happy_boost', val: 2 } },
    { id: 'suit', name: 'Traje Elegante', price: 500, maint: 0, desc: '+10% Salario (Oficina)', effect: { type: 'wage_mult', val: 1.1 } }, // Simplified to all jobs for MVP
    { id: 'laptop', name: 'Laptop Gamer', price: 2000, maint: 0, desc: '+20% Salario (Devs) y Felicidad', effect: { type: 'wage_mult_high', val: 1.2 } },
    { id: 'car', name: 'Automóvil', price: 5000, maint: 200, desc: 'Gran estatus (+5 Felicidad/mes)', effect: { type: 'happy_boost', val: 5 } },
    { id: 'apt', name: 'Apartamento Lujoso', price: 50000, maint: 800, desc: 'Vida de rico. +20 Felicidad/mes', effect: { type: 'happy_boost', val: 20 } }
];

// --- HOUSING OPTIONS ---
const HOUSING = [
    { id: 'couch', name: '🛋️ Sofá de Amigo', cost: 0, maint: 0, happiness: -10, energyRecovery: -5, status: 0, desc: 'Gratis pero incómodo' },
    { id: 'studio', name: '🏠 Estudio Alquiler', cost: 5000, maint: 800, happiness: 5, energyRecovery: 0, status: 10, desc: 'Tu propio espacio' },
    { id: 'apartment', name: '🏢 Apartamento', cost: 50000, maint: 1500, happiness: 15, energyRecovery: 5, status: 30, desc: 'Cómodo y espacioso' },
    { id: 'house', name: '🏡 Casa Propia', cost: 200000, maint: 2500, happiness: 30, energyRecovery: 10, status: 60, desc: 'El sueño americano' },
    { id: 'mansion', name: '🏰 Mansión', cost: 1000000, maint: 8000, happiness: 50, energyRecovery: 20, status: 100, desc: 'Vida de lujo' }
];

// --- VEHICLE OPTIONS ---
const VEHICLES = [
    { id: 'none', name: '🚶 A Pie', cost: 0, maint: 0, energyReduction: 0, status: 0, desc: 'Transporte público' },
    { id: 'bike', name: '🚲 Bicicleta', cost: 500, maint: 20, energyReduction: 2, status: 5, desc: 'Ecológico y saludable' },
    { id: 'scooter', name: '🛵 Scooter', cost: 3000, maint: 100, energyReduction: 5, status: 15, desc: 'Rápido en la ciudad' },
    { id: 'car_used', name: '🚗 Coche Usado', cost: 15000, maint: 300, energyReduction: 8, status: 25, desc: 'Funcional y confiable' },
    { id: 'car_new', name: '🚙 Coche Nuevo', cost: 40000, maint: 500, energyReduction: 10, status: 50, desc: 'Comodidad moderna' },
    { id: 'luxury', name: '🏎️ Coche de Lujo', cost: 150000, maint: 2000, energyReduction: 12, status: 80, desc: 'Estatus y poder' },
    { id: 'jet', name: '✈️ Jet Privado', cost: 5000000, maint: 50000, energyReduction: 15, status: 150, desc: 'El cielo es el límite' }
];





// --- FAME SYSTEM CONFIG ---
const FAME_CHANNELS = {
    youtube: {
        id: 'youtube',
        name: 'YouTuber',
        icon: '📹',
        stat: 'creativity',
        desc: 'Sube videos editados. Requiere mucha Creatividad.',
        cost: 20 // Energy cost
    },
    twitch: {
        id: 'twitch',
        name: 'Streamer',
        icon: '🎮',
        stat: 'charisma',
        desc: 'Transmite en vivo. Requiere Carisma para entretener.',
        cost: 25
    },
    linkedin: {
        id: 'linkedin',
        name: 'Influencer LinkedIn',
        icon: '💼',
        stat: 'intelligence',
        desc: 'Escribe posts "inspiradores". Requiere Inteligencia.',
        cost: 15
    }
};

const FAME_LEVELS = [
    { followers: 1000, title: 'Micro-Influencer', perks: 'Canjes (Gastos -5%)' },
    { followers: 10000, title: 'Influencer Local', perks: 'Sponsors (Ingreso Mensual $500)' },
    { followers: 100000, title: 'Famoso', perks: 'Sponsors (Ingreso Mensual $2000) + Eventos VIP' },
    { followers: 1000000, title: 'Celebridad', perks: 'Sponsors (Ingreso Mensual $10000) + Inmunidad Social' }
];

const FAME_RISKS = [
    {
        id: 'cancellation',
        name: 'Cancelación Masiva',
        prob: 0.001, // 0.1% base per post, scales with followers
        effect: { followers: 0.5, stress: 20, reputation: -50 },
        desc: 'Un tweet de hace 10 años resurgió. Internet te odia.'
    },
    {
        id: 'bad_post',
        name: 'Post Polémico',
        prob: 0.05,
        effect: { followers: 0.9, stress: 5 },
        desc: 'Tu opinión no fue bien recibida. Perdiste seguidores.'
    }
];
// --- ELITE EVENTS ---
const ELITE_EVENTS = [
    {
        id: 'business_dinner',
        title: 'Cena de Negocios',
        cost: 500,
        req: { career: 'corp', level: 3 },
        minStatus: 100,
        text: '🍷 Cena de Negocios: Un CEO te invita a cenar.',
        effect: () => {
            if (Math.random() > 0.5) {
                return { money: 5000, msg: 'Hiciste contactos valiosos. +$5000', type: 'good' };
            } else {
                return { experience: 10, msg: 'Aprendiste de los mejores. +10 Exp', type: 'good' };
            }
        }
    },
    {
        id: 'yacht_party',
        minStatus: 150,
        text: '🛥️ Fiesta en Yate: Invitación exclusiva.',
        effect: () => {
            return { happiness: 20, msg: 'Conociste gente influyente. +20 Felicidad', type: 'good' };
        }
    },
    {
        id: 'investment_tip',
        minStatus: 120,
        text: '💼 Tip de Inversión: Un magnate comparte un secreto.',
        effect: () => {
            return { money: 10000, msg: 'Invertiste sabiamente. +$10,000', type: 'good' };
        }
    },
    {
        id: 'exclusive_club',
        minStatus: 180,
        text: '🎩 Club Exclusivo: Te invitan a un club privado.',
        effect: () => {
            return { happiness: 15, experience: 5, msg: 'Networking de élite. +Exp +Felicidad', type: 'good' };
        }
    }
];

// --- EVENTS DB ---
const EVENTS = [
    // Instant Events
    { id: 1, type: 'instant', text: "Encontraste $50 en el suelo.", effect: (s) => ({ money: 50, msg: "¡Suerte! +$50", type: 'good' }) },
    { id: 2, type: 'instant', text: "Perdiste tu billetera.", effect: (s) => ({ money: -100, happiness: -5, msg: "Qué mala suerte. -$100", type: 'bad' }) },
    { id: 3, type: 'instant', text: "Te enfermaste de gripe.", effect: (s) => ({ mentalHealth: -5, physicalHealth: -10, energy: -20, msg: "Gripe fuerte. -Salud, -Energía", type: 'bad' }) },
    { id: 4, type: 'instant', text: "Un amigo te invita a cenar.", condition: s => s.friends.length > 0, effect: (s) => ({ happiness: 10, msg: "Cena gratis. +Felicidad", type: 'good' }) },
    { id: 5, type: 'instant', text: "Tu ropa se rompió.", effect: (s) => ({ money: -50, msg: "Gastos de ropa. -$50", type: 'bad' }) },

    // Choice Events
    {
        id: 6, type: 'choice', text: "Te ofrecen un 'negocio' rápido pero dudoso.",
        choices: [
            {
                text: "Aceptar (Riesgo)", sub: "Ganar mucho o perder mucho", action: (s) => {
                    return Math.random() > 0.5
                        ? { money: 1000, msg: "¡Salió bien! Ganaste $1000", type: 'good' }
                        : { money: -500, happiness: -10, msg: "Era una estafa. Perdiste $500", type: 'bad' };
                }
            },
            { text: "Rechazar", sub: "Mejor prevenir", action: (s) => ({ happiness: 2, msg: "Evitaste problemas.", type: 'info' }) }
        ]
    },
    {
        id: 7, type: 'choice', text: "Tu jefe te pide trabajar horas extra no pagadas.",
        condition: s => s.currJobId !== 'unemployed',
        choices: [
            { text: "Hacerlo", sub: "Ganas experiencia, pierdes energía", action: (s) => ({ experience: 2, energy: -30, happiness: -5, msg: "Tu jefe lo valora. +Exp", type: 'info' }) },
            { text: "Negarse", sub: "Mantienes dignidad", action: (s) => ({ happiness: 5, msg: "Te respetaste a ti mismo. +Felicidad", type: 'good' }) }
        ]
    },
    {
        id: 8, type: 'choice', text: "Oferta de curso online con descuento.",
        choices: [
            {
                text: "Comprar ($150)", sub: "+Inteligencia", action: (s) => {
                    if (s.money < 150) return { msg: "No tienes dinero suficiente.", type: 'bad' };
                    return { money: -150, intelligence: 5, msg: "Aprendiste mucho. +Int", type: 'good' };
                }
            },
            { text: "No gracias", sub: "Ahorrar dinero", action: (s) => ({ msg: "Pasaste la oferta.", type: 'info' }) }
        ]
    },
    {
        id: 9, type: 'choice', text: "Un mendigo te pide ayuda.",
        choices: [
            {
                text: "Dar $10", sub: "Te sientes bien", action: (s) => {
                    if (s.money < 10) return { msg: "No tienes cambio.", type: 'info' };
                    return { money: -10, happiness: 5, msg: "Ayudaste a alguien. +Felicidad", type: 'good' };
                }
            },
            { text: "Ignorar", sub: "Nada cambia", action: (s) => ({ msg: "Seguiste caminando.", type: 'info' }) }
        ]
    },
    {
        id: 10, type: 'choice', text: "Encuentras un gatito abandonado.",
        condition: s => !s.pets.some(p => p.id === 'cat_stray'),
        choices: [
            {
                text: "Adoptarlo ($50/mes)", sub: "+Felicidad constante, -Dinero", action: (s) => {
                    state.pets.push({ id: 'cat_stray', name: 'Gato Callejero' });
                    return { money: -100, happiness: 15, msg: "Tienes nueva mascota (Gastos vet -$100).", type: 'good' };
                }
            },
            { text: "Llevarlo a refugio", sub: "Haces lo correcto", action: (s) => ({ happiness: 2, msg: "El gatito está a salvo.", type: 'info' }) }
        ]
    },

    // --- SOCIAL EVENTS EXPANSION ---
    // 1. Emergency: Friend Loan
    {
        id: 11, type: 'choice', text: "¡Emergencia! Un amigo necesita dinero urgente.",
        condition: (s) => s.friends.length > 0 && s.money > 200,
        choices: [
            {
                text: "Prestar $200", sub: "Es riesgoso pero amable", action: (s) => {
                    const friend = s.friends[Math.floor(Math.random() * s.friends.length)];
                    friend.relation = Math.min(100, friend.relation + 20);
                    return { money: -200, happiness: 5, msg: `Le prestaste a ${friend.name}. Te lo agradece mucho.`, type: 'good' };
                }
            },
            {
                text: "Negarte", sub: "Cuidar tu dinero", action: (s) => {
                    const friend = s.friends[Math.floor(Math.random() * s.friends.length)];
                    friend.relation -= 15;
                    return { happiness: -5, msg: `${friend.name} se decepcionó de ti.`, type: 'bad' };
                }
            }
        ]
    },
    // 2. Wedding Invitation
    {
        id: 12, type: 'choice', text: "Boda de tu mejor amigo. ¿Asistir?",
        condition: (s) => s.friends.length > 0 && s.money > 500,
        choices: [
            {
                text: "¡Sí! (Regalo $500)", sub: "Fiesta y alegría", action: (s) => {
                    const friend = s.friends[0]; // Best friend usually first or random
                    friend.relation = Math.min(100, friend.relation + 15);
                    return { money: -500, happiness: 20, msg: "¡Qué gran boda! Bailaste toda la noche.", type: 'good' };
                }
            },
            {
                text: "No ir", sub: "Ahorrar ($500)", action: (s) => {
                    const friend = s.friends[0];
                    friend.relation -= 25;
                    return { happiness: -10, msg: "Tu amigo no te lo perdonará pronto.", type: 'bad' };
                }
            }
        ]
    },
    // 3. Family Drama
    {
        id: 13, type: 'choice', text: "Tus padres tienen una emergencia médica.",
        condition: (s) => s.money > 1000,
        choices: [
            { text: "Ayudar ($1000)", sub: "Es tu familia", action: (s) => ({ money: -1000, happiness: 10, msg: "Hiciste lo correcto. Se están recuperando.", type: 'good' }) },
            { text: "No puedo", sub: "La economía está mal", action: (s) => ({ happiness: -20, mentalHealth: -10, msg: "La culpa te carcome.", type: 'bad' }) }
        ]
    },
    // 4. Child Milestone
    {
        id: 14, type: 'instant', text: "¡Tu hijo trajo buenas notas!",
        condition: (s) => s.children.length > 0,
        effect: (s) => {
            const child = s.children[Math.floor(Math.random() * s.children.length)];
            return { happiness: 15, msg: `¡Orgullo de padre/madre! ${child.name} es brillante.`, type: 'good' };
        }
    },
    {
        id: 15, type: 'instant', text: "Tu hijo hizo un dibujo de la familia.",
        condition: (s) => s.children.length > 0,
        effect: (s) => ({ happiness: 10, msg: "Lo pegaste en la nevera. Qué tierno.", type: 'good' })
    },
    // 5. Old Friend Reconnect
    {
        id: 16, type: 'instant', text: "Un viejo amigo te escribió.",
        condition: (s) => s.friends.length > 0,
        effect: (s) => {
            const f = s.friends[Math.floor(Math.random() * s.friends.length)];
            f.relation += 10;
            return { happiness: 5, msg: `Chat con ${f.name} reavivó la amistad.`, type: 'good' };
        }
    },

    // --- TRAVEL EVENTS ---
    {
        id: 17, type: 'instant', text: "Perdiste tu pasaporte.",
        condition: s => s.currentCountry && s.currentCountry !== 'home',
        effect: (s) => ({ money: -200, happiness: -10, msg: "Trámite de emergencia. -$200", type: 'bad' })
    },
    {
        id: 18, type: 'instant', text: "Probaste comida local exótica.",
        condition: s => s.currentCountry && s.currentCountry !== 'home',
        effect: (s) => {
            if (Math.random() > 0.3) {
                return { happiness: 10, msg: "¡Delicioso! +Felicidad", type: 'good' };
            } else {
                return { health: -5, happiness: -5, msg: "Te cayó mal. -Salud", type: 'bad' };
            }
        }
    },
    {
        id: 19, type: 'choice', text: "Un local te invita a una fiesta tradicional.",
        condition: s => s.currentCountry && s.currentCountry !== 'home',
        choices: [
            {
                text: "Ir", sub: "Integración cultural", action: (s) => {
                    if (typeof Travel !== 'undefined') Travel.updateAdaptation(5);
                    return { happiness: 10, msg: "Gran experiencia. +Adaptación", type: 'good' };
                }
            },
            { text: "Quedarse", sub: "Descansar", action: (s) => ({ energy: 10, msg: "Descansaste en el hotel.", type: 'info' }) }
        ]
    },
    {
        id: 20, type: 'instant', text: "Problemas con la visa.",
        condition: s => s.visaStatus && s.visaStatus.expiryMonths < 6,
        effect: (s) => ({ stress: 10, msg: "Tu visa está por vencer. ¡Estrés!", type: 'bad' })
    }
];

const PROJECT_TYPES = [
    { id: 'delivery_app', name: 'App de Delivery 🍔', cost: 0, targetLoc: 1000, potential: 800, difficulty: 1.0, req: { intelligence: 20 }, desc: 'Alta demanda. Ingresos pasivos variables. Requiere mantenimiento mensual.' },
    { id: 'crm_system', name: 'Sistema CRM 📊', cost: 0, targetLoc: 1000, potential: 500, difficulty: 1.5, req: { intelligence: 40 }, desc: 'Ingresos B2B estables. Menor mantenimiento, crecimiento lento.' },
    { id: 'game', name: 'Indie Game 🎮', cost: 0, targetLoc: 2000, potential: 5000, difficulty: 2.0, req: { intelligence: 60 }, desc: 'Alto riesgo, alta recompensa. Hit or miss.' }
];
