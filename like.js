// like.js - 点赞功能独立模块
const SUPABASE_URL = 'https://alzbseigpxxtlqqseczx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemJzZWlncHh4dGxxcXNlY3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTUyNzEsImV4cCI6MjA5NTM5MTI3MX0.4jpb-o-dnoqzLli9o1rDA-vcThWZWR7vmAxjzZkIdJ4';

const Like = {
    // 检查当前用户是否已点赞
    async check(songId) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!user.user_id || !songId) return false;
        try {
            const resp = await fetch(
                `${SUPABASE_URL}/rest/v1/likes?user_id=eq.${user.user_id}&work_id=eq.${songId}`,
                { headers: { 'apikey': SUPABASE_KEY } }
            );
            const data = await resp.json();
            return data && data.length > 0;
        } catch (e) {
            console.warn('检查点赞状态失败:', e);
            return false;
        }
    },

    // 获取歌曲点赞总数
    async count(songId) {
        try {
            const resp = await fetch(
                `${SUPABASE_URL}/rest/v1/works?id=eq.${songId}&select=likes`,
                { headers: { 'apikey': SUPABASE_KEY } }
            );
            const data = await resp.json();
            return data[0]?.likes || 0;
        } catch (e) {
            console.warn('获取点赞数失败:', e);
            return 0;
        }
    },

    // 切换点赞状态
    async toggle(songId) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!user.user_id) {
            alert('请先登录再点赞');
            return { liked: false, count: 0 };
        }
        if (!songId) return { liked: false, count: 0 };

        const currentlyLiked = await this.check(songId);
        const currentCount = await this.count(songId);

        if (currentlyLiked) {
            // 取消点赞
            await fetch(`${SUPABASE_URL}/rest/v1/likes?user_id=eq.${user.user_id}&work_id=eq.${songId}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_KEY }
            });
            const newCount = Math.max(0, currentCount - 1);
            await fetch(`${SUPABASE_URL}/rest/v1/works?id=eq.${songId}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: newCount })
            });
            return { liked: false, count: newCount };
        } else {
            // 添加点赞
            await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
                method: 'POST',
                headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    work_id: songId
                })
            });
            const newCount = currentCount + 1;
            await fetch(`${SUPABASE_URL}/rest/v1/works?id=eq.${songId}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: newCount })
            });
            return { liked: true, count: newCount };
        }
    },

    // 更新UI显示
    render(btnId, countId, liked, count) {
        const btn = document.getElementById(btnId);
        const countEl = document.getElementById(countId);
        if (btn) {
            btn.textContent = liked ? '♥' : '♡';
            // 已点赞时给按钮加个红色类
            btn.style.color = liked ? '#e88a8a' : '#1a1a2e';
        }
        if (countEl) {
            countEl.textContent = count;
        }
    }
};
