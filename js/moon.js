function drawMoon() {
    var moonCanvas = document.getElementById("moon");
    if (!moonCanvas || !moonCanvas.getContext) return;
    
    var moonCxt = moonCanvas.getContext("2d");
    var width = moonCanvas.width;
    var height = moonCanvas.height;
    
    var moonImg = new Image();
    moonImg.onload = function() {
        // 清除画布并绘制月亮
        // 如果 moon.png 是背景大小的透明图，直接 0,0 绘制即可
        // 如果不是，可能需要调整位置，但根据用户要求“坐标位置全都与bgCanvas一样”，
        // 这里的 canvas 已经和 bgCanvas 重合了，所以直接绘制。
        moonCxt.clearRect(0, 0, width, height);
        moonCxt.drawImage(this, 0, 0, width, height);
    };
    moonImg.src = './res/moon.png';
}
