// ==================== api.js ====================
const SUPABASE_URL = "https://alzbseigpxxtlqqseczx.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemJzZWlncHh4dGxxcXNlY3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTUyNzEsImV4cCI6MjA5NTM5MTI3MX0.4jpb-o-dnoqzLli9o1rDA-vcThWZWR7vmAxjzZkIdJ4"

let supabaseClient = null

async function initSupabase() {
    if (supabaseClient) return supabaseClient
    if (typeof supabase === 'undefined') {
        console.error("Supabase SDK 未加载")
        return null
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    })
    return supabaseClient
}

async function getCurrentUser() {
    const local = localStorage.getItem('currentUser');
    if (local) {
        try {
            const u = JSON.parse(local);
            if (u && u.user_id) {
                return { id: u.user_id, email: u.email };
            }
        } catch(e) {}
    }
    return null;
}

async function getUserScore() {
    const user = await getCurrentUser();
    if (!user) return 0;
    const client = await initSupabase();
    if (!client) return 0;
    try {
        const { data, error } = await client
            .from('scores')
            .select('score')
            .eq('user_id', user.id)
            .maybeSingle();
        if (error) return 0;
        return data ? data.score : 0;
    } catch (e) {
        return 0;
    }
}

async function addScore(amount, reason) {
    const user = await getCurrentUser()
    if (!user) return { code: -1, msg: "未登录" }
    const client = await initSupabase()
    try {
        const current = await getUserScore()
        const newScore = current + amount
        const { error } = await client
            .from('scores')
            .upsert({
                user_id: user.id,
                score: newScore,
                updated_at: new Date()
            }, { onConflict: 'user_id' })
        if (error) throw error
        return { code: 0, newScore }
    } catch (e) {
        return { code: -1, msg: e.message }
    }
}

async function getCompletedLevels() {
    const user = await getCurrentUser();
    if (!user) return [];
    const client = await initSupabase();
    if (!client) return [];
    try {
        const { data, error } = await client
            .from('level_progress')
            .select('level_id')
            .eq('user_id', user.id)
            .eq('completed', true);
        if (error) return [];
        return data ? data.map(l => l.level_id) : [];
    } catch (e) {
        return [];
    }
}

async function completeLevel(levelId, levelScore) {
    const user = await getCurrentUser()
    if (!user) return { code: -1 }
    const client = await initSupabase()
    try {
        const { error } = await client
            .from('level_progress')
            .upsert({
                user_id: user.id,
                level_id: levelId,
                completed: true,
                completed_at: new Date(),
                best_score: levelScore
            }, { onConflict: 'user_id,level_id' })
        if (error) throw error
        return { code: 0 }
    } catch (e) {
        return { code: -1 }
    }
}

// ========== 暴露 API ==========
window.API = {
    initSupabase: initSupabase,
    getCurrentUser: getCurrentUser,
    getUserScore: getUserScore,
    addScore: addScore,
    getCompletedLevels: getCompletedLevels,
    completeLevel: completeLevel
}

// 自动初始化
initSupabase().then(() => {
    console.log('✅ Supabase 初始化完成')
})

console.log('✅ API.js 已加载，window.API 包含:', Object.keys(window.API))
