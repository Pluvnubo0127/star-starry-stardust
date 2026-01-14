function loadUI() {
    // ==========================================
    // UI 元素配置区域
    // 你可以在这里单独调整每个元素在 bgCanvas 内的位置 (x, y)
    // ==========================================
    var uiElements = [
        { 
            id: 'hiding', 
            src: './res/UI/hiding.png', 
            x: 1138,   // 侧边隐藏栏在 bgCanvas 内的 X 坐标
            y: 0    // 侧边隐藏栏在 bgCanvas 内的 Y 坐标
        },
        { 
            id: 'item-list', 
            src: './res/UI/item-list.png', 
            x: 1152, // 最初位于 bgCanvas 右侧边界之外 (1152)
            y: 0,
            targetX: 1064 // 目标 X 坐标
        },
        { 
            id: 'item-chose', 
            src: './res/UI/item-chose.png', 
            x: 1152, // 最初位于 bgCanvas 右侧边界之外 (1152)
            targetX: 1071, // 物品选中框在 bgCanvas 内的 X 坐标
            y: 35   // 物品选中框在 bgCanvas 内的 Y 坐标
        },
        { 
            id: 'text-talking', 
            src: './res/UI/talking.png', 
            x: 301,  // 对话框背景在 bgCanvas 内的 X 坐标
            y: 168   // 对话框背景在 bgCanvas 内的 Y 坐标
        },
        { 
            id: 'text-Over', 
            src: './res/UI/talking-Over.png', 
            x: 831,  // 对话结束标志在 bgCanvas 内的 X 坐标
            y: 394   // 对话结束标志在 bgCanvas 内的 Y 坐标
        },
        { 
            id: 'lantern-Bottom', 
            src: './res/UI/lantern-bottom.png', 
            x: 449,  // 灯笼底部装饰在 bgCanvas 内的 X 坐标
            y: 223   // 灯笼底部装饰在 bgCanvas 内的 Y 坐标
        },
        {
            id: 'listBotton',
            src: null, // 无需图片
            x: 1153, // 初始位置相对于 item-list (1152 + 1)
            y: 309,  
            isTransparent: true // 标记为透明方形
        },
        {
            id:'ex1',
            src: './res/UI/ex1.png',
            x:1152,
            targetX: 1126, 
            y: 636,  
        },
        {
            id:'ex2',
            src: './res/UI/ex2.png',
            x:1152,
            targetX: 1136, 
            y: 636,  
        },
        {
            id: 'back0',
            src: './res/UI/back.png',
            x: 32,  // back1 在 bgCanvas 内的 X 坐标
            y: 24   // back1 在 bgCanvas 内的 Y 坐标
        },
        {
            id:'check',
            src: './res/UI/check1.png',
            x:1152,
            targetX:1072,
            y:602
        }
    ];

    uiElements.forEach(function(element) {
        var canvas = document.getElementById(element.id);
        if (canvas) {
            // 初始设置为隐藏状态
            canvas.style.display = 'none';
            
            // 特殊处理：item-chose, ex1, ex2, check 初始透明度为 0
            if (element.id === 'item-chose' || element.id === 'ex1' || element.id === 'ex2' || element.id === 'check' || element.id === 'lantern-Bottom') {
                canvas.style.opacity = '0';
            } else {
                canvas.style.opacity = '1';
            }

            // 设置 canvas 元素在父容器中的绝对位置
            canvas.style.left = element.x + 'px';
            canvas.style.top = element.y + 'px';

            var ctx = canvas.getContext('2d');
            
            if (element.isTransparent) {
                // 绘制透明不可见的方形
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (element.src) {
                var img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 此时图片绘制在 canvas 内部的 (0, 0) 即可
                    ctx.drawImage(img, 0, 0);
                };
                img.src = element.src;
            }
        }
    });

    // 为 hiding 元素添加点击事件
    var hidingCanvas = document.getElementById('hiding');
    var itemListCanvas = document.getElementById('item-list');
    var listBottonCanvas = document.getElementById('listBotton');
    var ex1Canvas = document.getElementById('ex1');
    var ex2Canvas = document.getElementById('ex2');
    var itemChoseCanvas = document.getElementById('item-chose');
    var back0Canvas = document.getElementById('back0');
    var checkCanvas = document.getElementById('check');


    if (hidingCanvas && itemListCanvas && listBottonCanvas && ex1Canvas && ex2Canvas && itemChoseCanvas && back0Canvas && checkCanvas) {
        
        hidingCanvas.onclick = function() {
            // 在 0.5s 内平移到目标位置，同时改变透明度和可用性
            // 切换为 block 以允许动画和交互
            itemListCanvas.style.display = 'block';
            listBottonCanvas.style.display = 'block';
            ex1Canvas.style.display = 'block';
            ex2Canvas.style.display = 'block';
            itemChoseCanvas.style.display = 'block';
            checkCanvas.style.display = 'block';

            // item-list 目标 X = 1064
            // listBotton 目标 X = 1064 + 1 = 1065
            itemListCanvas.style.left = '1064px';
            itemListCanvas.style.opacity = '1';
            itemListCanvas.style.pointerEvents = 'auto';

            listBottonCanvas.style.left = '1065px';
            listBottonCanvas.style.opacity = '1';
            listBottonCanvas.style.pointerEvents = 'auto';

            ex1Canvas.style.left = '1126px';
            ex1Canvas.style.opacity = '0';
            ex1Canvas.style.pointerEvents = 'none';

            ex2Canvas.style.left = '1136px';
            ex2Canvas.style.opacity = '0';
            ex2Canvas.style.pointerEvents = 'none';

            checkCanvas.style.left = '1072px';
            checkCanvas.style.opacity = '0';
            checkCanvas.style.pointerEvents = 'none';

            itemChoseCanvas.style.left = '1071px';
            itemChoseCanvas.style.opacity = '0';
            itemChoseCanvas.style.pointerEvents = 'none';


        };

        // 为 listBotton 添加点击事件（收起物品栏）
        listBottonCanvas.onclick = function() {
            // 检查 item-list 是否处于展开位置 (x: 1064)
            // 使用 parseFloat 解析 style.left，或者直接判断字符串
            if (itemListCanvas.style.left === '1064px') {
                // 回到初始隐藏位置 (x: 1152)
                itemListCanvas.style.left = '1152px';
                itemListCanvas.style.opacity = '0';
                itemListCanvas.style.pointerEvents = 'none';

                // listBotton 同步移动 (x: 1153)
                listBottonCanvas.style.left = '1153px';
                listBottonCanvas.style.opacity = '0';
                listBottonCanvas.style.pointerEvents = 'none';

                ex1Canvas.style.left = '1152px';
                ex1Canvas.style.opacity = '0';
                ex1Canvas.style.pointerEvents = 'none';
                
                ex2Canvas.style.left = '1152px';
                ex2Canvas.style.opacity = '0';
                ex2Canvas.style.pointerEvents = 'none';

                itemChoseCanvas.style.left = '1152px';
                itemChoseCanvas.style.opacity = '0';
                itemChoseCanvas.style.pointerEvents = 'none';

                checkCanvas.style.left = '1152px';
                checkCanvas.style.opacity = '0';
                checkCanvas.style.pointerEvents = 'none';
            }
        };

        // ==========================================
        // check 按钮点击逻辑
        // ==========================================
        var checkNormalImg = new Image();
        checkNormalImg.src = './res/UI/check1.png';
        var checkPressedImg = new Image();
        checkPressedImg.src = './res/UI/check2.png';

        function drawCheck(isPressed) {
            var ctx = checkCanvas.getContext('2d');
            var img = isPressed ? checkPressedImg : checkNormalImg;
            if (img.complete) {
                ctx.clearRect(0, 0, checkCanvas.width, checkCanvas.height);
                ctx.drawImage(img, 0, 0);
            }
        }

        checkCanvas.onmousedown = function() { drawCheck(true); };
        checkCanvas.onmouseup = function() { drawCheck(false); };
        checkCanvas.onmouseleave = function() { drawCheck(false); };


        checkCanvas.onclick = function() {
            // 播放音效
            checkSound.play();

            // 立即隐藏 checkCanvas
            checkCanvas.style.display = 'none';

            // 原始操作封装为回调
            const originalAction = () => {
                // 禁用星星点击
                const starsContainer = document.getElementById('stars');
                if (starsContainer) starsContainer.classList.add('stars-disabled');

                // 1. lantern-Bottom 和 back 切换为 display=block 并播放动画
                var elementsToShow = ['lantern-Bottom', 'back'];
                elementsToShow.forEach(function(id) {
                    var canvas = document.getElementById(id);
                    if (canvas) {
                        canvas.style.display = 'block';
                        canvas.classList.add('anim-bottom-in');
                        
                        // 动画结束后设为 opacity=1 并移除类
                        var onEnd = function() {
                            canvas.style.opacity = '1';
                            canvas.classList.remove('anim-bottom-in');
                            canvas.removeEventListener('animationend', onEnd);
                        };
                        canvas.addEventListener('animationend', onEnd);
                        if (listBottonCanvas) {
                            listBottonCanvas.click();
                        }
                     }
                 });
             };

            // 只有第一次点击时才显示 talkingUI
            if (isFirstCheckClick) {
                isFirstCheckClick = false;
                // 触发 talking 对话框，索引为 3，退场后执行 originalAction
                window.showTalkingUI(3, originalAction);
            } else {
                // 之后直接执行原始操作
                originalAction();
            }
        };

        // ==========================================
        // lantern-Bottom 按钮点击逻辑
        // ==========================================
        var lanternBottomCanvas = document.getElementById('lantern-Bottom');
        if (lanternBottomCanvas) {
            lanternBottomCanvas.style.cursor = 'pointer';
            lanternBottomCanvas.onclick = function() {
                // 禁用碰撞检测
                window.isCollisionDisabled = true;
                // 禁用星星点击
                const starsContainer = document.getElementById('stars');
                if (starsContainer) starsContainer.classList.add('stars-disabled');

                // 1. 原本 check 的点击事件效果：令 bUI 内的画布切换为 display=block 状态
                var bUIElements = ['bItem', 'bText', 'back'];
                bUIElements.forEach(function(id) {
                    var canvas = document.getElementById(id);
                    if (canvas) {
                        canvas.style.display = 'block';
                        // 添加动画效果，与 lantern-Bottom 相同
                        canvas.classList.add('anim-bottom-in');
                        
                        // 动画结束后设为 opacity=1 并移除类
                        var onEnd = function() {
                            canvas.style.opacity = '1';
                            canvas.classList.remove('anim-bottom-in');
                            canvas.removeEventListener('animationend', onEnd);
                        };
                        canvas.addEventListener('animationend', onEnd);
                    }
                });
            };
        }

        // --- ex1 和 ex2 的点击事件 (委托给 text.js 中的 clickEx) ---
        const handleExClick = function(e) {
            // 调用 text.js 中定义的 clickEx 函数
            if (typeof window.clickEx === 'function') {
                window.clickEx(e);
            }
        };

        ex1Canvas.onclick = handleExClick;
        ex2Canvas.onclick = handleExClick;

        // 初始化 text-talking
        renderTalkingText("");
    }
}

// ==========================================
// text-talking 对话框逻辑
// ==========================================
let talkingIndex = 0; // 全局索引，用于控制对话文本
let isTalkingVisible = false; // 标记对话框是否处于显示状态
let isFirstCheckClick = true; // 标记是否是第一次点击 check 按钮
let pendingTalkingCallback = null; // 存储退场后执行的回调
let talkingImg = new Image();
talkingImg.src = './res/UI/talking.png';
/**
 * 监听全局点击，处理 talkingText 的退场
 */
window.addEventListener('click', function(e) {
    // 只有当对话框可见时才处理
    if (!isTalkingVisible) return;

    // 排除 UI, item, bUI 图层的点击，但允许点击对话框本身（text-talking）或其结束标志（text-Over）
    const target = e.target;
    if (target.closest('#UI, #item, #bUI')) {
        if (target.id !== 'text-talking' && target.id !== 'text-Over') {
            return;
        }
    }

    // 执行退场
    window.hideTalkingUI();
});

/**
 * 渲染 talking 对话框
 * @param {string} text - 要显示的文本
 */
function renderTalkingText(text) {
    const canvas = document.getElementById("text-talking");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // 1. 保持现有背景图片
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (talkingImg.complete) {
        ctx.drawImage(talkingImg, 0, 0);
    } else {
        talkingImg.onload = function() {
            renderTalkingText(text);
        };
    }

    // 2. 绘制文本框（向内收缩5px）
    ctx.strokeStyle = '#cbdbfc'; // 与 text-After 相同的颜色
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // 3. 绘制文字（与 text-After 属性相同）
    ctx.fillStyle = '#cbdbfc';
    ctx.font = '24px "Z Labs Bitmap 12px CN"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 文本绘制区域（在框内，留出边距）
    let currentStartX = 50;
    let currentStartY = 100;
    
    // 只有 case 4 时，文本从 (10, 10) 开始（相对于画布内部）
     if (talkingIndex === 4) {
         currentStartX = 10;
         currentStartY = 10;
     }

    const margin = 20; // 右边距
    const maxWidth = canvas.width - currentStartX - margin;
    const lineHeight = 35;

    let line = '';
    let y = currentStartY;

    // 按字符处理，支持手动换行符 \n
    for (let n = 0; n < text.length; n++) {
        const char = text[n];

        if (char === '\n') {
            ctx.fillText(line, currentStartX, y);
            line = '';
            y += lineHeight;
            continue;
        }

        let testLine = line + char;
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && line.length > 0) {
            ctx.fillText(line, currentStartX, y);
            line = char;
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    // 绘制最后一行
    if (line.length > 0) {
        ctx.fillText(line, currentStartX, y);
    }
}

/**
 * 启动 talking 打字机效果
 * @param {string} text - 完整文本内容
 */
window.startTalkingTypewriter = function(text) {
    talkingFullText = text || "";
    talkingCurrentIndex = 0;
    if (talkingTypewriterTimer) clearInterval(talkingTypewriterTimer);
    
    // 如果文本为空，直接结束
    if (talkingFullText === "") {
        renderTalkingText("");
        showTalkingOver();
        return;
    }

    talkingTypewriterTimer = setInterval(() => {
        if (talkingCurrentIndex < talkingFullText.length) {
            talkingCurrentIndex++;
            renderTalkingText(talkingFullText.substring(0, talkingCurrentIndex));
        } else {
            clearInterval(talkingTypewriterTimer);
            talkingTypewriterTimer = null;
            showTalkingOver();
        }
    }, 50);
};

/**
 * 显示对话结束标志 (text-Over)
 */
function showTalkingOver() {
    const textOver = document.getElementById("text-Over");
    if (textOver) {
        textOver.style.display = 'block';
        textOver.classList.add('anim-bottom-in');
        const onEnd = () => {
            textOver.style.opacity = '1';
            textOver.classList.remove('anim-bottom-in');
            textOver.removeEventListener('animationend', onEnd);
        };
        textOver.addEventListener('animationend', onEnd);
    }
}

/**
 * 根据不同情况返回对话框文本
 * @param {string|number} situation - 触发情况的标识符或索引
 * @returns {string} - 对应的文本内容
 */
function whichTalkingText(situation) {
    let text = "";
    
    // 如果没有传入参数，默认使用当前的 talkingIndex
    const index = (situation !== undefined) ? situation : talkingIndex;

    // 基于索引的文本存储
    switch (index) {
        case 0:
            text = "";
            break;
        case 1:
            text = "点亮 黑暗 ，找到 被藏起的东西 吧。";
            break;
        case 2:
            exSound.play();
            text = "开始播放 星光之中的 留言 。";
            break;
        case 3:
            text = "提灯 的 底部 似乎写着 什么 。";
            break;
        case 4:
            text = `本次的旅途到此已经全部结束了，感谢您今日的来访。  
您可以继续驻留此处观赏这片星空，本馆随时欢迎您的再次光临。  
愿您今后的人生也能获得幸福。
                            ——by 发起者`;
            break;
        case 5:
            text = "开始播放 磁带中的 录音。"
            break;
        default:
            // 如果 situation 是字符串且不匹配任何索引，则直接作为文本显示
            if (typeof situation === 'string') {
                text = situation;
            }
            break;
    }
    
    return text;
}

/**
 * 显示 talking UI（带入场动画）
 * @param {string|number} situation - 初始文本或情况标识符
 * @param {function} callback - 对话框退场后要执行的回调函数
 */
window.showTalkingUI = function(situation, callback) {
    const talking = document.getElementById("text-talking");
    if (talking) {
        // 禁用碰撞检测
        window.isCollisionDisabled = true;

        // 存储回调
        pendingTalkingCallback = callback || null;

        // 如果传入了索引，更新全局索引
        if (typeof situation === 'number') {
            talkingIndex = situation;
        }

        const text = whichTalkingText(situation);
        
        // 立即渲染全文，确保动画开始时文字已在画布上
        renderTalkingText(text);
        
        talking.style.display = 'block';
        talking.classList.add('anim-bottom-in');
        const onEnd = () => {
            talking.style.opacity = '1';
            talking.classList.remove('anim-bottom-in');
            talking.removeEventListener('animationend', onEnd);
            
            // 动画结束后立即显示结束标志
            showTalkingOver();
            // 标记为可见，允许点击退场
            isTalkingVisible = true;
        };
        talking.addEventListener('animationend', onEnd);
    }
};

/**
 * 隐藏 talking UI（带退场动画）
 */
window.hideTalkingUI = function() {
    const talking = document.getElementById("text-talking");
    const textOver = document.getElementById("text-Over");
    
    // 重新启用碰撞检测逻辑：仅当 slight 图层下的所有画布都不可见时才启用
    const slightCanvases = document.querySelectorAll('#slight canvas');
    const isAnySlightVisible = Array.from(slightCanvases).some(el => el.style.display !== 'none');
    
    if (!isAnySlightVisible) {
        window.isCollisionDisabled = false;
    }

    // 立即重置状态，防止重复触发
    isTalkingVisible = false;
    talkingIndex = 0;

    const currentCallback = pendingTalkingCallback;
    pendingTalkingCallback = null;

    let animationsToFinish = 0;
    const elementsToAnimate = [talking, textOver].filter(el => el && el.style.display !== 'none');
    
    if (elementsToAnimate.length === 0) {
        if (currentCallback) currentCallback();
        return;
    }

    elementsToAnimate.forEach(el => {
        animationsToFinish++;
        el.classList.add('anim-bUI-leave');
        const onEnd = () => {
            el.style.opacity = '0';
            el.style.display = 'none';
            el.classList.remove('anim-bUI-leave');
            // 退场后清空文本内容，恢复默认状态
            if (el.id === 'text-talking') {
                renderTalkingText("");
            }
            el.removeEventListener('animationend', onEnd);
            
            animationsToFinish--;
            if (animationsToFinish === 0 && currentCallback) {
                currentCallback();
            }
        };
        el.addEventListener('animationend', onEnd);
    });
};

/**
 * 单独控制 UI 元素的显示或隐藏
 * @param {string} id - Canvas 元素的 ID (例如: 'hiding', 'item-list' 等)
 * @param {boolean} isVisible - true 为显示 (block), false 为隐藏 (none)
 */
function setUIVisibility(id, isVisible) {
    var canvas = document.getElementById(id);
    if (canvas) {
        canvas.style.display = isVisible ? 'block' : 'none';
    }
}

// ==========================================
// 使用示例 (你可以根据需要在其他地方调用):
// setUIVisibility('hiding', true); // 显示侧边隐藏栏
// setUIVisibility('item-list', false); // 隐藏物品栏
// ==========================================