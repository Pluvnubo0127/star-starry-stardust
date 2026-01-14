function loadBgImg(url,canvas){
    var bgCxt = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    //绘制图片
    var img = new Image();
    img.onload = function(){
        bgCxt.drawImage(this,0,0,width,height);
    }
    img.src = url;
}

function drawStarskyBG() {
    var canvas = document.getElementById("starskyBG");
    if (!canvas || !canvas.getContext) return;
    var url = './res/bg-stars.png';
    loadBgImg(url, canvas);
}

