/**
 * --- howler.js 音频管理 ---
 * 
 * Howler.js 是一个现代化的 JavaScript 音频库，它简化了 Web Audio API 的复杂性。
 * 
 * 使用步骤说明：
 * 1. 实例化 Howl 对象：通过 `new Howl({...})` 创建一个音频实例。
 * 2. 配置参数：
 *    - src: 音频资源的路径（建议使用数组，可以包含多种格式如 ['sound.mp3', 'sound.ogg'] 以提高兼容性）。
 *    - volume: 设置音量，范围从 0.0 到 1.0。
 *    - onload: 音频加载完成后的回调函数。
 *    - onplay: 音频开始播放时的回调函数。
 * 3. 常用方法：
 *    - .play(): 播放音频。
 *    - .pause(): 暂停音频。
 *    - .stop(): 停止音频并重置播放进度。
 *    - .fade(from, to, duration): 在指定时间内平滑改变音量（淡入淡出）。
 */
const dropSound = new Howl({
    src: ['./res/sounds/drop.mp3'], // 音频文件路径，相对于 HTML 文件
    volume: 0.6,                    // 默认音量大小
    onloaderror: function() {
        console.error('dropSound 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
});

const walkingSound = new Howl({
    src: ['./res/sounds/walking.mp3'],
    volume: 0.6,
});

const exSound = new Howl({
            src: ['./res/sounds/playrec/unbuckle3.mp3'],
            volume: 0.2,
            onplay: function() {
                isExSoundPlaying = true;
            },
            onend: function() {
                isExSoundPlaying = false;
            },
            onloaderror: function(id, err) {
                console.error('Ex 音频加载出错:', err);
                isExSoundPlaying = false;
            }
        });
const checkSound = new Howl({
            src: ['./res/sounds/putting_a_pen.mp3'],
            volume: 0.3,
            });

const puttingSound = new Howl({
    src: ['./res/sounds/putting_a_glass1.mp3'],
     volume: 0.1,    
});

const text1Sound = new Howl({
    src:['./res/sounds/talking/note/会話1_単音.mp3'],
    volume: 0.1,
})

const text2Sound = new Howl({
    src:['./res/sounds/talking/note/会話3_単音.mp3'],
    volume: 0.1,
})

const text3Sound = new Howl({
    src:['./res/sounds/talking/note/会話7_単音.mp3'],
    volume: 0.1,
})

const text4Sound = new Howl({
    src:['./res/sounds/talking/note/会話8_単音.mp3'],
    volume: 0.1,
})

const text5Sound = new Howl({
    src:['./res/sounds/talking/note/会話9_単音.mp3'],
    volume: 0.1,
})

const text6Sound = new Howl({
    src:['./res/sounds/talking/note/会話13_単音.mp3'],
    volume: 0.1,
})

const text7Sound = new Howl({
    src:['./res/sounds/talking/note/会話14_単音.mp3'],
    volume: 0.1,
})

const textHer1Sound = new Howl({
    src:['./res/sounds/talking/note/会話20_単音.mp3'],
    volume: 0.1,
})
const textHer2Sound = new Howl({
    src:['./res/sounds/talking/note/会話14_単音.mp3'],
    volume: 0.1,
})
const textBottomSound = new Howl({
    src:['./res/sounds/talking/note/会話1_単音.mp3'],
    volume: 0.1,
})

// playrec 音效定义，添加 BGM 暂停/恢复逻辑
const playrec1 = new Howl({
    src: ['./res/sounds/playrec/04_記憶_うつしよのながめ - from みそめ.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec2 = new Howl({
    src: ['./res/sounds/playrec/02_鏡像_夏の水たまり - from 懐夏.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec3 = new Howl({
    src: ['./res/sounds/playrec/01_記憶_あめのはじまり - from acidic.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec4 = new Howl({
    src: ['./res/sounds/playrec/07_余韻_花ひらく.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec5 = new Howl({
    src: ['./res/sounds/playrec/06_記憶_またいつか - from またいつかどこかで.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec6 = new Howl({
    src: ['./res/sounds/playrec/05_余韻_一雫の雨.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

const playrec7 = new Howl({
    src: ['./res/sounds/playrec/07_記憶_くろいばら - from あなたはあくまでわたしのもの.mp3'],
    volume: 0.6,
    onplay: function() { if(typeof pauseGameBGM === 'function') pauseGameBGM(); },
    onend: function() { if(typeof resumeGameBGM === 'function') resumeGameBGM(); }
})

//通常BGM



const BGM1 = new Howl({
    src: ['./res/sounds/BGM/十六夜_orgel_コニシユカ.mp3'],
    volume: 0.6,
    onend: function() { playNextGameBGM(); },
    onloaderror: function() {
        console.error('BGM1 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
})

const BGM2 = new Howl({
    src: ['./res/sounds/BGM/にゃるぱかBGM工房_-_深い夜に浮かぶ.mp3'],   
    volume: 0.6,
    onend: function() { playNextGameBGM(); },
    onloaderror: function() {
        console.error('BGM2 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
})

const BGM3 = new Howl({
    src: ['./res/sounds/BGM/最後の夏_コニシユカ.mp3'],
    volume: 0.6,
    onend: function() { playNextGameBGM(); },
    onloaderror: function() {
        console.error('BGM3 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
})

//片尾曲
const BGMEnding = new Howl({
    src: ['./res/sounds/BGM/朝き夢_コニシユカ.mp3'],
    volume: 0.6,
    loop: true,
    onloaderror: function() {
        console.error('BGMEnding 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
})

const BGMOpening = new Howl({
    src: ['./res/sounds/BGM/波の聲をきく_orgel_コニシユカ.mp3'],
    volume: 0.6,
    loop: true,
    onloaderror: function() {
        console.error('BGMOpening 加载失败：请使用 Live Server 或其他HTTP服务器打开');
    }
})

// --- BGM 管理逻辑 ---

let currentBGM = null;
let bgmList = [BGM1, BGM2, BGM3];
let currentBGMIndex = 0;
let isGameBGMStarted = false;
let isEnding = false;

// 播放下一首游戏BGM
function playNextGameBGM() {
    if (!isGameBGMStarted || isEnding) return;
    
    // 确定下一首的索引
    // 注意：这里我们是当上一首结束时调用，所以应该播放 (index + 1)
    // 但如果是第一次启动 (currentBGM 为空)，则播放 index 0
    
    if (currentBGM) {
        currentBGMIndex = (currentBGMIndex + 1) % bgmList.length;
    } else {
        currentBGMIndex = 0;
    }

    currentBGM = bgmList[currentBGMIndex];
    currentBGM.play();
    // 淡入效果 (可选，根据需求调整，这里仅在第一首可能需要，或者切歌时平滑过渡)
    // 需求中只提到 "BGM1淡入"，后续循环并未明确要求淡入淡出，但为了平滑可以加上
    // currentBGM.fade(0, 0.2, 1000); 
}

// 暴露给全局的控制函数

window.startOpeningBGM = function() {
    if (isEnding) return;
    BGMOpening.volume(0);
    BGMOpening.play();
    BGMOpening.fade(0, 0.2, 2000);
}

window.startGameBGM = function() {
    if (isEnding) return;
    
    // BGMOpening 淡出
    if (BGMOpening.playing()) {
        BGMOpening.fade(0.2, 0, 2000);
        BGMOpening.once('fade', () => {
            BGMOpening.stop();
        });
    }

    isGameBGMStarted = true;
    currentBGMIndex = 0;
    currentBGM = bgmList[0];
    
    // BGM1 淡入
    currentBGM.volume(0);
    currentBGM.play();
    currentBGM.fade(0, 0.2, 2000);
}

window.pauseGameBGM = function() {
    if (currentBGM && currentBGM.playing()) {
        currentBGM.pause();
    }
}

window.resumeGameBGM = function() {
    if (currentBGM && !currentBGM.playing() && isGameBGMStarted && !isEnding) {
        currentBGM.play();
    }
}

window.startEndingBGM = function() {
    isEnding = true;
    isGameBGMStarted = false;
    
    if (currentBGM) {
        currentBGM.stop();
    }
    
    // 确保 Opening 也停止
    if (BGMOpening.playing()) {
        BGMOpening.stop();
    }

    BGMEnding.volume(0);
    BGMEnding.play();
    BGMEnding.fade(0, 0.2, 2000);
}
