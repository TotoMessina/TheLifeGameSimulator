
// Mock Browser Environment
const localStorageData = {};
const localStorage = {
    getItem: (key) => localStorageData[key],
    setItem: (key, val) => localStorageData[key] = val,
    clear: () => { }
};

const navigator = {
    serviceWorker: {
        getRegistrations: async () => {
            return [{ unregister: () => console.log("SW Unregistered") }];
        }
    }
};

const window = {
    location: {
        reload: (force) => console.log(`Reload triggered (Force: ${force})`)
    }
};

const CONFIG = { version: '1.0.5' };

// --- Logic to Test (copied from app.js) ---
async function runCheck() {
    console.log("--- Test Run ---");
    const lastVersion = localStorage.getItem('app_version');
    const currentVersion = CONFIG.version || '1.0.0';

    if (lastVersion !== currentVersion) {
        console.log(`🚀 New Version Detected: ${lastVersion} -> ${currentVersion}`);
        console.log("🧹 Cleaning old cache...");

        // Update version
        localStorage.setItem('app_version', currentVersion);

        // Force SW update
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                registration.unregister();
            }
            console.log("Service Workers Unregistered. Reloading...");
            window.location.reload(true);
        } else {
            window.location.reload(true);
        }
        return "RELOADED";
    }
    return "NO_ACTION";
}

// --- Execution ---
async function test() {
    // 1. First Run
    console.log("\nTest 1: First Load (No Version)");
    let result = await runCheck();
    if (localStorage.getItem('app_version') === '1.0.5' && result === "RELOADED") {
        console.log("PASS: Version set and reload triggered.");
    } else {
        console.log("FAIL");
    }

    // 2. Second Run (Version Matches)
    console.log("\nTest 2: Second Load (Match)");
    result = await runCheck();
    if (result === "NO_ACTION") {
        console.log("PASS: No action taken.");
    } else {
        console.log("FAIL");
    }

    // 3. Update Run (New Version)
    console.log("\nTest 3: Update (New Version)");
    CONFIG.version = '1.0.6';
    result = await runCheck();
    if (localStorage.getItem('app_version') === '1.0.6' && result === "RELOADED") {
        console.log("PASS: Version updated and reload triggered.");
    } else {
        console.log("FAIL");
    }
}

test();
