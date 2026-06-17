// ==================== checkAuth.js ====================
// 统一登录拦截器，所有模块页面都需要引入

// 获取当前登录用户
function getCurrentAuthUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch(e) {}
    }
    return null;
}

// 检查登录状态，未登录则跳转首页
function requireLogin() {
    const user = getCurrentAuthUser();
    if (!user) {
        // 当前页面不是首页时才跳转
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            alert('请先登录后访问');
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

// 获取用户ID（供其他模块使用）
function getCurrentUserId() {
    const user = getCurrentAuthUser();
    return user ? user.user_id : null;
}

// 退出登录
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 自动执行检查（页面加载时）
requireLogin();

// 暴露给全局
window.checkAuth = {
    requireLogin: requireLogin,
    getCurrentUser: getCurrentAuthUser,
    getCurrentUserId: getCurrentUserId,
    logout: logout
};