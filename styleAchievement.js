/**
 * styleAchievement.js
 * 统一关卡/成就管理模块
 * 防止重复加分，每个关卡/题目只能完成一次
 * 
 * 关卡类型：
 * - style: 风格闯关（如"摇滚"）
 * - master: 大师鉴赏（如"周杰伦"）
 * - folk: 民歌闯关（如"民歌地域猜猜看"）
 * - gufeng: 古风鉴赏（如"《青花瓷》"）
 * - netstar: 网络歌手（如"庄心妍"）
 * - sink: 下沉苦情歌创作课（如"洋澜一"）
 */

const AchievementManager = {
    // 获取当前用户ID
    getUserId() {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            return user.user_id || user.id || null;
        } catch (e) {
            return null;
        }
    },

    // 生成存储的key
    getKey(type, id) {
        const userId = this.getUserId();
        if (!userId) return null;
        return `achievement_${type}_${id}_${userId}`;
    },

    // 检查是否已完成
    isCompleted(type, id) {
        const key = this.getKey(type, id);
        if (!key) return false;
        return localStorage.getItem(key) === 'true';
    },

    // 标记为已完成，返回是否成功（即是否首次完成）
    markCompleted(type, id) {
        if (this.isCompleted(type, id)) {
            return false; // 已经完成过了
        }
        const key = this.getKey(type, id);
        if (!key) return false;
        localStorage.setItem(key, 'true');
        if (typeof syncToCloud === 'function') {
            syncToCloud();
        }
        return true; // 首次完成
    },

    // 获取某类型所有已完成的ID列表
    getAllCompletedOfType(type) {
        const userId = this.getUserId();
        if (!userId) return [];
        const results = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`achievement_${type}_`) && key.endsWith(`_${userId}`)) {
                const parts = key.split('_');
                if (parts.length >= 3) {
                    results.push(parts[2]);
                }
            }
        }
        return results;
    },

    // 获取所有已完成的关卡列表
    getAllCompleted() {
        const userId = this.getUserId();
        if (!userId) return [];
        const results = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('achievement_') && key.endsWith(`_${userId}`)) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    results.push({
                        type: parts[1],
                        id: parts[2],
                        key: key
                    });
                }
            }
        }
        return results;
    },

    // 清除指定关卡记录（测试用）
    clear(type, id) {
        const key = this.getKey(type, id);
        if (key) {
            localStorage.removeItem(key);
            if (typeof syncToCloud === 'function') {
                syncToCloud();
            }
        }
    },

    // 清除所有记录（谨慎使用）
    clearAll() {
        const userId = this.getUserId();
        if (!userId) return;
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('achievement_') && key.endsWith(`_${userId}`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        if (typeof syncToCloud === 'function') {
            syncToCloud();
        }
    },

    // 获取总成就数
    getTotalCount() {
        return this.getAllCompleted().length;
    },

    // 获取某类型的成就数
    getCountOfType(type) {
        return this.getAllCompletedOfType(type).length;
    }
};

if (typeof window !== 'undefined') {
    window.AchievementManager = AchievementManager;
}
