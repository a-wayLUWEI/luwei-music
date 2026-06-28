// ===== 全局音乐（所有小世界共享） =====

const SUPABASE_URL = 'https://alzbseigpxxtlqqseczx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemJzZWlncHh4dGxxcXNlY3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTUyNzEsImV4cCI6MjA5NTM5MTI3MX0.4jpb-o-dnoqzLli9o1rDA-vcThWZWR7vmAxjzZkIdJ4';

const ZHOUTIAN_ID = '1781898147879639';

// ===== 全局共享 audio =====
if (!window._sharedAudio) {
    window._sharedAudio = new Audio();
    window._sharedAudio._isPlaying = false;
    window._sharedAudio._currentIndex = 0;
    window._sharedAudio._songs = [];
}

const audio = window._sharedAudio;
let zhouTianSongs = audio._songs;
let currentSongIndex = audio._currentIndex;
let isMusicPlaying = audio._isPlaying;

// ===== 从 Supabase 拉取周田的歌曲 =====

async function loadZhouTianSongs() {
    if (zhouTianSongs.length > 0) {
        // 已有歌曲，恢复播放状态
        currentSongIndex = audio._currentIndex || 0;
        updateMusicUI();
        if (audio._isPlaying && audio.paused) {
            audio.play();
        }
        return;
    }
    try {
        const resp = await fetch(
            `${SUPABASE_URL}/rest/v1/works?musician_id=eq.${ZHOUTIAN_ID}&status=eq.approved&order=created_at.desc`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        const data = await resp.json();
        zhouTianSongs.length = 0;
        data.filter(s => s.audio_url).forEach(s => zhouTianSongs.push(s));
        audio._songs = zhouTianSongs;

        if (zhouTianSongs.length > 0 && !audio.src) {
            currentSongIndex = 0;
            audio._currentIndex = 0;
            playSong(0);
        } else if (zhouTianSongs.length > 0 && audio.src) {
            currentSongIndex = audio._currentIndex || 0;
            updateMusicUI();
            if (audio._isPlaying && audio.paused) {
                audio.play();
            }
        }
    } catch (e) {
        console.warn('加载周田歌曲失败:', e);
    }
}

function playSong(index) {
    if (zhouTianSongs.length === 0) return;
    currentSongIndex = index;
    audio._currentIndex = index;
    const song = zhouTianSongs[index];
    audio.src = song.audio_url;
    audio.play();
    isMusicPlaying = true;
    audio._isPlaying = true;
    updateMusicUI();
}

function nextSong() {
    if (zhouTianSongs.length === 0) return;
    let next;
    do {
        next = Math.floor(Math.random() * zhouTianSongs.length);
    } while (next === currentSongIndex && zhouTianSongs.length > 1);
    playSong(next);
}

function prevSong() {
    if (zhouTianSongs.length === 0) return;
    let prev;
    do {
        prev = Math.floor(Math.random() * zhouTianSongs.length);
    } while (prev === currentSongIndex && zhouTianSongs.length > 1);
    playSong(prev);
}

function toggleMusic() {
    if (zhouTianSongs.length === 0) return;
    if (isMusicPlaying) {
        audio.pause();
        isMusicPlaying = false;
        audio._isPlaying = false;
    } else {
        audio.play();
        isMusicPlaying = true;
        audio._isPlaying = true;
    }
    updateMusicUI();
}

function updateMusicUI() {
    const btn = document.getElementById('musicBtn');
    const label = document.getElementById('musicLabel');
    if (btn) {
        btn.textContent = isMusicPlaying ? '⏸' : '▶';
    }
    if (label && zhouTianSongs.length > 0) {
        const song = zhouTianSongs[currentSongIndex];
        label.textContent = isMusicPlaying ? `🎵 ${song.title}` : '⏸ 已暂停';
    }
}

audio.addEventListener('ended', function() {
    nextSong();
});

// ===== 页面加载时恢复状态 =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        loadZhouTianSongs();
        updateMusicUI();
    }, 200);
});