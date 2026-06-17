// advancedScore.js
const MODULE_NAME = 'advanced';

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

// ==================== 原有函数（保持兼容）====================
function getCurrentUserId() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        try {
            const u = JSON.parse(user);
            return u.user_id;
        } catch(e) {}
    }
    return 'guest';
}

// 增加积分（支持两个参数：分数和原因）
function addModuleScore(points, reason) {
    const userId = getCurrentUserId();
    const key = `${userId}${MODULE_NAME}Score`;
    const current = parseInt(localStorage.getItem(key) || '0');
    const newScore = current + points;
    localStorage.setItem(key, newScore);
    
    // ✅ 添加积分明细记录
    addPointsLog(points, reason, 'earn');
    
    // 刷新页面显示
    displayModuleScore();
    
    console.log(`增加 ${points} 分，原因：${reason}，当前总分：${newScore}`);
    return newScore;
}

// 获取当前积分
function getModuleScore() {
    const userId = getCurrentUserId();
    const key = `${userId}${MODULE_NAME}Score`;
    return parseInt(localStorage.getItem(key) || '0');
}

// 刷新页面上的积分显示
function displayModuleScore() {
    const el = document.getElementById('advancedScore');
    if (el) {
        el.innerText = getModuleScore();
    }
}

// 页面加载时显示积分
window.addEventListener('DOMContentLoaded', function() {
    displayModuleScore();
});