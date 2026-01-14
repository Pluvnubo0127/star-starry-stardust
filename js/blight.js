function drawBlights() {
    const blCanvas = document.getElementById("b-l");
    const spriteCanvas = document.getElementById("spriteCanvas");
    
    if (!blCanvas || !spriteCanvas) return;
    
    const blCtx = blCanvas.getContext("2d");
    const spriteCtx = spriteCanvas.getContext("2d");
    
    // 初始状态下为不可用
    spriteCanvas.style.display = "none";
    blCanvas.style.display = "none";
    blCanvas.style.zIndex = "12";
    
    const blImg = new Image();
    const spriteImg = new Image();
    
    const frameWidth = 1152;
    const frameHeight = 648;
    const blDelay = 200;     // b-l 动画每张停留时间
    const spriteDelay = 900; // spriteCanvas 动画每张停留时间
    
    let blLoaded = false;
    let spriteLoaded = false;
    
    blImg.onload = () => {
        blLoaded = true;
        // 最初只显示最左侧的一张
        blCtx.clearRect(0, 0, blCanvas.width, blCanvas.height);
        blCtx.drawImage(
            blImg, 
            0, 0, frameWidth, frameHeight, 
            0, 0, blCanvas.width, blCanvas.height
        );
        checkStart();
    };
    blImg.src = './res/blight1.png';
    
    spriteImg.onload = () => {
        spriteLoaded = true;
        checkStart();
    };
    spriteImg.src = './res/moonstarlight.png';
    
    function checkStart() {
        if (blLoaded && spriteLoaded) {
            // 预留接口，由外部触发动画
            window.startBlightAnimation = function(onComplete) {
                startBlAnimation(onComplete);
            };
        }
    }
    
    function startBlAnimation(onComplete) {
        let currentFrame = 1; // 从第二张开始，因为第一张已经显示了
        const totalFrames = 8;
        
        function animate() {
            blCtx.clearRect(0, 0, blCanvas.width, blCanvas.height);
            blCtx.drawImage(
                blImg,
                currentFrame * frameWidth, 0, frameWidth, frameHeight,
                0, 0, blCanvas.width, blCanvas.height
            );
            
            currentFrame++;
            if (currentFrame < totalFrames) {
                setTimeout(animate, blDelay);
            } else {
                // 等待最后一张停留 blDelay 后再开始下一个动画
                setTimeout(() => startSpriteAnimation(onComplete), blDelay);
            }
        }
        
        setTimeout(animate, 400);
    }
    
    function startSpriteAnimation(onComplete) {
        spriteCanvas.style.display = "block";
        let currentFrame = 0;
        const totalFrames = 4; // 根据原 bg.js 代码，moonstarlight 有 4 帧
        
        function animate() {
            spriteCtx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
            spriteCtx.drawImage(
                spriteImg,
                currentFrame * frameWidth, 0, frameWidth, frameHeight,
                0, 0, spriteCanvas.width, spriteCanvas.height
            );
            
            // 如果是最后一帧，同步显示星空背景
            if (currentFrame === totalFrames - 1) {
                const starskyBG = document.getElementById("starskyBG");
                if (starskyBG) {
                    starskyBG.style.display = "block";
                }
            }
            
            currentFrame++;
            if (currentFrame < totalFrames) {
                setTimeout(animate, spriteDelay);
            } else {
                // 动画结束后隐藏容器 (保留原 bg.js 逻辑)
                const spriteContainer = document.getElementById("sprite");
                if (spriteContainer) {
                    setTimeout(() => {
                        spriteContainer.style.display = "none";
                        // 触发完成回调
                        if (typeof onComplete === 'function') {
                            onComplete();
                        }
                    }, 200);
                } else {
                    // 如果没有 spriteContainer，直接触发回调
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }
            }
        }
        
        animate();
    }
}
