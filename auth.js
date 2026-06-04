// ==================== auth.js ====================
// 芦苇音乐 · 用户认证模块（邮箱登录版）
const AUTH_CONFIG = {
    // 改为 true 则使用真实后端，false 则使用 Mock 模式（本地模拟）
    USE_REAL_API: false,
    // 真实后端地址（后续替换）
    API_BASE_URL: "https://your-api.com/api",
    // 微信小程序 AppID（真实接入时填写）
    WECHAT_APPID: "",
    // Token 存储 key
    TOKEN_KEY: "reed_token",
    USER_KEY: "reed_user"
};
// 当前用户信息
let currentUser = null;
// 初始化：从 localStorage 恢复登录状态
function initAuth() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    if (token && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            console.log("✅ 已恢复登录状态:", currentUser.nickname);
            return true;
        } catch(e) {}
    }
    currentUser = null;
    return false;
}
// 获取当前用户
function getCurrentUser() {
    return currentUser;
}
// 获取 Token
function getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}
// 保存登录信息
function setAuthData(token, user) {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
    currentUser = user;
}
// 退出登录
function logout() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    currentUser = null;
    if (typeof showLoginModal === "function") {
        showLoginModal();
    }
    alert("已退出登录");
}
// ========== Mock 模式登录（不调后端） ==========
function mockLogin(email = "user@example.com") {
    // 生成一个固定的 userId（基于邮箱）
    let userId = "user_" + email.replace(/[^a-zA-Z0-9]/g, "_");
    let token = "mock_token_" + Date.now();
    let user = {
        user_id: userId,
        email: email,
        nickname: email.split("@")[0] || "芦苇同学",
        avatar_url: "",
        score: parseInt(localStorage.getItem(`user_score_${userId}`) || "0"),
        level: 0,
        vip_expire: null
    };
    setAuthData(token, user);
    console.log("✅ Mock 登录成功:", user);
    if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user);
    }
    return user;
}
// ========== 邮箱验证码登录（真实模式） ==========
async function sendEmailCode(email) {
    if (!AUTH_CONFIG.USE_REAL_API) {
        console.log("Mock: 验证码 123456");
        return { success: true, code: "123456" };
    }
    const res = await fetch(`${AUTH_CONFIG.API_BASE_URL}/login/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    return await res.json();
}
async function verifyEmailCode(email, code) {
    if (!AUTH_CONFIG.USE_REAL_API) {
        if (code === "123456") {
            return mockLogin(email);
        }
        throw new Error("验证码错误");
    }
    const res = await fetch(`${AUTH_CONFIG.API_BASE_URL}/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (data.code === 0) {
        setAuthData(data.token, data.user);
        return data.user;
    }
    throw new Error(data.msg || "登录失败");
}
// ========== 微信登录（真实模式） ==========
async function wechatLogin(code) {
    if (!AUTH_CONFIG.USE_REAL_API) {
        return mockLogin("wx_" + code.slice(0, 8));
    }
    const res = await fetch(`${AUTH_CONFIG.API_BASE_URL}/login/wechat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (data.code === 0) {
        setAuthData(data.token, data.user);
        return data.user;
    }
    throw new Error(data.msg || "微信登录失败");
}
// 显示登录弹窗（邮箱版）
function showLoginModal() {
    // 如果已经登录，不显示弹窗
    if (getCurrentUser()) return;
    let modalHtml = `
        <div id="loginModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;">
            <div style="background:#1a3a2a;border-radius:32px;padding:24px;width:280px;text-align:center;border:1px solid #F2C94C;">
                <div style="color:#FFD966;font-size:1.2rem;margin-bottom:16px;"> 登录芦苇音乐</div>
                <input type="email" id="loginEmail" placeholder="邮箱地址" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:#F5ECD7;">
                <input type="text" id="loginCode" placeholder="验证码" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:#F5ECD7;">
                <button id="sendCodeBtn" style="background:#3C6E4A;border:none;padding:8px;border-radius:40px;width:100%;margin-bottom:8px;color:white;"> 获取验证码</button>
                <button id="loginBtn" style="background:#E69A2E;border:none;padding:8px;border-radius:40px;width:100%;margin-bottom:8px;color:#2D1E0C;font-weight:bold;"> 登录/注册</button>
                <button id="closeModalBtn" style="background:none;border:none;color:#AAD4B0;">✕ 暂不登录</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    document.getElementById("sendCodeBtn")?.addEventListener("click", async () => {
        let email = document.getElementById("loginEmail").value;
        if (!email || !email.includes("@")) { alert("请输入正确的邮箱地址"); return; }
        await sendEmailCode(email);
        alert("验证码已发送（Mock: 123456）");
    });
    document.getElementById("loginBtn")?.addEventListener("click", async () => {
        let email = document.getElementById("loginEmail").value;
        let code = document.getElementById("loginCode").value;
        if (!email || !email.includes("@")) { alert("请输入正确的邮箱地址"); return; }
        try {
            let user = await verifyEmailCode(email, code);
            document.getElementById("loginModal")?.remove();
            location.reload();
        } catch(e) {
            alert(e.message);
        }
    });
    document.getElementById("closeModalBtn")?.addEventListener("click", () => {
        document.getElementById("loginModal")?.remove();
    });
}
// 页面加载时自动初始化
initAuth();
// 如果没有登录，显示登录弹窗
if (!currentUser && AUTH_CONFIG.USE_REAL_API) {
    window.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            if (!getCurrentUser()) showLoginModal();
        }, 500);
    });
} else if (!currentUser) {
    // Mock模式：自动登录一个测试用户
    window.addEventListener("DOMContentLoaded", () => {
        if (!getCurrentUser()) {
            mockLogin("test@reedmusic.com");
            location.reload();
        }
    });
}
// 暴露全局函数
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.showLoginModal = showLoginModal;

