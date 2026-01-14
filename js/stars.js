function loadStarImg(url, canvas, x, y, width, height) {
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = url;
}

function drawStars() {
    const starsData = [
        { id: 'star-1', x: 29, y: 27, w: 40, h: 53 },
        { id: 'star-2', x: 239, y: 253, w: 53, h: 47 },
        { id: 'star-3', x: 99, y: 495, w: 42, h: 50 },
        { id: 'star-4', x: 519, y: 457, w: 34, h: 49 },
        { id: 'star-5', x: 1005, y: 535, w: 46, h: 46 },
        { id: 'star-6', x: 1035, y: 127, w: 39, h: 43 },
        { id: 'star-7', x: 575, y: 33, w: 41, h: 50 }
    ];

    starsData.forEach(star => {
        const canvas = document.getElementById(star.id);
        if (canvas) {
            // 初始设置为透明状态且未被点亮
            canvas.style.opacity = '0';
            canvas.islighted = false;
            const url = `./res/stars/${star.id}.png`;
            loadStarImg(url, canvas, 0, 0, star.w, star.h);
        }
    });
}
