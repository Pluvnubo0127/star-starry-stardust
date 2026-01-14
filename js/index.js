//鼠标特效
const imgUrl = './res/wave.png';
let isAnimating = false;
window.isCollisionDisabled = false;
let hidingBlock = false;

// 交互变量
let chooseStar = 0;
let SeeText1 = 0, SeeText2 = 0, SeeText3 = 0, SeeText4 = 0, SeeText5 = 0, SeeText6 = 0, SeeText7 = 0;

function createClickEffect(e) {
    const bgCanvas = document.getElementById('bgCanvas');
    if (!bgCanvas) return;

    const canvasRect = bgCanvas.getBoundingClientRect();

    // 检查鼠标点击是否在 bgCanvas 范围内
    if (
        e.clientX < canvasRect.left ||
        e.clientX > canvasRect.right ||
        e.clientY < canvasRect.top ||
        e.clientY > canvasRect.bottom
    ) {
        return;
    }

    // 检查点击目标是否属于 UI 或 bUI 组
    // 如果点击在这些 UI 层的画布上，则不触发鼠标特效（包括透明正方形、音效和波纹）
    if (e.target.tagName === 'CANVAS' && (e.target.closest('#UI') || e.target.closest('#bUI')|| e.target.closest('#item')|| e.target.closest('#itemlist'))) {
        return;
    }

    if (isAnimating) return;
    isAnimating = true;

    // 获取 wave 画布（使用 querySelector 确保选中 canvas 元素）
    const waveCanvas = document.querySelector('canvas#wave');
    const container = document.getElementById('canvas-container');
    
    if (waveCanvas && container) {
        // 点击时显示 wave 画布
        waveCanvas.style.display = 'block';

        const ctx = waveCanvas.getContext('2d');
        const containerRect = container.getBoundingClientRect();
        
        // 计算点击位置相对于容器的坐标
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        
        // 将 wave 画布移动到点击位置（中心对齐）
        // 画布尺寸为 130x130，所以偏移量为 65
        waveCanvas.style.left = `${x - 65}px`;
        waveCanvas.style.top = `${y - 65}px`;
        
        // 在画布上生成一个透明正方形
        // 使用 'rgba(255, 255, 255, 0)'使其不可见
        ctx.clearRect(0, 0, 130, 130);
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, 130, 130);

        // --- 碰撞检测逻辑 ---
        // 检查是否处于开始界面 (Opening)
        // 如果 Opening 组下的任意画布可见 (display: block)，则禁用碰撞检测
        let isOpeningActive = false;
        const openingGroup = document.getElementById('Opening');
        if (openingGroup) {
            const openingCanvases = openingGroup.querySelectorAll('canvas');
            for (let i = 0; i < openingCanvases.length; i++) {
                const canvas = openingCanvases[i];
                // 获取计算后的样式，因为样式可能在 CSS 类中定义
                const style = window.getComputedStyle(canvas);
                if (style.display === 'block') {
                    isOpeningActive = true;
                    break;
                }
            }
        }

        if (!window.isCollisionDisabled && !isOpeningActive) {
            // 获取所有星星画布
            const stars = document.querySelectorAll('.star-canvas');
            const waveRect = {
                x: x - 65,
                y: y - 65,
                w: 130,
                h: 130
            };

            stars.forEach(star => {
                // 获取星星相对于容器的位置和尺寸
                // 由于 css 中定义了 left 和 top，我们可以直接获取
                const starRect = {
                    x: parseFloat(star.style.left) || star.offsetLeft,
                    y: parseFloat(star.style.top) || star.offsetTop,
                    w: star.width,
                    h: star.height
                };

                // 矩形碰撞检测 (AABB)
                if (
                    waveRect.x < starRect.x + starRect.w &&
                    waveRect.x + waveRect.w > starRect.x &&
                    waveRect.y < starRect.y + starRect.h &&
                    waveRect.y + waveRect.h > starRect.y
                ) {
                    // 仅在星星未被点亮（islighted 为 false）时触发点亮逻辑
                    if (star.islighted === false) {
                        // 标记为已被点亮
                        star.islighted = true;
                        
                        // 清除可能存在的退场动画类（虽然初始状态理论上没有）
                        star.classList.remove('anim-removing');
                        
                        // 触发渐变显示
                        star.style.opacity = '1';
                        
                        // 当透明度渐变完成后（由 CSS transition 控制），添加 clickable 类
                        const handleTransitionEnd = () => {
                            star.classList.add('clickable');
                            star.removeEventListener('transitionend', handleTransitionEnd);
                        };
                        star.addEventListener('transitionend', handleTransitionEnd);
                    }
                }
            });
        }

        // 碰撞检测结束后，隐藏 wave 画布
        waveCanvas.style.display = 'none';
    }

    // 播放点击音效
    // 通过 .play() 方法触发音频播放。
    // 由于 isAnimating 变量的限制，该音效在当前动画未结束前不会被再次触发。
    dropSound.play();

    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.backgroundImage = `url('${imgUrl}')`;
    effect.style.left = `${e.pageX}px`;
    effect.style.top = `${e.pageY}px`;
    document.body.appendChild(effect);
    effect.addEventListener('animationend', function () {
        effect.remove();
        isAnimating = false;

        // 动画播放完毕后，将透明正方形变为不可用状态（清空画布）
        if (waveCanvas) {
            const ctx = waveCanvas.getContext('2d');
            ctx.clearRect(0, 0, 136, 136);
        }
    });
}
document.addEventListener('click', createClickEffect);



/**
 * --- 公共状态切换函数 ---
 */
function canST() {
    const textBefore = document.getElementById('textBefore');
    const hiding = document.getElementById('hiding');
    const back0 = document.getElementById('back0');

    if (textBefore) {
        textBefore.style.display = 'block';
        void textBefore.offsetWidth;
        textBefore.style.opacity = '0.3';

        const onFadeInEnd = (e) => {
            if (e.propertyName === 'opacity') {
                textBefore.removeEventListener('transitionend', onFadeInEnd);
                textBefore.style.animation = 'fadeout 1s linear infinite alternate';
            }
        };
        textBefore.addEventListener('transitionend', onFadeInEnd);
    }

    if (hiding) {
        if (!hidingBlock) {
            hiding.style.display = 'block';
            void hiding.offsetWidth;
            hiding.classList.add('anim-fade-in-next0');
            hiding.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeInNext0') {
                    hiding.style.opacity = '1';
                    hiding.classList.remove('anim-fade-in-next0');
                }
            }, { once: true });
            hidingBlock = true;
        } else {
            hiding.style.display = 'block';
            hiding.style.opacity = '1';
        }
    }

    if(back0){
        back0.style.display = 'block';
        void back0.offsetWidth;
        back0.classList.add('anim-fade-in-next0');
        back0.addEventListener('animationend', (e) => {
            if (e.animationName === 'fadeInNext0') {
                back0.style.opacity = '1';
                back0.classList.remove('anim-fade-in-next0');
            }
        }, { once: true });
    }

    if (textBefore) {
        textBefore.onclick = clickTB;
    }
}

// 将变量暴露到 window 对象，以便跨脚本访问
window.chooseStar = chooseStar;
window.SeeText1 = SeeText1;
window.SeeText2 = SeeText2;
window.SeeText3 = SeeText3;
window.SeeText4 = SeeText4;
window.SeeText5 = SeeText5;
window.SeeText6 = SeeText6;
window.SeeText7 = SeeText7;

function clickTB() {
    if (typeof window.clickTB === 'function') {
        window.clickTB();
    }
}

/**
 * --- 星星点击事件管理 ---
 */
const starActions = {
    'star-1': () => {
        window.chooseStar = 1;
        window.isCollisionDisabled = true;
        const s1l = document.getElementById('s1l');

        if (s1l) {
            s1l.style.display = 'block';
            s1l.classList.remove('anim-lighted');
            void s1l.offsetWidth;
            s1l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s1l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s1l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-2': () => {
        window.chooseStar = 2;
        window.isCollisionDisabled = true;
        const s2l = document.getElementById('s2l');

        if (s2l) {
            s2l.style.display = 'block';
            s2l.classList.remove('anim-lighted');
            void s2l.offsetWidth;
            s2l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s2l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s2l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-3': () => {
        window.chooseStar = 3;
        window.isCollisionDisabled = true;
        const s3l = document.getElementById('s3l');

        if (s3l) {
            s3l.style.display = 'block';
            s3l.classList.remove('anim-lighted');
            void s3l.offsetWidth;
            s3l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s3l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s3l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-4': () => {
        window.chooseStar = 4;
        window.isCollisionDisabled = true;
        const s4l = document.getElementById('s4l');

        if (s4l) {
            s4l.style.display = 'block';
            s4l.classList.remove('anim-lighted');
            void s4l.offsetWidth;
            s4l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s4l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s4l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-5': () => {
        window.chooseStar = 5;
        window.isCollisionDisabled = true;
        const s5l = document.getElementById('s5l');

        if (s5l) {
            s5l.style.display = 'block';
            s5l.classList.remove('anim-lighted');
            void s5l.offsetWidth;
            s5l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s5l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s5l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-6': () => {
        window.chooseStar = 6;
        window.isCollisionDisabled = true;
        const s6l = document.getElementById('s6l');

        if (s6l) {
            s6l.style.display = 'block';
            s6l.classList.remove('anim-lighted');
            void s6l.offsetWidth;
            s6l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s6l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s6l.addEventListener('animationend', onLightedEnd);
        }
    },
    'star-7': () => {
        window.chooseStar = 7;
        window.isCollisionDisabled = true;
        const s7l = document.getElementById('s7l');

        if (s7l) {
            s7l.style.display = 'block';
            s7l.classList.remove('anim-lighted');
            void s7l.offsetWidth;
            s7l.classList.add('anim-lighted');

            // 监听背景亮起动画结束
            const onLightedEnd = (e) => {
                if (e.animationName === 'lighted') {
                    s7l.removeEventListener('animationend', onLightedEnd);
                    // 背景动画播放完毕后，执行公共状态切换
                    canST();
                }
            };
            s7l.addEventListener('animationend', onLightedEnd);
        }
    }
};

function initStarListeners() {
    const stars = document.querySelectorAll('.star-canvas');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            // 如果星星是可点击状态（碰撞后 opacity=1）
            if (star.classList.contains('clickable')) {
                // 阻止冒泡，防止触发全局的背景点击波纹特效
                e.stopPropagation();
                
                // 共同事件：播放 walkingSound
                // 检查是否正在播放，如果没在播放则触发
                if (!walkingSound.playing()) {
                    walkingSound.play();
                }

                // 共同事件：动画序列
                // 先移除可能存在的动画类
                star.classList.remove('anim-zoom-fade-out', 'anim-fade-in-next');
                
                // 强制重绘以确保动画可以重新触发
                void star.offsetWidth;

                // 播放 zoomFadeOut 动画
                star.classList.add('anim-zoom-fade-out');
                star.classList.remove('clickable');
                // 监听动画结束事件
                const onZoomFadeOutEnd = (e) => {
                    if (e.animationName === 'zoomFadeOut') {
                        star.removeEventListener('animationend', onZoomFadeOutEnd);
                        
                        // 1. 暂时禁用 transition，防止闪烁
                        star.style.transition = 'none';
                        
                        // 2. 锁定最终状态（透明度 0，缩放 2.5 对应 zoomFadeOut 的 100% 关键帧）
                        star.style.opacity = '0';
                        star.style.transform = 'scale(2.5)';
                        
                        // 3. 强制重绘
                        void star.offsetWidth;
                        
                        // 4. 移除动画类
                        star.classList.remove('anim-zoom-fade-out');
                        
                        // 5. 恢复 transition
                        requestAnimationFrame(() => {
                            star.style.transition = '';
                        });
                    }
                };
                star.addEventListener('animationend', onZoomFadeOutEnd);
                
                // 3. 共同事件：其他已激活星星播放退场动画
                const allStars = document.querySelectorAll('.star-canvas');
                allStars.forEach(otherStar => {
                    // 仅针对非被点击的、已被点亮（islighted 为 true）且当前可见（opacity 为 1）的星星
                    if (otherStar !== star && otherStar.islighted === true && otherStar.style.opacity === '1') {
                        // 暂时移除点击事件类
                        otherStar.classList.remove('clickable');
                        
                        // 清理动画类并重置 opacity 状态，以便 animation-fill-mode: forwards 生效
                        otherStar.classList.remove('anim-zoom-fade-out', 'anim-fade-in-next', 'anim-removing');
                        // 强制将 style.opacity 设为空，让 CSS keyframes 接管控制
                        otherStar.style.opacity = ''; 
                        
                        void otherStar.offsetWidth; // 强制重绘

                        // 播放 removing 动画
                        otherStar.classList.add('anim-removing');
                        
                        // 动画结束后清理
                        const onRemovingEnd = (e) => {
                            if (e.animationName === 'removing') {
                                otherStar.removeEventListener('animationend', onRemovingEnd);
                                
                                // 1. 暂时禁用 transition，防止在移除动画类时触发回到初始状态的过渡
                                otherStar.style.transition = 'none';
                                
                                // 2. 立即锁定动画的最终状态（透明度 0 和 缩放 0.5）
                                otherStar.style.opacity = '0';
                                otherStar.style.transform = 'scale(0.5)';
                                
                                // 3. 强制触发重绘，确保上述样式立即生效
                                void otherStar.offsetWidth;
                                
                                // 4. 移除动画类
                                otherStar.classList.remove('anim-removing');
                                
                                // 5. 恢复 CSS 中的 transition 设置
                                requestAnimationFrame(() => {
                                    otherStar.style.transition = '';
                                });
                            }
                        };
                        otherStar.addEventListener('animationend', onRemovingEnd);
                    }
                });
                
                const action = starActions[star.id];
                if (typeof action === 'function') {
                    action();
                }
            }
        });
    });
}
//返回键0
var back0Canvas = document.getElementById('back0');

//画布
function drawEverything(){
    var bgCanvas = document.getElementById("bgCanvas");
    if(!bgCanvas.getContext) return;
    var bgUrl = './res/bg0.png';
    loadBgImg(bgUrl,bgCanvas);

    // 绘制星空背景
    if (typeof drawStarskyBG === 'function') {
        drawStarskyBG();
    }

    // 初始隐藏 wave 画布
    const initialWaveCanvas = document.querySelector('canvas#wave');
    if (initialWaveCanvas) {
        initialWaveCanvas.style.display = 'none';
    }
}

window.onload = function() {
    drawEverything();
    if (typeof drawMoon === 'function') {
        drawMoon();
    }
    if (typeof drawStars === 'function') {
        drawStars();
    }
    if (typeof drawBlights === 'function') {
        drawBlights();
    }
    if (typeof loadUI === 'function') {
        loadUI();
    }
    if (typeof loadBUI === 'function') {
        loadBUI();
    }
    if (typeof drawTextBefore === 'function') {
        drawTextBefore();
    }
    // 初始化星星点击监听
    initStarListeners();
    // 初始化返回键监听
    initBackListeners();
};
/**
 * --- 返回键事件管理 ---
 */
function initBackListeners() {
    const back0 = document.getElementById('back0');
    if (!back0) return;

    let isBackProcessing = false;

    back0.addEventListener('click', (e) => {
        if (isBackProcessing) return;
        isBackProcessing = true;

        // 阻止冒泡
        e.stopPropagation();

        // 重置星星选择
        window.chooseStar = 0;

        // 播放 walkingSound
        if (!walkingSound.playing()) {
            walkingSound.play();
        }

        // 用于追踪所有退出动画的完成情况
        const animationPromises = [];

        // 1. 返回键0动画：过渡到scale(0)
        back0.classList.remove('anim-scale-0');
        void back0.offsetWidth;
        back0.classList.add('anim-scale-0');
        const back0Promise = new Promise(resolve => {
            const onEnd = (e) => {
                if (!e || e.animationName === 'scale0') {
                    back0.removeEventListener('animationend', onEnd);
                    back0.style.display = 'none';
                    back0.classList.remove('anim-scale-0');
                    resolve();
                }
            };
            back0.addEventListener('animationend', onEnd);
            // 超时保护
            setTimeout(() => onEnd(), 600);
        });
        animationPromises.push(back0Promise);

        // 2. textBefore 同步播放 .anim-removing 动画
        const textBefore = document.getElementById('textBefore');
        if (textBefore && textBefore.style.display !== 'none') {
            // 停止之前的闪烁动画
            textBefore.style.animation = '';
            textBefore.classList.remove('anim-removing');
            void textBefore.offsetWidth;
            textBefore.classList.add('anim-removing');

            const textPromise = new Promise(resolve => {
                const onEnd = (e) => {
                    if (!e || e.animationName === 'removing') {
                        textBefore.removeEventListener('animationend', onEnd);
                        // 切换回opacity=0，display=none的状态
                        textBefore.style.display = 'none';
                        textBefore.style.opacity = '0';
                        textBefore.classList.remove('anim-removing');
                        resolve();
                    }
                };
                textBefore.addEventListener('animationend', onEnd);
                // 超时保护
                setTimeout(() => onEnd(), 900);
            });
            animationPromises.push(textPromise);
        }

        // 3. slight 同步播放 .anim-leave-lighting 动画
        const bgCanvases = ['s1l', 's2l', 's3l', 's4l', 's5l', 's6l', 's7l'];
        bgCanvases.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && canvas.style.display === 'block') {
                canvas.classList.remove('anim-lighted', 'anim-leave-lighting');
                void canvas.offsetWidth;
                canvas.classList.add('anim-leave-lighting');

                const slightPromise = new Promise(resolve => {
                    const onEnd = (e) => {
                        if (!e || e.animationName === 'leaveLighting') {
                            canvas.removeEventListener('animationend', onEnd);
                            // 过渡回初始的opacity=0以及display=none的状态
                            canvas.style.display = 'none';
                            canvas.style.opacity = '0';
                            canvas.classList.remove('anim-leave-lighting');
                            resolve();
                        }
                    };
                    canvas.addEventListener('animationend', onEnd);
                    // 超时保护
                    setTimeout(() => onEnd(), 1800);
                });
                animationPromises.push(slightPromise);
            }
        });

        // 4. 等待以上所有退出动画结束后，再重新激活点亮过的星星
        Promise.all(animationPromises).then(() => {
            const stars = document.querySelectorAll('.star-canvas');
            stars.forEach(star => {
                if (star.islighted === true) {
                    // 重置 transform
                    star.style.transform = '';
                    // 切换回opacity=1之前，确保它是0以便播放渐入动画
                    star.style.opacity = '0';
                    
                    star.classList.remove('anim-removing', 'anim-zoom-fade-out', 'anim-fade-in-next');
                    void star.offsetWidth;
                    star.classList.add('anim-fade-in-next');

                    const onStarEnd = (e) => {
                        if (!e || e.animationName === 'fadeInNext') {
                            star.removeEventListener('animationend', onStarEnd);
                            // 切换回opacity=1
                            star.style.opacity = '1';
                            star.classList.remove('anim-fade-in-next');
                            // 重新启用点击事件
                            star.classList.add('clickable');
                        }
                    };
                    star.addEventListener('animationend', onStarEnd);
                    // 超时保护
                    setTimeout(() => onStarEnd(), 900);
                }
            });

            // 重置碰撞检测禁用状态
            window.isCollisionDisabled = false;
            
            isBackProcessing = false;
        });
    });
}

// 禁用滚动网页
window.addEventListener('scroll', function(e) {
    e.preventDefault();
    window.scrollTo(0, 0);
}, { passive: false });

// 禁用滚动条并固定画面尺寸
function disableScrollingAndFixSize() {
    document.body.style.overflow = 'hidden'; // 禁用滚动条
    document.documentElement.style.overflow = 'hidden'; // 禁用滚动条

    const width = window.innerWidth;
    const height = window.innerHeight;

    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
    document.documentElement.style.width = `${width}px`;
    document.documentElement.style.height = `${height}px`;
}

disableScrollingAndFixSize();

window.addEventListener('resize', disableScrollingAndFixSize);
