// ==================== auth.js - Supabase 真实认证 ====================
const supabaseUrl = 'https://alzbseigpxxtlqqseczx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemJzZWlncHh4dGxxcXNlY3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTUyNzEsImV4cCI6MjA5NTM5MTI3MX0.4jpb-o-dnoqzLli9o1rDA-vcThWZWR7vmAxjzZkIdJ4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// 获取当前用户
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = {
            user_id: user.id,
            email: user.email,
            nickname: user.email.split('@')[0],
            score: 0
        };
        return currentUser;
    }
    return null;
}

// 退出登录
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    // 刷新页面
    window.location.reload();
}

// 显示登录弹窗
function showLoginModal() {
    let modalHtml = `
        <div id="loginModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;">
            <div style="background:#1a3a2a;border-radius:32px;padding:24px;width:300px;text-align:center;border:1px solid #F2C94C;">
                <div style="color:#FFD966;font-size:1.2rem;margin-bottom:16px;">登录芦苇音乐</div>
                <input type="email" id="loginEmail" placeholder="邮箱" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:white;">
                <input type="password" id="loginPassword" placeholder="密码" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:white;">
                <button id="doLoginBtn" style="background:#E69A2E;border:none;padding:10px;border-radius:40px;width:100%;margin-bottom:8px;font-weight:bold;">登录</button>
                <button id="doRegisterBtn" style="background:#3C6E4A;border:none;padding:10px;border-radius:40px;width:100%;margin-bottom:8px;color:white;">注册</button>
                <button id="closeModalBtn" style="background:none;border:none;color:#AAD4B0;">取消</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('doLoginBtn').onclick = async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            document.getElementById('loginModal').remove();
            window.location.reload();
        }
    };
    
    document.getElementById('doRegisterBtn').onclick = async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert(error.message);
        } else {
            alert('注册成功！请查收验证邮件');
            document.getElementById('loginModal').remove();
        }
    };
    
    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('loginModal').remove();
    };
}

// 暴露给全局
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.showLoginModal = showLoginModal;
