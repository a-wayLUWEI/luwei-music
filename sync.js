// ==================== sync.js ====================
// 芦苇音乐 · 数据同步模块
// 待同步队列（离线时使用）
let syncQueue = [];
let isSyncing = false;
// 收集当前页面的所有数据
function collectLocalData() {
    const userId = currentUser?.user_id || "mock_user";
    const data = {
        levels: [],
        masters: [],
        styles: [],
        wrongs: [],
        favorites: []
    };
    // 收集关卡通关记录
    for (let i = 0; i < 50; i++) {
        if (localStorage.getItem(`level_${i}_${userId}`) === "true") {
            data.levels.push(i);
        }
    }
    // 收集大师通关记录
    const artists = ["周杰伦", "邓紫棋", "林俊杰", "陈奕迅", "王菲", "张惠妹", "孙燕姿", "五月天", "S.H.E", "梁静茹"];
    artists.forEach(artist => {
        if (localStorage.getItem(`master_${artist}_${userId}`) === "true") {
            data.masters.push(artist);
        }
    });
    // 收集风格通关记录
    const styles = ["摇滚", "R&B", "爵士", "民谣", "蓝调", "放克", "电子", "嘻哈"];
    styles.forEach(style => {
        if (localStorage.getItem(`style_${style}_${userId}`) === "true") {
            data.styles.push(style);
        }
    });
    // 收集错题
    data.wrongs = JSON.parse(localStorage.getItem(`wrongs_${userId}`) || "[]");
    // 收集收藏
    data.favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
    return data;
}
// 同步本地数据到云端
async function syncToCloud() {
    if (!currentUser) {
        console.log("未登录，跳过同步");
        return false;
    }
    if (isSyncing) {
        console.log("同步中，跳过");
        return false;
    }
    isSyncing = true;
    try {
        const localData = collectLocalData();
        const result = await window.API.syncUserData(localData);
        if (result.code === 0) {
            console.log("✅ 数据同步成功");
            return true;
        }
    } catch(e) {
        console.error("同步失败，加入队列:", e);
        syncQueue.push(Date.now());
    } finally {
        isSyncing = false;
    }
    return false;
}
// 从云端拉取数据并合并到本地
async function pullFromCloud() {
    if (typeof getCurrentUser !== 'function') {
        console.log("getCurrentUser 未定义，跳过拉取")
        return false
    }
    const user = await getCurrentUser()
    if (!user) {
        console.log("未登录，跳过拉取")
        return false
    }
    try {
        if (!window.API) {
            console.log("API 未就绪")
            return false
        }
        const userId = user.user_id
        // 拉取积分
        if (window.API.getUserScore) {
            const cloudScore = await window.API.getUserScore()
            localStorage.setItem(`user_score_${userId}`, cloudScore)
            console.log("✅ 积分同步:", cloudScore)
        }
        // 拉取通关记录
        if (window.API.getCompletedLevels) {
            const completedLevels = await window.API.getCompletedLevels()
            for (const levelId of completedLevels) {
                localStorage.setItem(`level_${levelId}_${userId}`, "true")
            }
            console.log("✅ 通关记录同步:", completedLevels.length, "关")
        }
        console.log("✅ 从云端拉取数据成功")
        return true
    } catch(e) {
        console.error("拉取云端数据失败:", e)
        return false
    }
}
// 登录成功后调用：拉取云端数据
function onLoginSuccess(user) {
    pullFromCloud().then(() => {
        // 刷新页面数据
        if (typeof refreshPageData === "function") {
            refreshPageData();
        }
    });
}
// 定时同步（每5分钟）
setInterval(() => {
    if (currentUser && navigator.onLine) {
        syncToCloud();
    }
}, 5 * 60 * 1000);
// 页面关闭前同步
window.addEventListener("beforeunload", () => {
    if (currentUser && navigator.onLine) {
        syncToCloud();
    }
});
// 暴露全局函数
window.syncToCloud = syncToCloud;
window.pullFromCloud = pullFromCloud;
window.collectLocalData = collectLocalData;

