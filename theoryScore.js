// theoryScore.js - 每天首次进入加4分版本 + 积分明细记录
const MODULE_NAME = 'theory';

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

function getTheoryScore() {
    const userId = getCurrentUserId();
    const key = `${userId}_${MODULE_NAME}_score`;
    return parseInt(localStorage.getItem(key) || '0');
}

function saveTheoryScore(score) {
    const userId = getCurrentUserId();
    const key = `${userId}_${MODULE_NAME}_score`;
    localStorage.setItem(key, score);
}

function addTheoryScore(amount, reason) {
    const currentScore = getTheoryScore();
    const newScore = currentScore + amount;
    saveTheoryScore(newScore);
    
    const scoreSpan = document.getElementById('theoryScore');
    if (scoreSpan) {
        scoreSpan.innerText = newScore;
    }
    
    // ✅ 添加积分明细记录
    addPointsLog(amount, reason, 'earn');
    
    console.log(`+${amount} 积分：${reason}，当前乐理积分：${newScore}`);
    return newScore;
}

function initTheoryScore() {
    const score = getTheoryScore();
    const scoreSpan = document.getElementById('theoryScore');
    if (scoreSpan) {
        scoreSpan.innerText = score;
    }
    console.log(`乐理模块积分初始化：${score}`);
}

function addStudyPoints(amount, reason) {
    addTheoryScore(amount, reason);
}

// ========== 每天首次进入加分 ==========
function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

async function addDailyEntryScore() {
    const userId = getCurrentUserId();
    if (userId === 'guest') {
        console.log('未登录，不记录每日进入');
        return false;
    }
    
    const today = getTodayDate();
    const recordKey = `${userId}_${MODULE_NAME}_daily_entry`;
    const lastEntryDate = localStorage.getItem(recordKey);
    
    if (lastEntryDate === today) {
        console.log('今天已经领取过乐理手册的每日积分，跳过');
        return false;
    }
    
    // 加 4 分（积分明细会在 addTheoryScore 中自动记录）
    addTheoryScore(4, '每日首次进入乐理手册');
    localStorage.setItem(recordKey, today);
    console.log('✅ 每日首次进入乐理手册，+4分');
    
    if (window.API && window.API.addScore) {
        await window.API.addScore(4, '每日首次进入乐理手册');
    }
    
    return true;
}

// ========== 页面加载时自动调用 ==========
document.addEventListener('DOMContentLoaded', () => {
    initTheoryScore();
    addDailyEntryScore();
});

function updateUserUI() {
    initTheoryScore();
    addDailyEntryScore();
}

window.updateUserUI = updateUserUI;