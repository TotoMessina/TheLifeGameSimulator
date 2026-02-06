
// --- SUPABASE CONFIG ---
// TODO: Replace with your actual Supabase URL and Key
const SUPABASE_URL = 'https://ulqifkyuklkjywlpkauw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscWlma3l1a2xranl3bHBrYXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODE0ODQsImV4cCI6MjA4NTg1NzQ4NH0.CVgCUF_Hy06Ks2Q0xyJiKUBsx_G-y5PA59ArRRtLjYE';

let sb = null;
try {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.error("Supabase init error:", e);
}

// --- SUPABASE LOGIC ---
const DB = {
    user: null,

    async init() {
        if (!sb) return;
        try {
            const { data: { session } } = await sb.auth.getSession();
            this.user = session?.user || null;
            UI.updateAuthUI(this.user);

            sb.auth.onAuthStateChange((_event, session) => {
                this.user = session?.user || null;
                UI.updateAuthUI(this.user);
            });
        } catch (e) { console.log("Supabase/Auth offline or not conn."); }
    },

    async login(email, password) {
        if (!sb) return UI.showAlert("Error", "Configura SUPABASE_URL en el código.");
        UI.els.auth.msg.innerText = "Conectando...";

        // Try SignIn
        let { data, error } = await sb.auth.signInWithPassword({ email, password });

        if (error) {
            // Try SignUp
            console.log("Login failed, trying signup:", error.message);
            const { data: signUpData, error: signUpError } = await sb.auth.signUp({ email, password });
            if (signUpError) {
                UI.els.auth.msg.innerText = "Error: " + signUpError.message;
            } else {
                UI.els.auth.msg.innerText = "¡Registro exitoso!";
            }
        } else {
            UI.els.auth.msg.innerText = "";
            UI.showAlert("Bienvenido", "Sesión iniciada correctamente.");
            UI.els.modals.settings.classList.remove('active');
        }
    },

    async logout() {
        if (!sb) return;
        await sb.auth.signOut();
    },

    async saveGame() {
        if (!this.user) return;
        UI.els.auth.saveMsg.innerText = "Guardando...";

        const { error } = await sb
            .from('saves')
            .upsert({ user_id: this.user.id, game_data: state });

        if (error) {
            UI.els.auth.saveMsg.innerText = "Error al guardar: " + error.message;
        } else {
            UI.els.auth.saveMsg.innerText = "¡Partida guardada!";
            setTimeout(() => UI.els.auth.saveMsg.innerText = "Sesión activa.", 2000);
        }
    },

    async loadGame() {
        if (!this.user) return;
        UI.els.auth.saveMsg.innerText = "Cargando...";

        const { data, error } = await sb
            .from('saves')
            .select('game_data')
            .single();

        if (error) {
            UI.els.auth.saveMsg.innerText = "No se encontró partida guardada.";
        } else if (data) {
            state = data.game_data;
            UI.render();
            Game.randomEvent(); // Just to refresh state/visuals maybe
            UI.log("Partida cargada desde la nube.", "info");
            UI.els.modals.settings.classList.remove('active');
        }
    },

    async submitScore(score) {
        if (!this.user || !sb) return;
        // Assuming 'leaderboard' table exists: id, user_id, email, score, created_at
        await sb.from('leaderboard').insert({
            user_id: this.user.id,
            email: this.user.email,
            score: score
        });
    },

    async logHistory(month, fin) {
        if (!this.user || !sb) return;
        try {
            await sb.from('game_history').insert({
                user_id: this.user.id,
                month: month,
                net_worth: fin.netWorth,
                cash: fin.cash,
                assets: fin.investments + fin.realEstate
            });
        } catch (e) { console.log("Log history fail", e); }
    }
};
