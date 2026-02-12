const COMPANIES = [
    { id: 'svc_mcd', name: 'McRonalds', logo: '🍔', sector: 'service', prestige: 30, salaryMult: 0.8, rivals: ['svc_burger'] },
    { id: 'svc_burger', name: 'Burger Queen', logo: '👑', sector: 'service', prestige: 30, salaryMult: 0.8, rivals: ['svc_mcd'] }
];

const JOB_TEMPLATES = [
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
    }
];

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

            JOBS.push(newJob);
        });
    } else {
        // No companies found for this sector, add as independent default
        JOBS.push(template);
    }
});

console.log("Total JOBS:", JOBS.length);

const companyJobs = {};
const independentJobs = [];

JOBS.forEach(j => {
    if (j.companyId) {
        if (!companyJobs[j.companyId]) companyJobs[j.companyId] = [];
        companyJobs[j.companyId].push(j);
    } else {
        independentJobs.push(j);
    }
});

console.log("Company Jobs Keys:", Object.keys(companyJobs));
console.log("Independent Jobs Count:", independentJobs.length);
if (independentJobs.length > 0) {
    console.log("First Independent Job:", independentJobs[0]);
}

