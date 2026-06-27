// follow.js - 关注功能独立模块

const Follow = {
    // 检查当前用户是否已关注
    async check(followingId) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!user.user_id || !followingId) return false;
        try {
            const resp = await fetch(
                `${SUPABASE_URL}/rest/v1/follows?follower_id=eq.${user.user_id}&following_id=eq.${followingId}`,
                { headers: { 'apikey': SUPABASE_KEY } }
            );
            const data = await resp.json();
            return data && data.length > 0;
        } catch (e) {
            console.warn('检查关注状态失败:', e);
            return false;
        }
    },

    // 获取关注者总数
    async count(followingId) {
        try {
            const resp = await fetch(
                `${SUPABASE_URL}/rest/v1/musicians?id=eq.${followingId}&select=followers_count`,
                { headers: { 'apikey': SUPABASE_KEY } }
            );
            const data = await resp.json();
            return data[0]?.followers_count || 0;
        } catch (e) {
            console.warn('获取粉丝数失败:', e);
            return 0;
        }
    },

    // 切换关注状态
    async toggle(followingId) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!user.user_id) {
            alert('请先登录再关注');
            return { followed: false, count: 0 };
        }
        if (!followingId) return { followed: false, count: 0 };

        const currentlyFollowed = await this.check(followingId);

        if (currentlyFollowed) {
            // ===== 取消关注 =====
            await fetch(`${SUPABASE_URL}/rest/v1/follows?follower_id=eq.${user.user_id}&following_id=eq.${followingId}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_KEY }
            });
            const currentCount = await this.count(followingId);
            const newCount = Math.max(0, currentCount - 1);
            await fetch(`${SUPABASE_URL}/rest/v1/musicians?id=eq.${followingId}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ followers_count: newCount })
            });
        } else {
            // ===== 关注 =====
            let success = false;
            try {
                const resp = await fetch(`${SUPABASE_URL}/rest/v1/follows`, {
                    method: 'POST',
                    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        follower_id: user.user_id,
                        following_id: followingId
                    })
                });
                if (resp.ok) {
                    success = true;
                } else if (resp.status === 409) {
                    // 重复关注，静默忽略
                    console.log('已关注');
                } else {
                    console.warn('关注失败:', await resp.text());
                }
            } catch (e) {
                console.warn('关注请求失败:', e);
            }

            // 只有真正成功时才增加粉丝数
            if (success) {
                const currentCount = await this.count(followingId);
                const newCount = currentCount + 1;
                await fetch(`${SUPABASE_URL}/rest/v1/musicians?id=eq.${followingId}`, {
                    method: 'PATCH',
                    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ followers_count: newCount })
                });
            }
        }

        // 重新获取最新状态
        const followedNow = await this.check(followingId);
        const countNow = await this.count(followingId);
        return { followed: followedNow, count: countNow };
    },

    // 更新UI显示
    render: function(btnId, countId, followed, count) {
        const btn = document.getElementById(btnId);
        const countEl = document.getElementById(countId);
        if (btn) {
            btn.textContent = followed ? '❤️ 已关注' : '🤍 关注';
            btn.style.color = followed ? '#e88a8a' : 'rgba(255,255,255,0.3)';
        }
        if (countEl) {
            countEl.textContent = count;
        }
    }
};
