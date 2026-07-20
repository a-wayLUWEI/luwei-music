/**
 * 芦苇音乐 · 图片加载管理器
 * 功能：懒加载 + 预加载 + 缓存控制 + 加载状态
 */
(function() {
    'use strict';

    // ===== 配置 =====
    const CONFIG = {
        lazyRootMargin: '200px',      // 提前200px开始加载
        preloadCount: 3,              // 预加载下一批图片数量
        retryLimit: 2,               // 加载失败重试次数
        timeout: 10000,              // 单张图片超时时间(ms)
        debug: false                 // 是否开启调试日志
    };

    // ===== 状态 =====
    let observer = null;
    let loadingQueue = [];
    let loadedCount = 0;
    let failedCount = 0;
    let isInitialized = false;

    // ===== 日志 =====
    function log(msg, type) {
        if (!CONFIG.debug) return;
        const prefix = ' [ImageLoader]';
        if (type === 'error') console.error(prefix, msg);
        else if (type === 'warn') console.warn(prefix, msg);
        else console.log(prefix, msg);
    }

    // ===== 加载单张图片 =====
    function loadImage(img, retryCount) {
        retryCount = retryCount || 0;
        const src = img.dataset.src || img.getAttribute('data-src');
        if (!src) return Promise.reject(new Error('No src'));

        // 如果已经加载成功，直接返回
        if (img.dataset.loaded === 'true') {
            return Promise.resolve(img);
        }

        return new Promise(function(resolve, reject) {
            const timer = setTimeout(function() {
                reject(new Error('Timeout'));
            }, CONFIG.timeout);

            const tempImg = new Image();
            tempImg.onload = function() {
                clearTimeout(timer);
                img.src = src;
                img.dataset.loaded = 'true';
                img.classList.remove('lazy');
                img.classList.add('loaded');
                loadedCount++;
                log('✅ 加载成功: ' + src);
                resolve(img);
            };
            tempImg.onerror = function() {
                clearTimeout(timer);
                if (retryCount < CONFIG.retryLimit) {
                    log(' 重试 (' + (retryCount + 1) + '/' + CONFIG.retryLimit + '): ' + src);
                    setTimeout(function() {
                        loadImage(img, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000 * (retryCount + 1));
                } else {
                    img.classList.add('error');
                    failedCount++;
                    log('❌ 加载失败: ' + src, 'error');
                    reject(new Error('Failed after retries'));
                }
            };
            tempImg.src = src;
        });
    }

    // ===== 加载一批图片 =====
    function loadBatch(images) {
        const promises = images.map(function(img) {
            return loadImage(img).catch(function() {
                // 失败不中断其他图片
                return null;
            });
        });
        return Promise.all(promises);
    }

    // ===== 可见性检测 =====
    function isVisible(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        return rect.top < windowHeight + 200 && rect.bottom > -200 && rect.left < windowWidth + 200 && rect.right > -200;
    }

    // ===== 初始化懒加载 =====
    function initLazyLoading() {
        if (isInitialized) return;
        isInitialized = true;

        const lazyImages = document.querySelectorAll('img.lazy, img[data-src]');
        log(' 发现 ' + lazyImages.length + ' 张懒加载图片');

        if (lazyImages.length === 0) {
            log('ℹ️ 没有需要懒加载的图片');
            return;
        }

        // 浏览器支持 IntersectionObserver
        if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window) {
            observer = new IntersectionObserver(function(entries) {
                const toLoad = [];
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src || img.getAttribute('data-src');
                        if (src && img.dataset.loaded !== 'true') {
                            toLoad.push(img);
                        }
                        observer.unobserve(img);
                    }
                });
                if (toLoad.length > 0) {
                    loadBatch(toLoad);
                }
            }, {
                rootMargin: CONFIG.lazyRootMargin,
                threshold: 0.01
            });

            lazyImages.forEach(function(img) {
                observer.observe(img);
            });
        } else {
            // 降级方案：直接加载所有可见图片
            log('⚠️ 降级方案：直接加载可见图片', 'warn');
            const toLoad = [];
            lazyImages.forEach(function(img) {
                const src = img.dataset.src || img.getAttribute('data-src');
                if (src && isVisible(img) && img.dataset.loaded !== 'true') {
                    toLoad.push(img);
                }
            });
            if (toLoad.length > 0) {
                loadBatch(toLoad);
            }
        }

        // 页面加载完成后，加载所有已可见但未加载的图片
        window.addEventListener('load', function() {
            log(' 页面完全加载，检查未加载图片');
            const remaining = document.querySelectorAll('img.lazy:not([data-loaded="true"]), img[data-src]:not([data-loaded="true"])');
            if (remaining.length > 0) {
                const visibleRemaining = [];
                remaining.forEach(function(img) {
                    if (isVisible(img)) {
                        visibleRemaining.push(img);
                    }
                });
                if (visibleRemaining.length > 0) {
                    loadBatch(visibleRemaining);
                }
            }
        });
    }

    // ===== 预加载下一批图片（用于翻页/滚动） =====
    function preloadNextBatch(container) {
        if (!container) container = document;
        const images = container.querySelectorAll('img.lazy:not([data-loaded="true"]), img[data-src]:not([data-loaded="true"])');
        if (images.length === 0) return;

        // 找出最接近可视区域的几张图
        let candidates = [];
        images.forEach(function(img) {
            const rect = img.getBoundingClientRect();
            const dist = Math.min(
                Math.abs(rect.top),
                Math.abs(rect.bottom - window.innerHeight)
            );
            candidates.push({ img: img, dist: dist });
        });

        candidates.sort(function(a, b) { return a.dist - b.dist; });
        const toLoad = candidates.slice(0, CONFIG.preloadCount).map(function(item) { return item.img; });
        if (toLoad.length > 0) {
            log('⏩ 预加载 ' + toLoad.length + ' 张图片');
            loadBatch(toLoad);
        }
    }

    // ===== 手动加载所有图片 =====
    function loadAll() {
        log(' 强制加载所有图片');
        const all = document.querySelectorAll('img.lazy:not([data-loaded="true"]), img[data-src]:not([data-loaded="true"])');
        if (all.length > 0) {
            loadBatch(Array.from(all));
        }
    }

    // ===== 获取加载统计 =====
    function getStats() {
        return {
            loaded: loadedCount,
            failed: failedCount,
            total: loadedCount + failedCount + document.querySelectorAll('img.lazy, img[data-src]').length
        };
    }

    // ===== 暴露 API =====
    window.ImageLoader = {
        init: initLazyLoading,
        preload: preloadNextBatch,
        loadAll: loadAll,
        getStats: getStats,
        config: CONFIG
    };

    // ===== 自动初始化 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    } else {
        initLazyLoading();
    }

    // ===== 滚动预加载 =====
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function() {
            preloadNextBatch();
            scrollTimer = null;
        }, 300);
    }, { passive: true });

    // ===== resize 重新检查 =====
    let resizeTimer = null;
    window.addEventListener('resize', function() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function() {
            preloadNextBatch();
            resizeTimer = null;
        }, 500);
    }, { passive: true });

    log(' 图片加载管理器已启动 (v1.0)');
})();
