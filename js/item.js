const itemConfigs = [
    { id: 'latten', x: 1071, y: 35, choseY: 35, drawX: 20, drawY: 0, src: './res/item/latten.png', chosenSrc: './res/item/latten-chosen.png', isChosen: false, name: '提灯', unlocked: true },
    { id: 'rec-s1', x: 1071, y: 105, choseY: 105, drawX: 10, drawY: 15, src: './res/item/rec-s1.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“恒星”', unlocked: false },
    { id: 'rec-s2', x: 1071, y: 175, choseY: 175, drawX: 10, drawY: 15, src: './res/item/rec-s2.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“怀旧”', unlocked: false },
    { id: 'rec-s3', x: 1071, y: 245, choseY: 245, drawX: 10, drawY: 15, src: './res/item/rec-s3.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“母星”', unlocked: false },
    { id: 'rec-s4', x: 1071, y: 317, choseY: 317, drawX: 10, drawY: 15, src: './res/item/rec-s4.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“启程”', unlocked: false },
    { id: 'rec-s5', x: 1071, y: 387, choseY: 387, drawX: 10, drawY: 15, src: './res/item/rec-s5.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“意义”', unlocked: false },
    { id: 'rec-s6', x: 1071, y: 457, choseY: 457, drawX: 10, drawY: 15, src: './res/item/rec-s6.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“动摇”', unlocked: false },
    { id: 'rec-s7', x: 1071, y: 527, choseY: 527, drawX: 10, drawY: 15, src: './res/item/rec-s7.png', chosenSrc: './res/item/rec-chosen.png', isChosen: false, name: '“传达”', unlocked: false }
];

const INITIAL_X = 1152;
let itemsVisible = false;
let clickRec = false;
let itemNameTimer = null; // 用于管理 item-name 自动隐藏的计时器
window.puzzleFinish = false; // 新增：记录拼图是否完成



// 缓存图片对象以提高切换性能
const imageCache = {};

/**
 * 预加载所有图片
 */
function preloadImages() {
    itemConfigs.forEach(config => {
        if (!imageCache[config.src]) {
            imageCache[config.src] = new Image();
            imageCache[config.src].src = config.src;
        }
        if (!imageCache[config.chosenSrc]) {
            imageCache[config.chosenSrc] = new Image();
            imageCache[config.chosenSrc].src = config.chosenSrc;
        }
    });
}

/**
 * 绘制单个物品的 Canvas 内容
 */
function drawItemCanvas(config) {
    const canvas = document.getElementById(config.id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgSrc = config.isChosen ? config.chosenSrc : config.src;
    const img = imageCache[imgSrc];

    if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 使用配置的 drawX 和 drawY 偏移量来保持视觉位置不变
        ctx.drawImage(img, config.drawX, config.drawY);
    } else {
        // 如果图片还没加载完，监听加载事件
        const newImg = new Image();
        newImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(newImg, config.drawX, config.drawY);
            imageCache[imgSrc] = newImg;
        };
        newImg.src = imgSrc;
    }
}

/**
 * 公共函数：根据选中状态切换 ex1, ex2 和 check 的显示与点击状态
 */
function updateExVisibility() {
    const ex1 = document.getElementById('ex1');
    const ex2 = document.getElementById('ex2');
    const check = document.getElementById('check');
    
    // 检查 latten 是否被选中
    const isLattenChosen = itemConfigs.find(c => c.id === 'latten')?.isChosen || false;

    if (ex1 && ex2) {
        // 暂时禁用 transition 以实现无过渡切换 opacity
        ex1.style.transition = 'left 0.5s ease'; // 只保留位置过渡
        ex2.style.transition = 'left 0.5s ease';

        if (clickRec || (window.puzzleFinish && isLattenChosen)) {
            ex1.style.opacity = '1';
            ex1.style.pointerEvents = 'auto';
            ex2.style.opacity = '1';
            ex2.style.pointerEvents = 'auto';
        } else {
            ex1.style.opacity = '0';
            ex1.style.pointerEvents = 'none';
            ex2.style.opacity = '0';
            ex2.style.pointerEvents = 'none';
        }
    }

    if (check) {
        check.style.transition = 'left 0.5s ease'; // 只保留位置过渡
        if (isLattenChosen) {
            check.style.opacity = '1';
            check.style.pointerEvents = 'auto';
        } else {
            check.style.opacity = '0';
            check.style.pointerEvents = 'none';
        }
    }
}

/**
 * 绘制物品名称 Canvas (带圆角矩形和文字)
 */
function drawItemNameCanvas(text) {
    const canvas = document.getElementById('item-name');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = 3;

    ctx.clearRect(0, 0, width, height);

    // 1. 绘制圆角矩形 (#cbdbfc)
    ctx.fillStyle = '#cbdbfc';
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    // 2. 绘制文字 (#222034)
    ctx.fillStyle = '#222034';
    ctx.font = 'bold 13px "Z Labs Bitmap 12px CN"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 居中绘制文本
    ctx.fillText(text, width / 2, height / 2 + 1); // +1 微调视觉居中
}

function initItems() {
    preloadImages();
    itemConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (!canvas) return;

        // 初始绘制
        drawItemCanvas(config);

        // 初始化 item-name 位置和状态
        const itemName = document.getElementById('item-name');
        if (itemName) {
            itemName.style.left = '951px';
            itemName.style.top = '11px';
            itemName.style.display = 'none';
            itemName.style.opacity = '0';
            itemName.style.zIndex = '4';
        }

        // 初始状态：位于右侧边界外，透明度为0，且不显示
        canvas.style.position = 'absolute';
        canvas.style.left = INITIAL_X + 'px';
        canvas.style.top = config.y + 'px';
        canvas.style.opacity = '0';
        canvas.style.display = 'none';
        canvas.style.transition = 'left 0.5s ease, opacity 0.5s ease';
        canvas.style.zIndex = '4'; // 确保在 item-list 背景之上 (z-index 3)
        canvas.style.cursor = 'pointer';

        // 为每个物品 canvas 添加点击事件
        canvas.addEventListener('click', () => {
            // 播放音效
            puttingSound.play();

            // 1. 更新互斥的选中状态
            itemConfigs.forEach(c => {
                const wasChosen = c.isChosen;
                c.isChosen = (c.id === config.id);
                // 只有状态发生改变的才重绘，优化性能
                if (wasChosen !== c.isChosen) {
                    drawItemCanvas(c);
                }
            });

            // 2. 更新 clickRec 状态
            clickRec = config.id.startsWith('rec-s');

            // 3. 更新 ex1, ex2 可见性
            updateExVisibility();

            // 4. 更新 itemChose 状态
            const itemChose = document.getElementById('item-chose');
            if (itemChose) {
                itemChose.style.opacity = '1';
                itemChose.style.top = config.choseY + 'px';
            }

            // 5. 更新并显示物品名称
            const itemName = document.getElementById('item-name');
            if (itemName) {
                // 清除之前的计时器
                if (itemNameTimer) {
                    clearTimeout(itemNameTimer);
                }

                // 先绘制对应文本
                drawItemNameCanvas(config.name);
                
                // 重置动画类以重新触发展开动画
                itemName.classList.remove('anim-item-name-expand', 'anim-item-name-collapse');
                itemName.style.display = 'block';
                itemName.style.opacity = '1'; 
                // 强制重绘
                itemName.offsetHeight;
                itemName.classList.add('anim-item-name-expand');

                // 自动收合
                itemNameTimer = setTimeout(() => {
                    // 播放收合动画
                    itemName.classList.remove('anim-item-name-expand');
                    itemName.classList.add('anim-item-name-collapse');

                    // 动画结束后完全隐藏
                    const onEnd = () => {
                        if (itemName.classList.contains('anim-item-name-collapse')) {
                            itemName.style.display = 'none';
                            itemName.style.opacity = '0';
                            itemName.classList.remove('anim-item-name-collapse');
                        }
                        itemName.removeEventListener('animationend', onEnd);
                    };
                    itemName.addEventListener('animationend', onEnd);
                }, 1000);
            }
        });
    });

    // 初始设置 itemChose 的 opacity 为 0
    const itemChose = document.getElementById('item-chose');
    if (itemChose) {
        itemChose.style.opacity = '0';
    }
}

function showItems() {
    itemsVisible = true;
    itemConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (!canvas) return;

        // 仅当物品已解锁时显示并执行动画
        if (config.unlocked) {
            // 如果之前是隐藏的，为了确保过渡动画生效，需要先设为 block 并触发重绘
            if (canvas.style.display === 'none') {
                canvas.style.display = 'block';
                canvas.offsetHeight; // 强制重绘
            }
            canvas.style.left = config.x + 'px';
            canvas.style.opacity = '1';
        } else {
            // 未解锁时保持透明度 0 和不显示，并确保在初始位置
            canvas.style.display = 'none';
            canvas.style.left = INITIAL_X + 'px';
            canvas.style.opacity = '0';
        }
    });
}

/**
 * 解锁指定物品并即时显示
 */
function unlockItem(id) {
    const config = itemConfigs.find(c => c.id === id);
    if (config && !config.unlocked) {
        config.unlocked = true;
        
        // 如果物品栏当前是展开状态，立即让该物品滑入
        if (itemsVisible) {
            const canvas = document.getElementById(id);
            if (canvas) {
                canvas.style.display = 'block';
                canvas.offsetHeight; // 强制重绘
                canvas.style.left = config.x + 'px';
                canvas.style.opacity = '1';
            }
        }

        // 如果 bItem 画布存在且可见，触发其重绘以显示新获得的道具文本
        if (typeof window.redrawBItem === 'function') {
            window.redrawBItem();
        }
    }
}
window.unlockItem = unlockItem;

function hideItems() {
    itemsVisible = false;
    itemConfigs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (!canvas) return;

        canvas.style.left = INITIAL_X + 'px';
        canvas.style.opacity = '0';
        
        // 动画结束后隐藏元素
        setTimeout(() => {
            if (!itemsVisible) {
                canvas.style.display = 'none';
            }
        }, 500);
    });

    // 隐藏物品栏时，重置所有状态
    clickRec = false;
    updateExVisibility();
    const itemChose = document.getElementById('item-chose');
    if (itemChose) {
        itemChose.style.opacity = '0';
    }

    // 重置 item-name 状态
    const itemName = document.getElementById('item-name');
    if (itemName) {
        if (itemNameTimer) {
            clearTimeout(itemNameTimer);
            itemNameTimer = null;
        }
        itemName.style.display = 'none';
        itemName.style.opacity = '0';
        itemName.style.transition = ''; // 清除过渡效果
        itemName.classList.remove('anim-item-name-expand', 'anim-item-name-collapse');
    }
    
    // 重置所有物品的选中状态并重绘
    itemConfigs.forEach(config => {
        if (config.isChosen) {
            config.isChosen = false;
            drawItemCanvas(config);
        }
    });
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    initItems();
    
    // 监听 hiding 的点击事件
    const hiding = document.getElementById('hiding');
    if (hiding) {
        hiding.addEventListener('click', () => {
            showItems();
        });
    }

    // 监听 listBotton 的点击事件（用于收起）
    const listBotton = document.getElementById('listBotton');
    if (listBotton) {
        listBotton.addEventListener('click', () => {
            hideItems();
        });
    }
});
