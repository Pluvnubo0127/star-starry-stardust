var bItemImage = new Image(); // 全局存储 bItem 背景图，方便重绘
var bTextImage = new Image(); // 全局存储 bText 背景图，方便重绘
var bchosenIndex = -1; // 当前选中的文本框索引 (0-6)，-1 表示未选中

// --- bText 分页与打字机相关状态 ---
let bFullText = "";
let bSections = []; // 存储按 \n\n 分割后的各段落
let bRevealedSectionsCount = 1; // 当前已显示的段落数量
let bLastRevealedSectionsCount = 1; // 上一次显示的段落数量，用于检测新段落解锁
let bRevealedKeywords = new Set(); // 已解锁（显色）的关键字
let bKeywordRegions = []; // 存储当前页面关键字的坐标区域 {keyword, x, y, w, h}
let bCurrentVisibleText = ""; // 当前已解锁并合并后的文本
let bCurrentTextIndex = 0;
let bPageHistory = [0];
let bCurrentPageIndex = 0;
let bIsTextFinished = false;
let bTypewriterTimer = null;
let bCurrentVisibleLength = 0; // 当前打字机显示的字符长度
let bMaxPlayedIndex = 0; // 记录已播放（或立即显示）过的全局最大文本索引
let bEighthClicked = false; // 记录第八个关键字是否被点击
// ------------------------------

// --- bItem 拖拽相关状态 ---
let bIsDragging = false;
let bDraggedIndex = -1;
let bDragProxy = null;
let bDragOffsetX = 0;
let bDragOffsetY = 0;
// ------------------------

// 文本框坐标及配置
const bItemPositions = [
    { x: 89, y: 29 },
    { x: 467, y: 29 },
    { x: 813, y: 29 },
    { x: 11, y: 107 },
    { x: 307, y: 107 },
    { x: 597, y: 107 },
    { x: 881, y: 107 }
];
const bItemBoxWidth = 258;
const bItemBoxHeight = 46;

// 关键字颜色映射 (对应 bItem 中的物品颜色)
const bKeywordColorMap = {
    '恒星': '#fdd6dc',
    '怀旧': '#fdeee9',
    '母星': '#ba98ff',
    '启程': '#a9ffe0',
    '意义': '#f8e474',
    '动摇': '#fc9f02',
    '传达': '#a5c0f7'
};

/**
 * 第八个关键字“幸福”点击后的处理函数
 */
function shiawase() {
    bEighthClicked = true;
    window.isFinish = true; 
    if (typeof startEndingBGM === 'function') startEndingBGM();
    if (typeof puttingSound !== 'undefined') puttingSound.play();
    
    showFinishTips();

    // 重新渲染当前页，使“幸福”变回普通颜色
    const pageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
    renderBText(pageText, false, bCurrentVisibleLength);

    // 1. 立即触发 back0 和 textBack 的点击事件（如果它们在页面上可见且可用）
    // back0 会处理 slight 的退场动画和 stars 的重现动画，以及 textBefore 的退场
    // textBack 会处理 textAfter 的退场
    let back0Clicked = false;
    const back0 = document.getElementById('back0');
    if (back0 && back0.style.display !== 'none' && back0.style.opacity !== '0') {
        back0.click();
        back0Clicked = true;
    }

    let textBackClicked = false;
    const textBack = document.getElementById('textBack');
    if (textBack && textBack.style.display !== 'none' && textBack.style.opacity !== '0') {
        // 强制设置 isTextFinished 为 true，确保 textBack 的点击逻辑可以执行
        window.isTextFinished = true;
        textBack.click();
        textBackClicked = true;
    }



    // 3. 处理各组画布的退场
    const groups = [
        { id: 'slight', exclude: [], anim: 'anim-leave-lighting' },
        { id: 'UI', exclude: ['lantern-Bottom', 'back0'], anim: 'anim-fade0' },
        { id: 'text', exclude: ['tips', 'textBack'], anim: 'anim-fade0' }
    ];

    groups.forEach(groupCfg => {
        const group = document.getElementById(groupCfg.id);
        if (!group) return;

        const processElement = (el) => {
            if (groupCfg.exclude.includes(el.id)) return;
            
            // 如果 back0 或 textBack 已经被点击，则跳过它们负责处理的特定元素，避免动画冲突
            if (back0Clicked) {
                // back0 处理了所有 slight 元素和 textBefore
                if (groupCfg.id === 'slight') return;
                if (el.id === 'textBefore') return;
            }
            if (textBackClicked) {
                // textBack 处理了 textAfter
                if (el.id === 'textAfter') return;
            }

            if (el.tagName && el.tagName.toLowerCase() === 'canvas') {
                if (el.style.display !== 'none' && el.style.opacity !== '0') {
                    el.classList.add(groupCfg.anim);
                    el.addEventListener('animationend', () => {
                        el.style.display = 'none';
                        el.style.opacity = '0';
                        el.classList.remove(groupCfg.anim);
                    }, { once: true });
                }
            } else if (el.tagName && el.tagName.toLowerCase() === 'g') {
                Array.from(el.children).forEach(processElement);
            }
        };
        Array.from(group.children).forEach(processElement);
    });

    // 4. 播放 bUI 基础元素的退场动画（排除 lantern-Bottom）
    let finishCount = 0;
    const bUIElements = ['bItem', 'bText', 'back'];
    bUIElements.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            canvas.classList.add('anim-bUI-leave');
            const onEnd = () => {
                canvas.style.display = 'none';
                canvas.style.opacity = '0';
                canvas.classList.remove('anim-bUI-leave');
                canvas.removeEventListener('animationend', onEnd);
                
                finishCount++;
                 if (finishCount === bUIElements.length) {
                     // 所有退场动画完成，延迟 100 毫秒执行后续逻辑
                     setTimeout(() => {
                         startFinalSequence();
                     }, 1000);
                 }
            };
            canvas.addEventListener('animationend', onEnd);
            
        } else {
            finishCount++;
        }
    });

    //  将 stars 下的画布切换为不可点击的状态
    const starsGroup = document.getElementById('stars');
    if (starsGroup) {
        starsGroup.classList.add('stars-disabled');
    }

    // 将 lantern-Bottom 切换为不可点击的状态
    const lanternBottom = document.getElementById('lantern-Bottom');
    if (lanternBottom) {
        lanternBottom.classList.add('lantern-Bottom-disabled');
    }

    function startFinalSequence() {
         const blCanvas = document.getElementById("b-l");
         const moon = document.getElementById("moon");
         const starskyBG = document.getElementById("starskyBG");
         const lb = document.getElementById('lantern-Bottom');
 
         // 1. 令 blCanvas 变为 display=block
         if (blCanvas) {
             blCanvas.style.display = "block";
         }
 
         // 2. 令 lantern-bottom 延迟 100 毫秒变为 display=none
         setTimeout(() => {
             if (lb) lb.style.display = "none";
         }, 100);
 
         // 3. 开始播放 blcanvas 的精灵图动画
         if (typeof window.startBlightAnimation === 'function') {
             window.startBlightAnimation(() => {
                // 动画结束后的回调，延迟 1500 毫秒显示对话框
                setTimeout(() => {
                    if (typeof window.showTalkingUI === 'function') {
                        window.showTalkingUI(4, null); // 显示 case 4 的文本
                    }
                }, 1500);
             });
         } else {
             // 如果此时还没加载完（极低概率），尝试每100ms检查一次
             const checkInterval = setInterval(() => {
                 if (typeof window.startBlightAnimation === 'function') {
                     window.startBlightAnimation(() => {
                        // 动画结束后的回调，延迟 800 毫秒显示对话框
                        setTimeout(() => {
                            if (typeof window.showTalkingUI === 'function') {
                                window.showTalkingUI(4, null); // 显示 case 4 的文本
                            }
                        }, 800);
                     });
                     clearInterval(checkInterval);
                 }
             }, 100);
         }
 
         // 4. moon opacity=1
          if (moon) moon.style.opacity = "1";
      }
}

/**
 * 精简后的 tips 显示逻辑
 */
function showFinishTips() {
    const tips = document.getElementById('tips');
    if (!tips) return;
    const ctx = tips.getContext('2d');
    const [w, h, r] = [tips.width, tips.height, 3];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#cbdbfc';
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.fill();

    ctx.fillStyle = '#222034';
    ctx.font = 'bold 13px "Z Labs Bitmap 12px CN"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('*祈愿了“幸福”。', w / 2, h / 2 + 1);

    tips.classList.remove('anim-item-name-expand', 'anim-item-name-collapse');
    tips.style.display = 'block';
    tips.style.opacity = '1';
    tips.offsetHeight; 
    tips.classList.add('anim-item-name-expand');

    setTimeout(() => {
        tips.classList.replace('anim-item-name-expand', 'anim-item-name-collapse');
        const onEnd = () => {
            if (tips.classList.contains('anim-item-name-collapse')) {
                tips.style.display = 'none';
                tips.style.opacity = '0';
                tips.classList.remove('anim-item-name-collapse');
            }
            tips.removeEventListener('animationend', onEnd);
        };
        tips.addEventListener('animationend', onEnd);
    }, 3000);
}
window.shiawase = shiawase;

function loadBUI() {
    // ==========================================
    // bUI 元素配置区域
    // 你可以在这里单独调整每个元素在 bgCanvas 内的位置 (x, y)
    // ==========================================
    var bUIElement = [
        {
            id: 'bItem',
            src: './res/bottomUI/bItem.png',
            x: 0,   // bItem 在 bgCanvas 内的 X 坐标
            y: 476  // bItem 在 bgCanvas 内的 Y 坐标
        },
        {
            id: 'bText',
            src: './res/bottomUI/bText.png',
            x: 180, // bText 在 bgCanvas 内的 X 坐标
            y: 44   // bText 在 bgCanvas 内的 Y 坐标
        },
        {
            id: 'back',
            src: './res/bottomUI/back.png',
            x: 32,  // back 在 bgCanvas 内的 X 坐标
            y: 24   // back 在 bgCanvas 内的 Y 坐标
        },
    ];

    bUIElement.forEach(function(element) {
        var canvas = document.getElementById(element.id);
        if (canvas) {
            // 设置 canvas 元素在父容器中的绝对位置
            canvas.style.left = element.x + 'px';
            canvas.style.top = element.y + 'px';
            // 初始状态设为 隐藏
            canvas.style.display = 'none';
            canvas.style.opacity = '0';

            var ctx = canvas.getContext('2d');
            var img;
            if (element.id === 'bItem') {
                img = bItemImage;
            } else if (element.id === 'bText') {
                img = bTextImage;
            } else {
                img = new Image();
            }

            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 图片绘制在 canvas 内部 of (0, 0)
                ctx.drawImage(img, 0, 0);

                // 如果是 bItem，绘制额外的文本
                if (element.id === 'bItem') {
                    drawBItemTexts(ctx);
                }
                // 如果是 bText，绘制初始文本框和内容
                if (element.id === 'bText') {
                    // 初始化 bText 状态并绘制
                    updateBTextContent(bottomText());
                }
            };
            img.src = element.src;
        }
    });

    // 为 bText 画布添加点击事件监听（用于翻页和跳过打字机）
    var bTextCanvas = document.getElementById('bText');
    if (bTextCanvas) {
       
        bTextCanvas.addEventListener('click', function(e) {
            // 获取点击位置
            const rect = bTextCanvas.getBoundingClientRect();
            const scaleX = bTextCanvas.width / rect.width;
            const scaleY = bTextCanvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            // 检查是否点击了第八个关键字“幸福”
            for (let region of bKeywordRegions) {
                if (region.keyword === '幸福' && 
                    clickX >= region.x && clickX <= region.x + region.w &&
                    clickY >= region.y && clickY <= region.y + region.h) {
                    
                    if (!bEighthClicked) {
                        shiawase();
                        return; // 触发特殊函数后不再执行后续点击逻辑
                    }
                }
            }

            // 如果打字机正在运行，点击立即完成当前页
            if (bTypewriterTimer !== null) {
                e.stopPropagation();
                clearInterval(bTypewriterTimer);
                bTypewriterTimer = null;

                const pageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
                const result = renderBText(pageText, true);
                
                bCurrentVisibleLength = result.breakIndex;
                renderBText(pageText, false, bCurrentVisibleLength);
                
                if (result.hasOverflowed) {
                    bIsTextFinished = false;
                } else {
                    bIsTextFinished = true;
                }
                return;
            }

            // 如果当前页已播放完毕，点击翻页
            if (bIsTextFinished) {
                // 检查是否有下一页
                const remainingText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
                const result = renderBText(remainingText, true);

                if (result.hasOverflowed) {
                    navigateBPage(1);
                }
                return;
            }

            // 检查是否有下一页
            const remainingText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
            const result = renderBText(remainingText, true);

            if (result.hasOverflowed) {
                navigateBPage(1);
            } else {
                // 全部文本播放完毕
                bIsTextFinished = true;
            }
        });

        // 为 bText 画布添加鼠标移动监听，用于处理关键字的手势切换
        bTextCanvas.addEventListener('mousemove', function(e) {
            const rect = bTextCanvas.getBoundingClientRect();
            const scaleX = bTextCanvas.width / rect.width;
            const scaleY = bTextCanvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            let isHoveringKeyword = false;
            for (let region of bKeywordRegions) {
                // 目前只有“幸福”是可点击的
                if (region.keyword === '幸福' && 
                    mouseX >= region.x && mouseX <= region.x + region.w &&
                    mouseY >= region.y && mouseY <= region.y + region.h) {
                    
                    if (!bEighthClicked) {
                        isHoveringKeyword = true;
                        break;
                    }
                }
            }

            if (isHoveringKeyword) {
                bTextCanvas.style.cursor = 'pointer';
            } else {
                bTextCanvas.style.cursor = 'default';
            }
        });
    }

    // 为 back 按钮添加点击事件
    var backCanvas = document.getElementById('back');
    if (backCanvas) {
        backCanvas.style.cursor = 'pointer';
        backCanvas.onclick = function() {
            // 重置选中状态
            bchosenIndex = -1;
            redrawBItem();
            updateBTextContent(bottomText());

            var bUIIds = ['bItem', 'bText', 'back', 'lantern-Bottom'];
            bUIIds.forEach(function(id) {
                var canvas = document.getElementById(id);
                if (canvas) {
                    // 添加移除动画类
                    canvas.classList.add('anim-bUI-leave');
                    
                    // 监听动画结束事件
                    var onAnimationEnd = function() {
                        canvas.style.display = 'none';
                        canvas.style.opacity = '0';
                        canvas.classList.remove('anim-bUI-leave');
                        // 移除监听器以防下次显示时出现问题
                        canvas.removeEventListener('animationend', onAnimationEnd);

                        // 当所有动画结束且 lantern-Bottom 被隐藏后，检查是否重新启用碰撞检测
                        if (id === 'lantern-Bottom') {
                            // 恢复星星点击
                            const starsContainer = document.getElementById('stars');
                            if (starsContainer) starsContainer.classList.remove('stars-disabled');

                            // 恢复 lantern-Bottom 点击
                            canvas.classList.remove('lantern-Bottom-disabled');

                            const slightCanvases = ['s1l', 's2l', 's3l', 's4l', 's5l', 's6l', 's7l'];
                            const isSlightVisible = slightCanvases.some(sid => {
                                const scanvas = document.getElementById(sid);
                                return scanvas && scanvas.style.display === 'block';
                            });

                            if (!isSlightVisible) {
                                window.isCollisionDisabled = false;
                            }
                        }
                    };
                    canvas.addEventListener('animationend', onAnimationEnd);
                }
            });
        };
    }

    // 为 bItem 画布添加拖拽和点击事件处理
    var bItemCanvas = document.getElementById('bItem');
    if (bItemCanvas) {
        bItemCanvas.style.cursor = 'pointer';

        bItemCanvas.onmousedown = function(event) {
            var rect = bItemCanvas.getBoundingClientRect();
            var scaleX = bItemCanvas.width / rect.width;
            var scaleY = bItemCanvas.height / rect.height;
            var mouseX = (event.clientX - rect.left) * scaleX;
            var mouseY = (event.clientY - rect.top) * scaleY;

            // 检测点击了哪个文本框
            var clickedIndex = -1;
            bItemPositions.forEach(function(pos, index) {
                const id = 'rec-s' + (index + 1);
                const config = typeof itemConfigs !== 'undefined' ? itemConfigs.find(c => c.id === id) : null;
                const itemName = config ? config.name.replace(/[“”]/g, '') : '';
                
                // 只有已解锁且尚未在 bText 中“使用”过的物品才响应
                if (config && config.unlocked && !bRevealedKeywords.has(itemName)) {
                    if (mouseX >= pos.x && mouseX <= pos.x + bItemBoxWidth &&
                        mouseY >= pos.y && mouseY <= pos.y + bItemBoxHeight) {
                        clickedIndex = index;
                    }
                }
            });

            if (clickedIndex !== -1) {
                // 启动拖拽
                bIsDragging = true;
                bDraggedIndex = clickedIndex;

                // 计算偏移量
                const pos = bItemPositions[clickedIndex];
                // 转换为相对于视口的坐标
                const itemViewportX = rect.left + (pos.x / scaleX);
                const itemViewportY = rect.top + (pos.y / scaleY);
                bDragOffsetX = event.clientX - itemViewportX;
                bDragOffsetY = event.clientY - itemViewportY;

                // 创建拖拽代理元素 (Canvas)
                createDragProxy(clickedIndex, event.clientX, event.clientY);
                
                // 立即重绘 bItem 以隐藏被拖拽的物品
                redrawBItem();
            }
        };

        // 绑定到 window 以确保在画布外也能释放和移动
        window.addEventListener('mousemove', function(event) {
            if (bIsDragging && bDragProxy) {
                bDragProxy.style.left = (event.clientX - bDragOffsetX) + 'px';
                bDragProxy.style.top = (event.clientY - bDragOffsetY) + 'px';
            }
        });

        window.addEventListener('mouseup', function(event) {
            if (bIsDragging) {
                // 如果没有明显的拖拽位移，可以视为点击选中
                // 这里暂时简单处理：释放即视为拖拽结束，返回原位
                bIsDragging = false;
                
                // --- 新增：碰撞检测逻辑 ---
                let collisionSuccess = false;
                if (bDraggedIndex !== -1 && bDragProxy) {
                    const proxyRect = bDragProxy.getBoundingClientRect();
                    const bTextCanvas = document.getElementById('bText');
                    if (bTextCanvas) {
                        const bTextRect = bTextCanvas.getBoundingClientRect();
                        
                        // 1. 检查是否与 bText 画布区域有重叠
                        if (proxyRect.right > bTextRect.left && proxyRect.left < bTextRect.right &&
                            proxyRect.bottom > bTextRect.top && proxyRect.top < bTextRect.bottom) {
                            
                            // 2. 遍历当前页面记录的关键字区域
                            for (let region of bKeywordRegions) {
                                // 将 region 坐标（相对于 bText 画布）转换为视口坐标
                                const scaleX = bTextRect.width / bTextCanvas.width;
                                const scaleY = bTextRect.height / bTextCanvas.height;
                                
                                const regionViewportX = bTextRect.left + region.x * scaleX;
                                const regionViewportY = bTextRect.top + region.y * scaleY;
                                const regionViewportW = region.w * scaleX;
                                const regionViewportH = region.h * scaleY;

                                // 简单的矩形碰撞检测
                                if (proxyRect.right > regionViewportX && proxyRect.left < regionViewportX + regionViewportW &&
                                    proxyRect.bottom > regionViewportY && proxyRect.top < regionViewportY + regionViewportH) {
                                    
                                    // 3. 检查匹配：获取物品名称（去掉引号）并对比
                                    const config = itemConfigs.find(c => c.id === 'rec-s' + (bDraggedIndex + 1));
                                    const itemName = config ? config.name.replace(/[“”]/g, '') : '';
                                    
                                    if (itemName === region.keyword) {
                                        // 命中成功
                                        collisionSuccess = true;
                                        if (!bRevealedKeywords.has(region.keyword)) {
                                            bRevealedKeywords.add(region.keyword);
                                            // 如果还有未显示的章节，解锁下一章
                                            if (bRevealedSectionsCount < bSections.length) {
                                                bRevealedSectionsCount++;
                                            }

                                            // 检查是否是最后一个物品（恒星）
                                            if (itemName === '恒星') {
                                                window.puzzleFinish = true;
                                                // 更新 ex1, ex2 显示状态
                                                if (typeof updateExVisibility === 'function') {
                                                    updateExVisibility();
                                                }
                                            }

                                            // 重新更新内容并渲染
                                            updateBTextContent(bottomText());
                                        }
                                        break; 
                                    }
                                }
                            }
                        }
                    }
                }
                // ------------------------

                // 处理点击选中逻辑（如果位置没怎么变且没有发生成功的碰撞）
                if (bDraggedIndex !== -1 && !collisionSuccess) {
                    bchosenIndex = bDraggedIndex;
                    // 仅重绘物品栏以更新选中状态，不触发文本重置
                    redrawBItem();
                } else if (collisionSuccess) {
                    // 如果碰撞成功，确保不选中该物品
                    bchosenIndex = -1;
                }

                // 移除拖拽代理
                if (bDragProxy) {
                    document.body.removeChild(bDragProxy);
                    bDragProxy = null;
                }

                bDraggedIndex = -1;
                // 重绘以显示物品
                redrawBItem();
            }
        });
    }
}

/**
 * 创建拖拽时的视觉代理 (Canvas)
 */
function createDragProxy(index, mouseX, mouseY) {
    const config = itemConfigs.find(c => c.id === 'rec-s' + (index + 1));
    if (!config) return;

    // 创建一个新的 canvas
    const proxy = document.createElement('canvas');
    proxy.width = bItemBoxWidth;
    proxy.height = bItemBoxHeight;
    proxy.style.position = 'fixed';
    proxy.style.pointerEvents = 'none'; // 穿透，不干扰 mouse 事件
    proxy.style.zIndex = '1000';
    proxy.style.left = (mouseX - bDragOffsetX) + 'px';
    proxy.style.top = (mouseY - bDragOffsetY) + 'px';
    proxy.style.opacity = '0.8'; // 稍微透明一点

    const ctx = proxy.getContext('2d');
    
    // 绘制样式（参考 drawBItemTexts）
    const defaultColors = [
        '#fdd6dc', '#fdeee9', '#ba98ff', '#a9ffe0', '#f8e474', '#fc9f02', '#a5c0f7'
    ];
    
    // 绘制背景
    ctx.fillStyle = '#cbdbfc';
    ctx.fillRect(0, 0, bItemBoxWidth, bItemBoxHeight);
    
    // 绘制文本
    ctx.font = '20px "Z Labs Bitmap 12px CN"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222034';
    ctx.fillText(config.name, bItemBoxWidth / 2, bItemBoxHeight / 2);

    document.body.appendChild(proxy);
    bDragProxy = proxy;
}

/**
 * 单独控制 bUI 元素的显示或隐藏
 * @param {string} id - Canvas 元素的 ID (例如: 'bItem', 'bText', 'back')
 * @param {boolean} isVisible - true 为显示 (block), false 为隐藏 (none)
 */
function setBUIVisibility(id, isVisible) {
    var canvas = document.getElementById(id);
    if (canvas) {
        canvas.style.display = isVisible ? 'block' : 'none';
    }
}

/**
 * 在 bItem 画布上绘制七个物品文本框
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawBItemTexts(ctx) {
    // 物品 ID 列表，对应 itemConfigs 中的 rec-s1 到 rec-s7
    const recIds = ['rec-s1', 'rec-s2', 'rec-s3', 'rec-s4', 'rec-s5', 'rec-s6', 'rec-s7'];
    
    // 字体样式
    ctx.font = '20px "Z Labs Bitmap 12px CN"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 默认颜色配置，参考 keywordConfig
    const defaultColors = [
        '#fdd6dc', // rec-s1: 恒星
        '#fdeee9', // rec-s2: 怀旧
        '#ba98ff', // rec-s3: 母星
        '#a9ffe0', // rec-s4: 启程
        '#f8e474', // rec-s5: 意义
        '#fc9f02', // rec-s6: 动摇
        '#a5c0f7'  // rec-s7: 传达
    ];

    recIds.forEach((id, index) => {
        const config = typeof itemConfigs !== 'undefined' ? itemConfigs.find(c => c.id === id) : null;
        const itemName = config ? config.name.replace(/[“”]/g, '') : '';
        
        // 只有当物品已解锁且尚未在 bText 中“使用”过时才绘制文本框
        if (config && config.unlocked && bItemPositions[index] && !bRevealedKeywords.has(itemName)) {
            // 如果该物品正在被拖拽，则在原位不进行绘制
            if (bIsDragging && bDraggedIndex === index) {
                return;
            }

            const pos = bItemPositions[index];
            const isChosen = (bchosenIndex === index);

            if (isChosen) {
                checkSound.play();
                // 绘制选中背景 (改为该文本原本的颜色)
                ctx.fillStyle = defaultColors[index] || '#cbdbfc';
                ctx.fillRect(pos.x, pos.y, bItemBoxWidth, bItemBoxHeight);
                // 选中时的文本颜色 (#222034)
                ctx.fillStyle = '#222034';
            } else {
                // 未选中时的文本颜色 (原本的颜色)
                ctx.fillStyle = defaultColors[index] || '#cbdbfc';
            }
            
            // 计算中心点进行居中绘制
            const centerX = pos.x + bItemBoxWidth / 2;
            const centerY = pos.y + bItemBoxHeight / 2;
            
            // 绘制文本
            ctx.fillText(config.name, centerX, centerY);
        }
    });
}

/**
 * 获取 bText 的文本具体内容
 * @returns {string}
 */
function bottomText() {

    return `我在仰望这片夜空时曾数次回忆起过往。时间冲淡了很多，让各种事情不再显得历历在目，连那个人的声音我也已经忘记，唯有目睹尘埃在眼前飘散，而自己不断伸出手想要让其停留却终究没能抓住分毫【意义】的场景依旧那样鲜明。

我明明就在身旁，想起那个背影的时候，我不禁怨恨起了“你没有为我留下更多”这件事，就算我知道我的陪伴早已没有价值。那一天，当我回过神时，我连自己伸出手的理由都无法寻得，因为我知道“你不是第一个离去之人”……却是第一个离我而去的人。我难道是想——难道是想要将回归这片宇宙的你关进某个狭小的匣子之中，仅供我一个人【怀旧】吗？明明这颗卫星上连坟场都没有。

或许我成为“发起者”的原因很简单，也没有大义可言，就只是在怨恨没有为我留下话语便离去的人而已。
嗯，是啊……最初愿意留下星星的人，也几乎是怀着类似的情感吧。
只是，如果不以戏謔的口吻故作轻松，如果不用含沙射影的方式，如果不……将真正的悲伤掩藏，内心的情感便会决堤。我们即便留下了话语，也选择了只有创作了那颗星星的作者会明白背后的含义。
对那时候的……不，肯定对现在的人来说也一样，总之，成为了“伤口”的感情就是这么一回事，我们说着怀念【母星】，也只是沉浸于过往的回忆，并不是一定要在物理的意义上回到那颗蓝色的星球，毕竟……不在了的事物，就是……不在了啊。

但是，我也不能说是没有眷恋吧。嗯，“Bluemoon”这个词，指代的其实并非是蓝色的月亮，但在这里抬头就能看见蓝色……嗯……嘛，就是……那个意思吧。
我多少也明白的，时间继续持续下去的话，人总会走出感伤。当我最初创作了这个地方的目的，与如今前来此处留下星星的人们的理由产生了偏差……这么说都算轻了呢，应该说，现在已经没有人再因为怀念离去之人而考虑自己的身后事来留言了，不过也不是没有保持原来的含义吧。改变了的是“离去之人”的所指——那一片繁星点点，几乎都是由即将【启程】前往别的星球之人留下的。

意识到这件事的时候，感慨之余……我也不免产生了些许【动摇】。因为……感情色彩在变嘛。可仔细想了下，又觉得“这样也不错”了，毕竟是我让这里变成了“互动型”的，没有什么比让他人——不管是参与其中的共同创作者，还是单纯的参观者，能够享受作品更能够令发起者感到开心的了……啊，至少我个人是这么想的。

那个……我啊，并不是在自己的部分结束之后就撒手不管的那种人哦？时不时也会以参观者和维护者的身份来看看星星，了解从自己开始的作品如今成为了什么模样……大家现在都在想些什么事，之类的。怎么说呢……这大概就是不同时代的人的精神，想要【传达】的话语也不同吧？

事实上，或许……不，这肯定是因为四散在这宇宙之中的人类在以各自的方式解离着“死亡”吧。这么看来，至今都还是不明不白地变成了“有实体的幽灵”的我们，反而像是作弊了一样。只是我们也为了维持这份现状也做出了不少努力，不是吗？
但换一种角度看，这也意味着我们解离了“回归【恒星】”这件事吧？

我曾经将自己终将迎来的回归作为了念想，误以为那便是我的“希望”。
可现在看着早已超脱了我最初意图的这片夜空，我却……不由自主地感到了心安。
我就好像是——成为了守望者一样，同时又觉得自己与每一颗星星的创作者相连。
……这或许就是我最终为自己创作出的【幸福】吧。
那么，愿你也能够享受这片星空。`;
}
window.bottomText = bottomText;

/**
 * 重绘 bItem 画布，用于联动道具获得状态
 */
function redrawBItem() {
    const canvas = document.getElementById('bItem');
    if (canvas && bItemImage.complete) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bItemImage, 0, 0);
        drawBItemTexts(ctx);
    }
}
window.redrawBItem = redrawBItem;

/**
 * 渲染 bText 画布的文本
 * @param {string} text 要显示的完整文本（当前页）
 * @param {boolean} isVirtual 是否为虚拟渲染（用于计算分页）
 * @param {number} limit 渲染字符的截止索引（用于打字机效果，-1 表示全部渲染）
 */
function renderBText(text, isVirtual = false, limit = -1) {
    const canvas = document.getElementById('bText');
    if (!canvas) return { hasOverflowed: false, breakIndex: text.length };
    const ctx = canvas.getContext('2d');

    if (limit === -1) limit = text.length;

    if (!isVirtual) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bTextImage.complete) {
            ctx.drawImage(bTextImage, 0, 0);
        }
        bKeywordRegions = []; // 重置关键字区域
    }

    // 1. 绘制文本框（向内收缩5px）
    if (!isVirtual) {
        ctx.strokeStyle = '#cbdbfc';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    }

    // 2. 绘制文字属性
    ctx.font = '30px Silver';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const startX = 20;
    const startY = 20;
    const maxWidth = canvas.width - 40;
    const maxHeight = canvas.height - 25; // 底部留一点余量
    const lineHeight = 40;

    let x = startX;
    let y = startY;
    let hasOverflowed = false;
    let breakIndex = text.length;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // 处理换行符
        if (char === '\n') {
            x = startX;
            y += lineHeight;
            continue;
        }

        // 检测关键字 【...】
        if (char === '【') {
            const closingIndex = text.indexOf('】', i);
            if (closingIndex !== -1) {
                const fullKeyword = text.substring(i, closingIndex + 1);
                const keywordOnly = text.substring(i + 1, closingIndex);
                
                const keywordWidth = ctx.measureText(fullKeyword).width;

                // 检查是否需要自动换行
                if (x + keywordWidth > startX + maxWidth) {
                    x = startX;
                    y += lineHeight;
                }

                // 检查是否超出高度
                if (y + lineHeight > maxHeight) {
                    hasOverflowed = true;
                    breakIndex = i;
                    break;
                }

                if (!isVirtual) {
                    // 记录坐标区域（始终记录，用于碰撞检测）
                    bKeywordRegions.push({
                        keyword: keywordOnly,
                        x: x,
                        y: y,
                        w: keywordWidth,
                        h: lineHeight
                    });

                    // 绘制文字
                    const openBracketWidth = ctx.measureText('【').width;
                    
                    // 1. 绘制左括号（始终可见）
                    if (i < limit) {
                        ctx.fillStyle = '#cbdbfc';
                        ctx.fillText('【', x, y);
                    }

                    // 2. 绘制中间关键字（逐字检查 limit）
                    let currentX = x + openBracketWidth;
                    for (let k = 0; k < keywordOnly.length; k++) {
                        const charIndex = i + 1 + k;
                        if (charIndex < limit) {
                            if (keywordOnly === '幸福' && !bEighthClicked) {
                                // 第八个关键字：初始颜色 #b7f3ff
                                ctx.fillStyle = '#b7f3ff';
                            } else if (bRevealedKeywords.has(keywordOnly) || bEighthClicked) {
                                ctx.fillStyle = bKeywordColorMap[keywordOnly] || '#cbdbfc';
                            } else {
                                // 未解锁：透明不可见
                                ctx.fillStyle = 'rgba(0,0,0,0)'; 
                            }
                            const kChar = keywordOnly[k];
                            ctx.fillText(kChar, currentX, y);
                        }
                        currentX += ctx.measureText(keywordOnly[k]).width;
                    }

                    // 3. 绘制右括号（始终可见）
                    if (closingIndex < limit) {
                        ctx.fillStyle = '#cbdbfc';
                        ctx.fillText('】', currentX, y);
                    }
                }
                
                x += keywordWidth;
                i = closingIndex; 
                continue;
            }
        }

        const charWidth = ctx.measureText(char).width;

        // 检查是否需要自动换行
        if (x + charWidth > startX + maxWidth) {
            x = startX;
            y += lineHeight;
        }

        // 检查是否超出高度（分页检测）
        if (y + lineHeight > maxHeight) {
            hasOverflowed = true;
            breakIndex = i;
            break;
        }

        if (!isVirtual) {
            if (i < limit) {
                ctx.fillStyle = '#cbdbfc';
                ctx.fillText(char, x, y);
            }
        }
        x += charWidth;
    }

    return { hasOverflowed, breakIndex };
}

/**
 * 启动 bText 的打字机效果
 * @param {number} startIndex - 从页面文本的哪个索引开始打字（之前的字符立即显示）
 */
function startBTypewriter(startIndex = 0) {
    if (bTypewriterTimer) clearInterval(bTypewriterTimer);
    
    bIsTextFinished = false;

    const pageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
    
    // 先虚拟渲染一次，获取当前页的最大长度（防止打字机超出当前页范围）
    const virtualResult = renderBText(pageText, true);
    const maxPageLength = virtualResult.breakIndex;

    // 初始显示：显示到 startIndex 的位置
    bCurrentVisibleLength = Math.min(startIndex, maxPageLength);
    renderBText(pageText, false, bCurrentVisibleLength);

    // 更新全局已播放的最大索引
    const globalStartIndex = bPageHistory[bCurrentPageIndex] + bCurrentVisibleLength;
    bMaxPlayedIndex = Math.max(bMaxPlayedIndex, globalStartIndex);

    bTypewriterTimer = setInterval(() => {
        if (bCurrentVisibleLength < maxPageLength) {
            const char = pageText[bCurrentVisibleLength];
            
            // 播放音效逻辑
            let shouldPlaySound = true;
            
            // 1. 检查是否为空格或标点符号
            if (!char || !char.trim() || /[……。，！？：“”——、]/.test(char)) {
                shouldPlaySound = false;
            }
            
            // 2. 检查是否为不可见文字（在【】内且未解锁）
            if (shouldPlaySound) {
                // 查找当前字符是否在某个【】对中
                let inBracket = false;
                let currentKeyword = "";
                
                // 简单的向前查找最近的【
                const lastOpen = pageText.lastIndexOf('【', bCurrentVisibleLength);
                if (lastOpen !== -1) {
                    const nextClose = pageText.indexOf('】', lastOpen);
                    if (nextClose !== -1 && bCurrentVisibleLength > lastOpen && bCurrentVisibleLength < nextClose) {
                        inBracket = true;
                        currentKeyword = pageText.substring(lastOpen + 1, nextClose);
                    }
                }
                
                if (inBracket && !bRevealedKeywords.has(currentKeyword)) {
                    shouldPlaySound = false;
                }
            }

            if (shouldPlaySound && typeof text1Sound !== 'undefined') {
                text1Sound.play();
            }

            bCurrentVisibleLength++;
            
            // 每走一步打字机，都更新一次全局已播放最大索引
            const currentGlobalIndex = bPageHistory[bCurrentPageIndex] + bCurrentVisibleLength;
            bMaxPlayedIndex = Math.max(bMaxPlayedIndex, currentGlobalIndex);

            renderBText(pageText, false, bCurrentVisibleLength);
        }

        if (bCurrentVisibleLength >= maxPageLength) {
            clearInterval(bTypewriterTimer);
            bTypewriterTimer = null;
            
            // 如果虚拟渲染时发现有溢出，说明还有下一页
            if (virtualResult.hasOverflowed) {
                bIsTextFinished = false;
            } else {
                bIsTextFinished = true;
            }
        }
    }, 100); // 100ms 一个字符
}

/**
 * 更新 bText 画布的文本内容
 * @param {string} text 
 */
function updateBTextContent(text) {
    bFullText = text;
    // 按 \n\n 分割，并过滤掉可能的多余空行
    bSections = text.split(/\n\n+/).filter(s => s.trim().length > 0);
    
    const oldVisibleText = bCurrentVisibleText;
    // 合并当前已解锁的章节，使用单个换行符连接
    bCurrentVisibleText = bSections.slice(0, bRevealedSectionsCount).join('\n');
    
    // 如果是解锁了新章节
    if (bRevealedSectionsCount > bLastRevealedSectionsCount) {
        const newContentStartIndex = oldVisibleText.length > 0 ? oldVisibleText.length + 1 : 0; // +1 是因为 join('\n')
        bLastRevealedSectionsCount = bRevealedSectionsCount;

        // 我们需要找到新内容所在的页码
        // 首先重新计算分页，直到包含新内容
        bCurrentPageIndex = 0;
        bPageHistory = [0];
        let tempPageIndex = 0;
        let tempPageHistory = [0];
        
        while (true) {
            const currentPageText = bCurrentVisibleText.substring(tempPageHistory[tempPageIndex]);
            const result = renderBText(currentPageText, true);
            
            // 如果这一页的结束位置已经超过或等于新内容的开始位置，说明新内容在这一页（或从这一页开始）
            const globalPageEndIndex = tempPageHistory[tempPageIndex] + result.breakIndex;
            
            if (globalPageEndIndex >= newContentStartIndex || !result.hasOverflowed) {
                bCurrentPageIndex = tempPageIndex;
                bPageHistory = tempPageHistory;
                const startIndexOnPage = Math.max(0, newContentStartIndex - bPageHistory[bCurrentPageIndex]);
                startBTypewriter(startIndexOnPage);
                break;
            }
            
            // 否则，继续计算下一页
            tempPageIndex++;
            tempPageHistory[tempPageIndex] = globalPageEndIndex;
            if (tempPageIndex >= 100) break; // 安全边界
        }
    } else {
        // 普通更新（如初始加载、或者只是单纯的重新渲染）
        // 如果页码和历史记录已存在，则不再强制重置为 0，除非是全新的文本内容
        if (bPageHistory.length === 0 || bPageHistory[0] !== 0) {
            bCurrentPageIndex = 0;
            bPageHistory = [0];
        }
        
        // 确保当前页码有效
        if (bCurrentPageIndex >= bPageHistory.length) {
            bCurrentPageIndex = 0;
        }
        
        // 渲染当前页
        const pageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
        
        // 记录已播放的最大索引
        bMaxPlayedIndex = Math.max(bMaxPlayedIndex, bPageHistory[bCurrentPageIndex] + pageText.length);
        
        const result = renderBText(pageText);
        
        // 判断是否还有下一页
        if (result.hasOverflowed) {
            bIsTextFinished = false;
            bPageHistory[bCurrentPageIndex + 1] = bPageHistory[bCurrentPageIndex] + result.breakIndex;
        } else {
            bIsTextFinished = true;
        }
    }
}
window.updateBTextContent = updateBTextContent;

/**
 * bText 分页导航
 * @param {number} direction - 1 为下一页，-1 为上一页
 */
function navigateBPage(direction) {
    const bTextCanvas = document.getElementById('bText');
    if (!bTextCanvas || bTextCanvas.style.display === 'none') return;

    const newPageIndex = bCurrentPageIndex + direction;
    
    // 边界检查
    if (newPageIndex < 0 || newPageIndex >= 100) return; // 100 是一个安全上限

    if (direction === 1) {
        // 向后翻页：需要检查当前页是否溢出
        const currentPageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
        const result = renderBText(currentPageText, true);
        
        if (result.hasOverflowed) {
            bCurrentPageIndex = newPageIndex;
            // 如果历史记录里没有这一页，则添加
            if (bPageHistory[bCurrentPageIndex] === undefined) {
                bPageHistory[bCurrentPageIndex] = bPageHistory[bCurrentPageIndex - 1] + result.breakIndex;
            }
            
            const nextPageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
            
            // 检查下一页是否有未播放的内容
            const pageStartGlobalIndex = bPageHistory[bCurrentPageIndex];
            if (pageStartGlobalIndex < bMaxPlayedIndex) {
                // 如果页面起始位置已经被播放过，计算页面内需要立即显示的长度
                const playedLengthOnPage = bMaxPlayedIndex - pageStartGlobalIndex;
                startBTypewriter(playedLengthOnPage);
            } else {
                // 如果整个页面都没播放过，从头开始打字
                startBTypewriter(0);
            }
        }
    } else if (direction === -1) {
        // 向前翻页：只要不是第一页就可以翻
        if (bCurrentPageIndex > 0) {
            bCurrentPageIndex = newPageIndex;
            const prevPageText = bCurrentVisibleText.substring(bPageHistory[bCurrentPageIndex]);
            renderBText(prevPageText);
            bIsTextFinished = false; // 回到之前的页面，肯定有下一页（即刚才那一页）
        }
    }
}

// 为 bText 添加全局滚轮和键盘监听
window.addEventListener('wheel', (e) => {
    const bTextCanvas = document.getElementById('bText');
    if (bTextCanvas && bTextCanvas.style.display === 'block') {
        if (e.deltaY > 0) {
            navigateBPage(1);
        } else if (e.deltaY < 0) {
            navigateBPage(-1);
        }
    }
});

window.addEventListener('keydown', (e) => {
    const bTextCanvas = document.getElementById('bText');
    if (bTextCanvas && bTextCanvas.style.display === 'block') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            navigateBPage(1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            navigateBPage(-1);
        }
    }
});
