// ==================== shop-api.js ====================
// 商城专用 API，纯 localStorage 实现，不依赖 Supabase

// ==================== 积分明细记录 ====================
function addPointsLog(amount, reason, type) {
    let userId = null;
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const u = JSON.parse(userStr);
            userId = u.user_id;
        } catch(e) {}
    }
    if (!userId) return;
    
    const logKey = `points_log_${userId}`;
    let logs = [];
    const existing = localStorage.getItem(logKey);
    if (existing) {
        try { logs = JSON.parse(existing); } catch(e) {}
    }
    logs.push({
        time: new Date().toLocaleString(),
        reason: reason,
        amount: Math.abs(amount),
        type: type
    });
    if (logs.length > 500) logs.shift();
    localStorage.setItem(logKey, JSON.stringify(logs));
}

// ==================== 原有函数 ====================

// 获取当前用户
function getShopUser() {
    const local = localStorage.getItem('currentUser');
    if (local) {
        try {
            return JSON.parse(local);
        } catch(e) {}
    }
    return null;
}

// 获取用户总获得积分（和首页完全一致的汇总方式）
function getTotalEarnedPoints(userId) {
    if (!userId) return 0;
    
    let total = 0;
    
    const modules = ['beginner', 'theory', 'style', 'advanced'];
    modules.forEach(module => {
        let val = localStorage.getItem(`${userId}${module}Score`);
        if (!val) val = localStorage.getItem(`${userId}_${module}_score`);
        if (val) total += parseInt(val);
    });
    
    const legacyScore = localStorage.getItem('theory_score');
    if (legacyScore) total += parseInt(legacyScore);
    
    return total;
}

// 获取用户已使用的积分（商城兑换扣减）
function getUsedPoints(userId) {
    if (!userId) return 0;
    const usedKey = `shop_used_points_${userId}`;
    return parseInt(localStorage.getItem(usedKey) || '0');
}

// 获取用户当前可用积分 = 总获得积分 - 已使用积分
function getShopUserScore() {
    const user = getShopUser();
    if (!user) return 0;
    
    const userId = user.user_id;
    const earned = getTotalEarnedPoints(userId);
    const used = getUsedPoints(userId);
    
    return earned - used;
}

// 扣减积分（兑换时调用）
async function addShopScore(amount, reason) {
    const user = getShopUser();
    if (!user) return { code: -1, msg: "未登录" };
    
    const userId = user.user_id;
    
    // amount 应该是负数（如 -100）
    if (amount >= 0) {
        return { code: 0, msg: "商城只支持扣减积分" };
    }
    
    const usedKey = `shop_used_points_${userId}`;
    const currentUsed = getUsedPoints(userId);
    const newUsed = currentUsed + Math.abs(amount);
    localStorage.setItem(usedKey, newUsed);
    
    // ✅ 添加积分明细记录（消费）
    addPointsLog(Math.abs(amount), reason || '积分商城兑换', 'spend');
    
    console.log(`✅ 商城兑换 -${Math.abs(amount)} 积分，累计已使用: ${newUsed}`);
    
    return { code: 0, newScore: getShopUserScore() };
}

// 获取总获得积分（供调试用）
function getRawEarnedScore() {
    const user = getShopUser();
    if (!user) return 0;
    return getTotalEarnedPoints(user.user_id);
}

// 暴露 API
window.ShopAPI = {
    getUser: getShopUser,
    getUserScore: getShopUserScore,
    addScore: addShopScore,
    getRawEarnedScore: getRawEarnedScore
};

console.log('✅ Shop-API.js 已加载（纯 localStorage 版，支持同退同进）');