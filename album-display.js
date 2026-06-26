// album-display.js - 专辑分组渲染模块

// ===== 获取歌手的专辑和歌曲 =====
async function fetchArtistAlbums(artistId) {
    try {
        // 1. 获取专辑列表
        const albumResp = await fetch(
            `${SUPABASE_URL}/rest/v1/albums?musician_id=eq.${artistId}&order=created_at.desc`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        const albums = await albumResp.json();

        // 2. 获取歌曲列表
        const songResp = await fetch(
            `${SUPABASE_URL}/rest/v1/works?musician_id=eq.${artistId}&status=eq.approved&order=created_at.desc`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        const allSongs = await songResp.json();

        // 3. 按专辑分组
        var grouped = {};
        albums.forEach(function(a) {
            grouped[a.id] = { album: a, songs: [] };
        });
        grouped['singles'] = {
            album: { id: 'singles', title: '单曲', cover_url: null },
            songs: []
        };

        allSongs.forEach(function(s) {
            var key = s.album_id || 'singles';
            if (grouped[key]) {
                grouped[key].songs.push(s);
            } else {
                grouped['singles'].songs.push(s);
            }
        });

        return grouped;
    } catch (e) {
        console.error('加载专辑失败:', e);
        return { singles: { album: { id: 'singles', title: '单曲' }, songs: [] } };
    }
}

// ===== 渲染专辑分组 HTML =====
function renderAlbumsHTML(grouped) {
    var html = '';
    var keys = Object.keys(grouped);

    for (var k = 0; k < keys.length; k++) {
        var group = grouped[keys[k]];
        if (group.songs.length === 0) continue;
        var album = group.album;
        html += '<div style="margin-bottom:20px;">';
        html += '<div style="display:flex; align-items:center; gap:12px; margin-bottom:8px; cursor:pointer; color:rgba(255,255,255,0.5); font-size:0.85rem;" onclick="toggleAlbum(\'' + album.id + '\')">';
        // 封面图片或占位符
        html += '<div style="width:40px; height:40px; border-radius:6px; background:linear-gradient(135deg, rgba(212,184,150,0.2), rgba(184,160,200,0.2)); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; overflow:hidden;">';
        if (album.cover_url && album.cover_url.startsWith('http')) {
            html += '<img src="' + album.cover_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">';
        } else {
            html += '📀';
        }
        html += '</div>';
        html += '<span style="color:rgba(255,255,255,0.6);">' + album.title + '</span>';
        html += '<span style="color:rgba(255,255,255,0.15); font-size:0.6rem;">' + group.songs.length + '首</span>';
        html += '</div>';
        html += '<div class="album-songs" id="album-' + album.id + '" style="padding-left:12px;">';

        for (var i = 0; i < group.songs.length; i++) {
            var s = group.songs[i];
            html += '<div class="song-item" onclick="openPlayer(\'' + s.id + '\')" style="cursor:pointer; padding:8px 12px; border-radius:6px; margin-bottom:2px; display:flex; align-items:center; gap:12px; transition:0.2s;">';
            html += '<span style="color:rgba(255,255,255,0.12); font-size:0.65rem; width:20px; text-align:center;">' + String(i+1).padStart(2,'0') + '</span>';
            html += '<span class="title" style="font-size:0.85rem; font-weight:600;">' + (s.title || '未命名') + '</span>';
            html += '<span class="likes" style="margin-left:auto; font-size:0.8rem; align-self:center;"><span class="heart-gradient">♥</span> ' + (s.likes || 0) + '</span>';
            html += '<span style="color:rgba(255,255,255,0.15); font-size:0.7rem;">▶ ' + (s.plays || 0) + '</span>';
            html += '</div>';
        }

        html += '</div></div>';
    }

    return html || '<div class="empty">暂无已审核的歌曲</div>';
}

// ===== 折叠/展开专辑 =====
function toggleAlbum(albumId) {
    var el = document.getElementById('album-' + albumId);
    if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
}
