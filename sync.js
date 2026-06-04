// ==================== sync.js ====================
// 芦苇音乐 · 数据同步模块（完整修复版）
// 待同步队列（离线时使用）
let syncQueue = [];
let isSyncing = false;
// 获取当前用户（异步兼容）
async function getSyncUser() {
    // 优先使用 API 模块的 getCurrentUser
    if (typeof window.API !== 'undefined' && window.API.getCurrentUser) {
        return await window.API.getCurrentUser();
    }
    // 兼容旧的 getCurrentUser 函数
    if (typeof getCurrentUser === 'function') {
        return await getCurrentUser();
    }
    // 兼容同步的 currentUser 变量
    if (typeof currentUser !== 'undefined' && currentUser) {
        return currentUser;
    }
    return null;
}
// 收集当前页面的所有数据
async function collectLocalData() {
    const user = await getSyncUser();
    const userId = user?.user_id || "guest";
    const data = {
        levels: [],
        masters: [],
        styles: [],
        folkUnits: [],
        gufengSongs: [],
        wrongs: [],
        favorites: [],
        notes: [],
        works: [],
        score: 0
    };
    // 收集关卡通关记录（29关）
    for (let i = 0; i < 50; i++) {
        if (localStorage.getItem(`level_${i}_${userId}`) === "true") {
            data.levels.push(i);
        }
    }
    // 收集大师通关记录（26位歌手）
    const artists = ["周杰伦", "邓紫棋", "林俊杰", "陈奕迅", "王菲", "张惠妹", "孙燕姿", "五月天", "S.H.E", "梁静茹", "徐佳莹", "萧亚轩", "杨丞琳", "张靓颖", "张碧晨", "华晨宇", "那英", "单依纯", "窦靖童", "周兴哲", "JOYCE就以斯"];
    artists.forEach(artist => {
        if (localStorage.getItem(`master_${artist}_${userId}`) === "true") {
            data.masters.push(artist);
        }
    });
    // 收集风格通关记录（15种风格）
    const styles = ["摇滚", "R&B", "爵士", "民谣", "蓝调", "放克", "电子", "嘻哈", "金属", "雷鬼", "灵魂乐", "福音", "世界音乐", "拉丁", "乡村"];
    styles.forEach(style => {
        if (localStorage.getItem(`style_${style}_${userId}`) === "true") {
            data.styles.push(style);
        }
    });
    // 收集民歌通关记录
    const folkUnits = ["民歌地域猜猜看", "民歌情绪与场景", "民歌与流行歌的改编"];
    folkUnits.forEach(unit => {
        if (localStorage.getItem(`folk_${unit}_${userId}`) === "true") {
            data.folkUnits.push(unit);
        }
    });
    // 收集古风歌曲通关记录
    const gufengSongs = ["《凉凉》", "《青花瓷》", "《桃花诺》"];
    gufengSongs.forEach(song => {
        if (localStorage.getItem(`gufeng_${song}_${userId}`) === "true") {
            data.gufengSongs.push(song);
        }
    });
    // 收集错题
    data.wrongs = JSON.parse(localStorage.getItem(`wrongs_${userId}`) || "[]");
    // 收集收藏
    data.favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`) || "[]");
    // 收集学习笔记
    data.notes = JSON.parse(localStorage.getItem(`study_notes_${userId}`) || "[]");
    // 收集我的作品
    data.works = JSON.parse(localStorage.getItem(`user_works_${userId}`) || "[]");
    // 收集积分
    data.score = parseInt(localStorage.getItem(`user_score_${userId}`) || "0");
    return data;
}
// 同步本地数据到云端
async function syncToCloud() {
    const user = await getSyncUser();
    if (!user) {
        console.log("未登录，跳过同步");
        return false;
    }
    if (isSyncing) {
        console.log("同步中，跳过");
        return false;
    }
    isSyncing = true;
    try {
        const localData = await collectLocalData();
        // 如果 API 可用，调用同步
        if (typeof window.API !== 'undefined' && window.API.syncUserData) {
            const result = await window.API.syncUserData(localData);
            if (result.code === 0) {
                console.log("✅ 数据同步成功");
                return true;
            }
        }
        // 备用方案：保存到 localStorage 的云端缓存
        const userId = user.user_id;
        localStorage.setItem(`cloud_sync_cache_${userId}`, JSON.stringify({
            data: localData,
            time: Date.now()
        }));
        console.log("✅ 数据已缓存到本地");
        return true;
    } catch(e) {
        console.error("同步失败，加入队列:", e);
        syncQueue.push(Date.now());
        return false;
    } finally {
        isSyncing = false;
    }
}
// 从云端拉取数据并合并到本地
async function pullFromCloud() {
    const user = await getSyncUser();
    if (!user) {
        console.log("未登录，跳过拉取");
        return false;
    }
    try {
        // 如果 API 可用，从云端拉取
        if (typeof window.API !== 'undefined' && window.API.pullFromCloud) {
            const result = await window.API.pullFromCloud();
            if (result.code === 0 && result.data) {
                const userId = user.user_id;
                // 合并积分
                if (result.data.score !== undefined) {
                    localStorage.setItem(`user_score_${userId}`, result.data.score);
                    if (user.score !== undefined) user.score = result.data.score;
                }
                // 合并通关记录
                if (result.data.levels && result.data.levels.length) {
                    for (const levelId of result.data.levels) {
                        localStorage.setItem(`level_${levelId}_${userId}`, "true");
                    }
                }
                // 合并大师通关
                if (result.data.masters && result.data.masters.length) {
                    for (const artist of result.data.masters) {
                        localStorage.setItem(`master_${artist}_${userId}`, "true");
                    }
                }
                // 合并风格通关
                if (result.data.styles && result.data.styles.length) {
                    for (const style of result.data.styles) {
                        localStorage.setItem(`style_${style}_${userId}`, "true");
                    }
                }
                // 合并错题
                if (result.data.wrongs && result.data.wrongs.length) {
                    localStorage.setItem(`wrongs_${userId}`, JSON.stringify(result.data.wrongs));
                }
                // 合并收藏
                if (result.data.favorites && result.data.favorites.length) {
                    localStorage.setItem(`favorites_${userId}`, JSON.stringify(result.data.favorites));
                }
                // 合并笔记
                if (result.data.notes && result.data.notes.length) {
                    localStorage.setItem(`study_notes_${userId}`, JSON.stringify(result.data.notes));
                }
                // 合并作品
                if (result.data.works && result.data.works.length) {
                    localStorage.setItem(`user_works_${userId}`, JSON.stringify(result.data.works));
                }
                console.log("✅ 从云端拉取数据成功");
                // 刷新页面数据
                if (typeof window.API !== 'undefined' && window.API.refreshPageData) {
                    await window.API.refreshPageData();
                }
                return true;
            }
        }
        // 备用方案：从 localStorage 缓存恢复
        const userId = user.user_id;
        const cached = localStorage.getItem(`cloud_sync_cache_${userId}`);
        if (cached) {
            const cache = JSON.parse(cached);
            console.log("✅ 从本地缓存恢复数据");
            return true;
        }
        console.log("无云端数据需要拉取");
        return false;
    } catch(e) {
        console.error("拉取云端数据失败:", e);
        return false;
    }
}
// 登录成功后调用：拉取云端数据
async function onLoginSuccessHandler(user) {
    console.log("登录成功，开始拉取云端数据...");
    await pullFromCloud();
    // 刷新页面数据
    if (typeof window.API !== 'undefined' && window.API.refreshPageData) {
        await window.API.refreshPageData();
    }
    // 触发自定义事件，通知其他模块刷新
    const event = new CustomEvent('userLoggedIn', { detail: { user: user } });
    window.dispatchEvent(event);
}
// 重试队列中的同步任务
async function processSyncQueue() {
    if (syncQueue.length === 0) return;
    if (!navigator.onLine) return;
    console.log(`处理同步队列，剩余 ${syncQueue.length} 个任务`);
    for (const task of syncQueue) {
        await syncToCloud();
    }
    syncQueue = [];
}
// 定时同步（每5分钟）
setInterval(() => {
    (async () => {
        const user = await getSyncUser();
        if (user && navigator.onLine) {
            await syncToCloud();
        }
    })();
}, 5 * 60 * 1000);
// 网络恢复时同步
window.addEventListener("online", () => {
    console.log("网络已恢复，开始同步...");
    processSyncQueue();
    syncToCloud();
});
// 页面关闭前同步
window.addEventListener("beforeunload", () => {
    (async () => {
        const user = await getSyncUser();
        if (user && navigator.onLine) {
            await syncToCloud();
        }
    })();
});
// 页面加载时尝试同步
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(async () => {
            const user = await getSyncUser();
            if (user && navigator.onLine) {
                await syncToCloud();
            }
        }, 1000);
    });
} else {
    setTimeout(async () => {
        const user = await getSyncUser();
        if (user && navigator.onLine) {
            await syncToCloud();
        }
    }, 1000);
}
// 暴露全局函数
window.syncToCloud = syncToCloud;
window.pullFromCloud = pullFromCloud;
window.collectLocalData = collectLocalData;
window.processSyncQueue = processSyncQueue;
window.getSyncUser = getSyncUser;
// 如果 auth.js 中的 onLoginSuccess 存在，覆盖它以便自动同步
if (typeof window !== 'undefined') {
    // 保存原有的 onLoginSuccess
    const originalOnLoginSuccess = window.onLoginSuccess;
    // 设置新的 onLoginSuccess
    window.onLoginSuccess = async function(user) {
        // 调用原有函数
        if (typeof originalOnLoginSuccess === 'function') {
            originalOnLoginSuccess(user);
        }
        // 执行同步
        await onLoginSuccessHandler(user);
    };
}
// 导出（如果支持模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { syncToCloud, pullFromCloud, collectLocalData, getSyncUser };
}

