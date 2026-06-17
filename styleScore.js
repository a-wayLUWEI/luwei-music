// styleScore.js
const MODULE_NAME = 'style';

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
    return null;
}

function addStyleScore(points, reason) {
    const userId = getCurrentUserId();
    if (!userId) return 0;
    const key = `${userId}${MODULE_NAME}Score`;
    const current = parseInt(localStorage.getItem(key) || '0');
    const newScore = current + points;
    localStorage.setItem(key, newScore);
    
    // ✅ 添加积分明细记录
    addPointsLog(points, reason || '风格与鉴赏通关', 'earn');
    
    // 更新页面显示
    displayStyleScore();
    
    // 同步到云端
    if (window.API && window.API.addScore) {
        window.API.addScore(points, reason || `风格与鉴赏通关`);
    }
    
    console.log(`风格与鉴赏 +${points} 分，当前 ${MODULE_NAME} 积分：${newScore}`);
    return newScore;
}

function getStyleScore() {
    const userId = getCurrentUserId();
    if (!userId) return 0;
    const key = `${userId}${MODULE_NAME}Score`;
    return parseInt(localStorage.getItem(key) || '0');
}

function displayStyleScore() {
    const el = document.getElementById('styleScore');
    if (el) el.innerText = getStyleScore();
}

// 页面加载时显示积分
document.addEventListener('DOMContentLoaded', () => {
    displayStyleScore();
});