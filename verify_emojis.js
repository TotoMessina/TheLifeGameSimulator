// Verification Script for Emojis
// Mocks
global.window = {};

// Load Config
// I need to read config.js and eval it or parse it.
// Since I can't require it easily (it's not a module), I'll just paste the relevant parts or read it.
// Actually, I can use `fs` if available, but I don't have `fs` access in this environment directly?
// I have `read_file` tool but not inside the script.
// I will just paste the CAREER_TRACKS and JOBS check logic, 
// assuming I can copy-paste the data or just use the data I know is there.
// OPTION B: I will use `run_command` with a script that *reads* config.js content.

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js/config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// We need to extract CAREER_TRACKS and JOBS from the file content
// This is a bit hacky but works for a verification script without module system
// We will eval the content in a sandbox or just regex it?
// Eval is dangerous but in this isolated env it's fine for verification.

// Remove 'const' to make them global or assign to global
let cleanContent = configContent.replace(/const /g, 'global.');

try {
    eval(cleanContent);
} catch (e) {
    // It might fail on other variables not defined (like other consts).
    // Let's manually define the ones we need or mock them.
}

// Check 1: CAREER_TRACKS vs JOBS
console.log("--- Checking Job Career Icons ---");
if (global.JOBS && global.CAREER_TRACKS) {
    let errors = 0;
    global.JOBS.forEach(j => {
        if (j.id === 'unemployed') return;
        const track = global.CAREER_TRACKS[j.career];
        if (!track) {
            console.error(`[ERROR] Job '${j.id}' has unknown career '${j.career}'`);
            errors++;
        } else if (!track.icon) {
            console.error(`[ERROR] Career '${j.career}' is missing an icon.`);
            errors++;
        }
    });

    if (errors === 0) console.log("✅ All Jobs have valid Career Track Icons.");
    else console.log(`❌ Found ${errors} errors.`);
} else {
    console.log("Could not load JOBS or CAREER_TRACKS from config.js");
}

