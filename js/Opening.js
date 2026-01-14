window.addEventListener('load', function() {
    // 根据设计规范设置位置
    const titleCanvas = document.getElementById('title');
    const startCanvas = document.getElementById('start');
    const readmeCanvas = document.getElementById('readme');
    const openBGCanvas = document.getElementById('OpenBG');

    if (openBGCanvas) {
        drawOpenBG(openBGCanvas);
    }

    if (typeof startOpeningBGM === 'function') {
        startOpeningBGM();
    }

    if (titleCanvas) {
        titleCanvas.style.left = '47px';
        titleCanvas.style.top = '189px';
        drawTitle(titleCanvas);
    }

    if (startCanvas) {
        startCanvas.style.left = '517px';
        startCanvas.style.top = '416px';
        startCanvas.style.cursor = 'pointer'; // Make it clickable
        drawStart(startCanvas);
        startCanvas.addEventListener('click', onStartClick);
    }

    if (readmeCanvas) {
        readmeCanvas.style.left = '517px';
        readmeCanvas.style.top = '507px';
        readmeCanvas.style.cursor = 'pointer'; // 使其可点击
        drawReadme(readmeCanvas);
        readmeCanvas.addEventListener('click', onReadmeClick);

        // 监听 textAfter 的显示状态，当其退场（隐藏）时重新启用 readme 点击
        const textAfter = document.getElementById("textAfter");
        if (textAfter) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (textAfter.style.display === 'none') {
                             if (!isReadmeActive) {
                                isReadmeActive = true;
                                readmeCanvas.style.cursor = 'pointer';
                             }
                        }
                    }
                });
            });
            observer.observe(textAfter, { attributes: true });
        }
    }
});

let isStartActive = true;

function onStartClick(event) {
    if (event) event.stopPropagation();
    dropSound.play();
    if (!isStartActive) return;
    isStartActive = false;
    
    const startCanvas = document.getElementById('start');
    if (startCanvas) startCanvas.style.cursor = 'default';

    // 1. 获取 Opening 下的所有画布
    const openingGroup = document.getElementById('Opening');
    if (openingGroup) {
        const canvases = openingGroup.querySelectorAll('canvas');
        let completedAnimations = 0;
        const totalCanvases = canvases.length;

        // 2. 播放 anim-fade0 动画
        canvases.forEach(canvas => {
            canvas.classList.add('anim-fade0');
            
            const onEnd = () => {
                canvas.classList.remove('anim-fade0');
                canvas.style.opacity = '0';
                canvas.style.display = 'none';
                canvas.removeEventListener('animationend', onEnd);
                
                completedAnimations++;
                // 确保只触发一次后续逻辑 (当所有画布动画都结束时，或者只以其中一个为准)
                // 由于动画时间相同，这里简化处理，只等待最后一个或计数
                if (completedAnimations === totalCanvases) {
                    setTimeout(proceedAfterOpeningFade, 800);
                }
            };
            canvas.addEventListener('animationend', onEnd);
        });
        
        // 如果没有画布，直接继续
        if (totalCanvases === 0) {
            setTimeout(proceedAfterOpeningFade, 20);
        }
    }
}

function proceedAfterOpeningFade() {
    // 触发游戏BGM
    if (typeof startGameBGM === 'function') {
        startGameBGM();
    }

    // 3. 触发 texttalking 对话框入场，显示文本 case 1
    // 4. 对话框关闭后，启用星星和矩形碰撞事件
    if (typeof window.showTalkingUI === 'function') {
        window.showTalkingUI(1, () => {
            // 回调：启用碰撞检测
            if (typeof window.isCollisionDisabled !== 'undefined') {
                window.isCollisionDisabled = false;
            }
            // 确保 stars 容器允许点击（如果之前被禁用）
            const starsContainer = document.getElementById('stars');
            if (starsContainer) starsContainer.classList.remove('stars-disabled');
            
            // 注意：isStartActive 不需要重置为 true，因为“禁止start的点击事件被再次触发”
        });
    }
}

let isReadmeActive = true;

function onReadmeClick(event) {
    if (event) event.stopPropagation();

    // 防止重复点击
    if (!isReadmeActive) return;
    dropSound.play();
    
    // 禁用点击
    isReadmeActive = false;
    const readmeCanvas = document.getElementById('readme');
    if (readmeCanvas) readmeCanvas.style.cursor = 'default';

    // 触发类似 textBefore 点击的逻辑 (参考 text.js 中的 clickTB)
    // 1. 显示 textAfter 和 textBack 并播放动画
    const textAfter = document.getElementById("textAfter");
    const textBack = document.getElementById("textBack");

    if (textAfter && textBack) {
        // 设置来自 ReadmeText 的内容
        const content = ReadmeText();
        
        // 使用 text.js 的变量和函数来渲染文本
        if (typeof window.isExtend !== 'undefined') window.isExtend = true;
        if (typeof window.isExMode !== 'undefined') window.isExMode = false;
        if (typeof window.fullText !== 'undefined') window.fullText = content;
        if (typeof window.isTextFinished !== 'undefined') window.isTextFinished = true; // 是否直接完成？textBefore 逻辑如果是重读则设为 true，但这里可能是首次。让我们遵循 clickTB 的重读逻辑，这对静态文本更简单。
        
        // 重置分页
        if (typeof window.currentPageIndex !== 'undefined') window.currentPageIndex = 0;
        if (typeof window.currentTextIndex !== 'undefined') window.currentTextIndex = 0;
        if (typeof window.precomputePageHistory === 'function') {
            window.pageHistory = window.precomputePageHistory(content);
        } else {
             window.pageHistory = [0];
        }

        // 渲染第一页
        if (typeof window.renderText === 'function') {
             window.renderText(content.substring(0)); // 从头开始渲染
        }

        // 显示 UI 元素
        [textAfter, textBack].forEach(el => {
            el.style.display = 'block';
            el.classList.add('anim-bottom-in');
            
            // 动画结束后移除动画类
             const onEnd = () => {
                el.classList.remove('anim-bottom-in');
                el.style.opacity = '1'; 
                el.removeEventListener('animationend', onEnd);
            };
            el.addEventListener('animationend', onEnd);
        });
        
        // 如果需要显示文本结束箭头（通常由 renderText/startTypewriter 处理，但这里我们可能直接显示全部）
         // 如果我们想要打字机效果，应该调用 startTypewriter() 而不是直接 renderText 并立即设置 isTextFinished=true。
         // 让我们模仿 clickTB 的“重读”逻辑，即暂时按“类似于 textBefore”的要求立即显示，但更简单。
         // 实际上 clickTB 如果是第一次则调用 startTypewriter，如果是重读则立即显示。
         // 为了安全和简单起见，假设 Readme 立即显示，或者如果首选则使用打字机。
         // 鉴于“textAfter内显示的文本内容”，让我们使用标准流程。
         
         // 如果可能的话，让我们尝试使用打字机效果以获得更好的润色，
         // 但如果不行，就直接渲染。
         // 目前，让我们将 isTextFinished 重置为 false，如果可用则调用 startTypewriter。
         if (typeof window.startTypewriter === 'function') {
             window.isTextFinished = false;
             window.startTypewriter();
         } else {
             // 备用方案
             if (typeof window.renderText === 'function') window.renderText(content);
             window.isTextFinished = true;
         }
    }
}

function drawTitle(canvas) {
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    
    // 设置字体样式: 100px, Z Labs Bitmap 12px CN
    ctx.font = '100px "Z Labs Bitmap 12px CN"';
    ctx.fillStyle = '#cbdbfc';
    ctx.textBaseline = 'top'; 
    
    // 输入区域 (在此处输入您的标题文本)
    ctx.fillText("Star,Starry,Stardust.", 0, 0);
}

function drawStart(canvas) {
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    
    // 设置字体样式: 30px, Z Labs Bitmap 12px CN
    ctx.font = '30px "Z Labs Bitmap 12px CN"';
    ctx.fillStyle = '#cbdbfc';
    ctx.textBaseline = 'top'; 
    
    // 输入区域 (在此处输入您的开始文本)
    ctx.fillText("开始游戏", 0, 0);
}

function drawReadme(canvas) {
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    
    // 设置字体样式: 30px, Z Labs Bitmap 12px CN
    ctx.font = '30px "Z Labs Bitmap 12px CN"';
    ctx.fillStyle = '#cbdbfc';
    ctx.textBaseline = 'top'; 
    
    // 输入区域 (在此处输入您的 readme 文本)
    ctx.fillText("玩前需知", 0, 0);
}

function drawOpenBG(canvas) {
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = './res/start.png';
}
 function ReadmeText(){
    // 输入区域 (在此处输入您的 readme 内容)
    return `本游戏需要使用的操作方式有：
    鼠标的左键点击，鼠标的左键长按拖曳，
    鼠标滚轮的滑动，滚轮动作可以使用方向键的↑↓代替。


本游戏使用的SE（音效）来自：
    コニシユカ (nonai sound）
    Ｔスタ
    小森平

本游戏使用的BGM（音乐）来自：
    コニシユカ (nonai sound）
    にゃるぱかBGM工房

本游戏在通关流程之外，设置了八处彩蛋文本。
那么，愿你能够享受本次旅途。
                     ——Pluvnubo`;
}