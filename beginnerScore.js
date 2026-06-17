// beginnerScore.js
const MODULE_NAME = 'beginner';

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

function addBeginnerScore(points) {
    const userId = getCurrentUserId();
    if (!userId) return 0;
    const key = `${userId}${MODULE_NAME}Score`;
    const current = parseInt(localStorage.getItem(key) || '0');
    const newScore = current + points;
    localStorage.setItem(key, newScore);
    
    // ✅ 添加积分明细记录
    addPointsLog(points, '音乐小白学习通关', 'earn');
    
    return newScore;
}

function getBeginnerScore() {
    const userId = getCurrentUserId();
    if (!userId) return 0;
    const key = `${userId}${MODULE_NAME}Score`;
    return parseInt(localStorage.getItem(key) || '0');
}

function displayBeginnerScore() {
    const el = document.getElementById('beginnerScore');
    if (el) el.innerText = getBeginnerScore();
}