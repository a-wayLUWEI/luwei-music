// ==================== auth.js ====================
// 所有 Supabase 相关定义都在 api.js 里，这里只依赖 API

async function getCurrentUser() {
    const local = localStorage.getItem('currentUser');
    if (local) return JSON.parse(local);
    
    if (!window.API || !window.API.initSupabase) {
        console.error('API 未加载');
        return null;
    }
    const sb = await window.API.initSupabase();
    if (!sb) return null;
    
    const { data } = await sb.auth.getUser();
    if (data.user) {
        const user = {
            user_id: data.user.id,
            email: data.user.email,
            nickname: data.user.email.split('@')[0],
            score: 0
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
}

async function logout() {
    if (window.API && window.API.initSupabase) {
        const sb = await window.API.initSupabase();
        if (sb) await sb.auth.signOut();
    }
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showLoginModal() {
    const modalHtml = `
        <div id="loginModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;">
            <div style="background:#1a3a2a;border-radius:32px;padding:24px;width:300px;text-align:center;border:1px solid #F2C94C;">
                <div style="color:#FFD966;font-size:1.2rem;margin-bottom:16px;">登录芦苇音乐</div>
                <input type="email" id="loginEmail" placeholder="邮箱" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:white;">
                <input type="password" id="loginPassword" placeholder="密码" style="width:100%;padding:10px;margin-bottom:12px;border-radius:40px;border:none;background:#2a4a3a;color:white;">
                <button id="doLoginBtn" style="background:#E69A2E;border:none;padding:10px;border-radius:40px;width:100%;margin-bottom:8px;font-weight:bold;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='#FFD966'" onmouseout="this.style.background='#E69A2E'">登录</button>
                <button id="doRegisterBtn" style="background:#3C6E4A;border:none;padding:10px;border-radius:40px;width:100%;margin-bottom:8px;color:white;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='#E69A2E';this.style.color='#2D1E0C'" onmouseout="this.style.background='#3C6E4A';this.style.color='white'">注册</button>
                <button id="closeModalBtn" style="background:none;border:none;color:#AAD4B0;cursor:pointer;transition:0.2s;padding:8px;" onmouseover="this.style.color='#FFD966'" onmouseout="this.style.color='#AAD4B0'">取消</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('doLoginBtn').onclick = async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // ✅ 空值校验
        if (!email || !password) {
            alert('请先填写邮箱和密码！');
            return;
        }
        
        if (!window.API || !window.API.initSupabase) {
            alert('API 未加载');
            return;
        }
        const sb = await window.API.initSupabase();
        if (!sb) { alert('初始化失败'); return; }
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            localStorage.setItem('currentUser', JSON.stringify({
                user_id: data.user.id,
                email: data.user.email,
                nickname: data.user.email.split('@')[0]
            }));
            document.getElementById('loginModal').remove();
            window.location.reload();
        }
    };

    document.getElementById('doRegisterBtn').onclick = async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // ✅ 空值校验
        if (!email || !password) {
            alert('请先填写邮箱和密码再注册！');
            return;
        }
        
        if (!window.API || !window.API.initSupabase) {
            alert('API 未加载');
            return;
        }
        const sb = await window.API.initSupabase();
        if (!sb) { alert('初始化失败'); return; }
        const { error } = await sb.auth.signUp({ email, password });
        if (error) {
            alert(error.message);
        } else {
            alert('注册成功！请直接登录');
            document.getElementById('loginModal').remove();
        }
    };

    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('loginModal').remove();
    };
}

// ==================== 暴露到全局 ====================

window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.showLoginModal = showLoginModal;
