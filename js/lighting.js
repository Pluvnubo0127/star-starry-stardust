/**
 * 加载并绘制 lighting 图片到对应的 canvas
 */
function initLighting() {
    for (let i = 1; i <= 7; i++) {
        const canvasId = `s${i}l`;
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            // 根据文件系统实际情况，使用 .png 后缀和大写 L
            img.onload = function() {
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            };
            img.src = `./res/lighting/s${i}L.png`;
            
            // 初始状态根据需要设置，这里默认隐藏，或者可以根据业务逻辑调整
            canvas.style.display = 'none';
            canvas.style.opacity = '0';
        }
    }
}

/**
 * 控制指定 lighting canvas 的显示状态
 * @param {number} index - 星星索引 (1-7)
 * @param {boolean} isVisible - 是否显示
 */
function setLightingVisibility(index, isVisible) {
    const canvasId = `s${index}l`;
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        canvas.style.display = isVisible ? 'block' : 'none';
    }
}



// 页面加载后初始化
initLighting();
