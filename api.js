// ==================== api.js ====================
// 芦苇音乐 · Supabase 真实后端接口（最终修复版）
const SUPABASE_URL = "https://alzbseigpxxtlqqseczx.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_UzooeSumvdzsMaJN0YbFBQ_hPQW4hiF"
let supabaseClient = null
let currentUserCache = null  // 改名，避免冲突
// 初始化 Supabase
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
// 匿名登录
async function anonymousLogin() {
    try {
        const client = await initSupabase()
        if (!client) throw new Error("初始化失败")
        const { data: existing } = await client.auth.getSession()
        if (existing?.session) {
            console.log("已有 session")
            currentUserCache = existing.session.user
            return currentUserCache
        }
        const { data, error } = await client.auth.signInAnonymously()
        if (error) throw error
        console.log("匿名登录成功:", data.user.id)
        currentUserCache = data.user
        return data.user
    } catch (e) {
        console.error("匿名登录失败:", e)
        return null
    }
}
// 获取当前用户
async function getCurrentUser() {
    if (currentUserCache) return currentUserCache
    const client = await initSupabase()
    if (!client) return null
    const { data } = await client.auth.getUser()
    currentUserCache = data?.user || null
    return currentUserCache
}
// 获取用户积分
async function getUserScore() {
    const user = await getCurrentUser()
    if (!user) return 0
    const client = await initSupabase()
    try {
        const { data, error } = await client
            .from('scores')
            .select('score')
            .eq('user_id', user.id)
            .maybeSingle()
        return data?.score || 0
    } catch (e) {
        console.error("获取积分异常:", e)
        return 0
    }
}
// 增加积分
async function addScore(amount, reason) {
    const user = await getCurrentUser()
    if (!user) return { code: -1 }
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
        console.error("加分失败:", e)
        return { code: -1 }
    }
}
// 获取通关记录
async function getCompletedLevels() {
    const user = await getCurrentUser()
    if (!user) return []
    const client = await initSupabase()
    try {
        const { data, error } = await client
            .from('level_progress')
            .select('level_id')
            .eq('user_id', user.id)
            .eq('completed', true)
        if (error) throw error
        return data?.map(l => l.level_id) || []
    } catch (e) {
        console.error("获取通关记录失败:", e)
        return []
    }
}
// 记录通关
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
        console.error("记录通关失败:", e)
        return { code: -1 }
    }
}
// 同步数据到云端
async function syncUserData(data) {
    const user = await getCurrentUser()
    if (!user) return { code: -1, msg: "未登录" }
    const client = await initSupabase()
    try {
        if (data.score !== undefined) {
            await client.from('scores').upsert({
                user_id: user.id,
                score: data.score,
                updated_at: new Date()
            }, { onConflict: 'user_id' })
        }
        if (data.levels && data.levels.length) {
            for (const levelId of data.levels) {
                await client.from('level_progress').upsert({
                    user_id: user.id,
                    level_id: levelId,
                    completed: true,
                    completed_at: new Date()
                }, { onConflict: 'user_id,level_id' })
            }
        }
        return { code: 0, msg: "同步成功" }
    } catch (e) {
        console.error("同步失败:", e)
        return { code: -1, msg: e.message }
    }
}
// 从云端拉取数据
async function pullFromCloud() {
    const score = await getUserScore()
    const levels = await getCompletedLevels()
    return {
        code: 0,
        data: { score, levels, wrongs: [], favorites: [] }
    }
}
// 全局暴露
window.API = {
    initSupabase,
    anonymousLogin,
    getCurrentUser,
    getUserScore,
    addScore,
    getCompletedLevels,
    completeLevel,
    syncUserData,
    pullFromCloud
}
// 页面加载时自动登录
window.addEventListener('DOMContentLoaded', async () => {
    await initSupabase()
    const user = await anonymousLogin()
    if (user && typeof window.onLoginSuccess === 'function') {
        const score = await getUserScore()
        window.onLoginSuccess({ 
            user_id: user.id, 
            nickname: '芦苇同学', 
            score: score 
        })
    }
})

