var isExtend = false;
var isExMode = false; // 新增：标记是否处于 ex 模式（播放录音）
var typewriterTimer = null;
var textAfterImg = new Image();
textAfterImg.src = './res/UI/Text.png';
var fullText = ""; // 存储完整的文本
var currentTextIndex = 0; // 当前显示到哪个字符
var isWaitingForNextPage = false; // 是否正在等待翻页
var isTextFinished = false; // 文本是否已经全部播放完毕
var pageHistory = [0]; // 存储每一页的起始索引
var currentPageIndex = 0; // 当前显示的页码索引
var currentClickableAreas = []; // 存储当前页面的关键字点击区域
var deactivatedKeywords = {}; // 存储已被点击（变回默认颜色）的关键字状态
var tipsTimer = null; // 用于管理 tips 自动收合的计时器

/**
 * 关键字配置
 */
const keywordConfig = {
    1: { word: "恒星", color: "#fdd6dc", callback: "onKeywordStar1" },
    2: { word: "怀旧", color: "#fdeee9", callback: "onKeywordStar2" },
    3: { word: "母星", color: "#ba98ff", callback: "onKeywordStar3" },
    4: { word: "启程", color: "#a9ffe0", callback: "onKeywordStar4" },
    5: { word: "意义", color: "#f8e474", callback: "onKeywordStar5" },
    6: { word: "动摇", color: "#fc9f02", callback: "onKeywordStar6" },
    7: { word: "传达", color: "#a5c0f7", callback: "onKeywordStar7" }
};

/**
 * 绘制 tips 画布 (带圆角矩形和获得提示文本)
 */
function drawTipsCanvas(keyword) {
    const canvas = document.getElementById('tips');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = 3;
    const text = `*获得了“${keyword}”。`;

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
    ctx.fillText(text, width / 2, height / 2 + 1);
}

/**
 * 显示 tips 及其动画逻辑
 */
function showTips(keyword) {
    const tips = document.getElementById('tips');
    if (!tips) return;

    // 清除之前的计时器
    if (tipsTimer) {
        clearTimeout(tipsTimer);
    }

    // 绘制内容
    drawTipsCanvas(keyword);

    // 重置动画类以重新触发展开动画
    tips.classList.remove('anim-item-name-expand', 'anim-item-name-collapse');
    tips.style.display = 'block';
    tips.style.opacity = '1';
    // 强制重绘
    tips.offsetHeight;
    tips.classList.add('anim-item-name-expand');

    // 2s 后自动收合
    tipsTimer = setTimeout(() => {
        tips.classList.remove('anim-item-name-expand');
        tips.classList.add('anim-item-name-collapse');

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

/**
 * 处理关键字点击后的颜色重置和重绘
 */
function handleKeywordDeactivation(starId) {
    deactivatedKeywords[starId] = true;
    
    // 播放音效
    // 根据 starId 播放不同的音效（音效文件待引入）
    switch(starId) {
        case 1:
            playrec1.play();
            break;
        case 2:
            playrec2.play();
            break;
        case 3:
            playrec3.play();
            break;
        case 4:
            playrec4.play();
            break;
        case 5:
            playrec5.play();
            break;
        case 6:
            playrec6.play();
            break;
        case 7:
            playrec7.play();
            break;
    }

    if (typeof puttingSound !== 'undefined') {
        puttingSound.play();
    }
    
    // 解锁对应的物品
    if (typeof window.unlockItem === 'function') {
        window.unlockItem('rec-s' + starId);
    }
    
    // 显示获得了提示
    const config = keywordConfig[starId];
    if (config) {
        showTips(config.word);
    }
    
    // 如果文本已经播放完毕，立即重新渲染当前页以更新颜色
    if (isTextFinished) {
        const pageStart = pageHistory[currentPageIndex];
        renderText(fullText.substring(pageStart));
    }
}

// 定义公共点击函数
window.onKeywordStar1 = () => { console.log("点击了：恒星"); handleKeywordDeactivation(1); };
window.onKeywordStar2 = () => { console.log("点击了：怀旧"); handleKeywordDeactivation(2); };
window.onKeywordStar3 = () => { console.log("点击了：母星"); handleKeywordDeactivation(3); };
window.onKeywordStar4 = () => { console.log("点击了：启程"); handleKeywordDeactivation(4); };
window.onKeywordStar5 = () => { console.log("点击了：意义"); handleKeywordDeactivation(5); };
window.onKeywordStar6 = () => { console.log("点击了：动摇"); handleKeywordDeactivation(6); };
window.onKeywordStar7 = () => { console.log("点击了：传达"); handleKeywordDeactivation(7); };

/**
 * 初始化画布通用函数
 */
function initTextCanvas(id, x, y, z, src, onclick = null) {
    const canvas = document.getElementById(id);
    if (!canvas || !canvas.getContext) return;

    canvas.style.left = x + 'px';
    canvas.style.top = y + 'px';
    canvas.style.zIndex = z;
    canvas.style.opacity = '0';
    canvas.style.display = 'none';
    if (onclick) {
        canvas.style.cursor = 'pointer';
        canvas.onclick = onclick;
    }

    // 为 textAfter 特别添加关键字点击监听
    if (id === "textAfter") {
        // 点击监听
        canvas.addEventListener('click', (e) => {
            // --- 新增：如果打字机正在运行，点击立即完成当前页 ---
            if (typewriterTimer !== null) {
                e.stopPropagation();
                clearInterval(typewriterTimer);
                typewriterTimer = null;

                const textToType = fullText.substring(currentTextIndex);
                const result = renderText(textToType);

                if (result.hasOverflowed) {
                    // 记录分页信息
                    currentTextIndex += result.breakIndex;
                    pageHistory.push(currentTextIndex);
                    currentPageIndex++;
                } else {
                    // 全部文本播放完毕
                    isTextFinished = true;
                }
                showTextOver();
                return; // 跳过后续的关键字点击检查
            }

            // 只有在全部文本播放完毕后才启用关键字点击
            if (!isTextFinished) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // 检查点击是否落在任何关键字区域内
            for (const area of currentClickableAreas) {
                if (mouseX >= area.x && mouseX <= area.x + area.w &&
                    mouseY >= area.y && mouseY <= area.y + area.h) {
                    
                    if (typeof window[area.callback] === 'function') {
                        // 阻止冒泡，防止触发全局的翻页点击
                        e.stopPropagation();
                        window[area.callback]();
                        // 点击后立即更新手势
                        canvas.style.cursor = 'default';
                    }
                    break;
                }
            }
        });

        // 悬停监听：为关键字添加 pointer 手势
        canvas.addEventListener('mousemove', (e) => {
            // 只有在全部文本播放完毕后才启用
            if (!isTextFinished) {
                canvas.style.cursor = 'default';
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let isHoveringKeyword = false;
            for (const area of currentClickableAreas) {
                if (mouseX >= area.x && mouseX <= area.x + area.w &&
                    mouseY >= area.y && mouseY <= area.y + area.h) {
                    isHoveringKeyword = true;
                    break;
                }
            }

            canvas.style.cursor = isHoveringKeyword ? 'pointer' : 'default';
        });
    }

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);
    };
    img.src = src;
}

/**
 * 根据当前选择的星星返回对应的文本
 */
function whichText() {
    let text = "";
    const star = typeof window.chooseStar !== 'undefined' ? window.chooseStar : 0;

    switch (star) {
        case 1: 
        text = 
        `人死后会化为群星……逝者会在天上守望着我们……  
啊，抱歉，我明白这类说法已经丧失吸引力了。  
不……不，我并不是说我相信那些再也看不见他们身影的同胞
如今还在宇宙的一隅看着我们！不不不，我也不是想去否定对他们怀有的念想……我……  
我是亲眼目睹过的，所以我……怎样都无法否认，他们已经化为了我们所生活的环境中的一部分——以成为“月尘”的形式。  
但是，我是说……啊啊，可能也是出于某种念旧吧！随你们怎么想好了！可是留在了这里——选择了距离“全人类共同的母星”最近的这颗卫星作为居所的我们，又有多少人会……会不念旧呢……？  
总、总之！我明白出于这样的想法制作这幅我终其一生也无法独自完成的——或许永远也不会有完成之日的作品，肯定不会讨所有人喜欢……  
我大概不过是想要将希望继续怀抱下去吧……  
直到我体内来自恒星的元素回归这片宇宙之日。  




……说起来，这才是更流行的说法啊……`;
         break;
        case 2:
         text = `“念旧”……吗。其实我更喜欢“怀旧”和“复古”这样的词呢，也不知道还有多少人吃“复古风”那套。仔细一想，研究历史也能算是广义上的“怀旧”吧？更加大众的方式，说不定是阅读前人的作品呢？毕竟我们也借着所谓的“地利”，修建了收录作品足够齐全的档案馆，连电子游戏都能借。  
嗯，有种说法认为，这样的场所只是为了还活着的我们而建造。也不知道那个执着于群星的人有没有听说过，但这里简直是那句话的完美体现，谁让当我们化为月尘的时候就做不了这件事了呢？不不，我可没有諷刺的意思，不然也不会成为……嗯，“共同创作者”的一员了。  
我们为什么会在不知何时到来的某日，以化为尘埃的形式迎接终幕，这颗月球上的学者至今都没能得出确论，可我们再怎么说也得到了与之相称的益处，说实话，会有怨言的人大概也不多吧
只不过，我偶尔也会想啊——若是以这副身躯回归那抬头便可看见的故鄉的话，会不会……  
不，我明白的，发生在我们身上的改变已经不可逆转，我们已然成为了“月人”。  
就当这是极致怀旧的表现吧。
啊啊，若能再次归于蓝的话……`;
         break;
        case 3: 
        text = `那颗蓝色的星球，是多么令人眷恋啊……即便去档案馆就能够在模拟中体验咸味的海风、触碰海浪，感受某个季节的海洋的温度，从那里搬离的人也还是会对真实产生执着吧。  
如果月球上也有海洋就好了。  
我并非极致怀旧的人，我的情思与念想甚至让我认为，自己不应该融入这幅作品之中，自己的存在或许是对同样在此处的其他人的褻瀆。
可我仍在想着、希望着、祈愿着可以在永恒之中不去忘掉自己的海，仅此而已。  
啊啊，若要回忆起那抹蓝色，抬头仰望便是。  
我不要不会不再会忘却，这副将与我最深层的念想、与我的灵魂同在的身躯也一定会永恒不灭下去——  
母星啊，你是何等令人挚爱。`; 
        break;
        case 4: 
        text = `如果找身边的人说这些话，会不会被说是“想得太多”呢？我大概是因为有这种焦虑才会来这里的吧。  
在启程之前，我还担心过自己会不会因为想留下的想法与创作者最初的意图有偏差而不被接受，可……也不知道那个人是一开始就有打算还是后来才想到的，进来之前的说明看板还很贴心地写了“每个人都有各自的享受作品的方法”……  
怎么说呢，还挺让人安心的。  
唔，有些偏题了啊，但这应该也是个不错的切入点吧。  
我一直在想……那些研究者说的“会与仍未腐朽的精神一同不朽下去”，听着很好听，也很不可思议，但改成“会与精神一同消逝”就很可怕了啊。大家应该也是因为这点才会更多去创作和享受“作品”，以至于成为了这颗星球的社会特征了吧。  
现实里……大概是近一百年吧？月球上也只出现过五个案例来着……换句话说，或许就是人的精神会糜烂，但却不会那么轻易地化为“无”吧。  
只是，我也想过……其实我们所拥有的这份现状，在我们离开那颗星球之前，就已经是被确立好了的未来了——也说不定。  
也许我们刚好成为了某种实验品哦！明明形式听起来很奇幻啊。  
不过，科技发展到一定程度就会让人分不清科学与魔法的边界……不是吗？`; 
        break;
        case 5: 
        text = `一定不论在过去活着的人也好，未来将会生活在这片宇宙的人也好，都会为“全人类都离开了那颗蓝色的星球”这件事感到困惑与不可思议吧。  
撤出一颗星球哪有说着那么容易呢？以后的教科书上肯定也会写明时间的吧，那场“撤离”似乎持续了百年之久来着。  
明明是亲历者却要用不确定的语气……连我自己都觉得有点不好意思了。没办法，那件事从我出生之前就在进行了。  
我一直以为四散在宇宙之中的人类会建立起更加丰富的联络，嗯，一开始确实是那样没错，但最近那种频繁的联系似乎也渐渐沉寂了下来……可能，作为人类，我们在不知不觉间已经解离了很多事物了吧……  
如今我已经不再沉溺于鄉愁之中，对所处的这颗月球产生了眷恋，也逐渐活得越发安心了。  
在久远的未来，将地球之外的星球当作故鄉的人也会成为主流。但是，以人类整体的念旧程度来说，过往的事情一定会成为历史教科书的一部分，好让所有人都不会忘却那颗“全人类共同的母星”吧。  
这么一想，说不定连留在这里的记录也会在某日被当成史料……或者反过来，因为这些事肯定也已经有人进行记录了，所以这段记录并不存在那种价值。  
不过，我果然还是会想从自己的心中倾吐出这些所想啊，就算……没有宏观的意义可言。`; 
        break;
        case 6: 
        text = `这样就算是开始了吗……？  
啊，嗯，我……以前也来过这里，对，是作为参观者。  
当时还没有……想过自己会以别的身份再来，所以……还是有点犹豫的。  
已经做出了决定，却还是产生了动摇，可能我还是不够坚定吧。  
只不过，我还是忍不住会去想……  
我……  
我——  
我不那样悲伤，真的可以被允许吗？  
我肯定并非薄情寡义的人，也没有什么情感上的障碍……对，我是能充分享受作品中营造出的情感氛围的。可是当我将要成为某个“故事”的主角时，却沒有产生应该要符合此时的感情。  
我可以不那样悲伤吗？我可以不去让自己感到不舍吗？我可以用平淡的心境去迎接这个故事的开端，成为割下一簇头发留在此处的离去之人吗？即使……即使在仰望那抹蓝色的时候不产生鄉愁也是可以的吗……？  
即使成为了他处的尘土，也会有人想起我吗？  
……不……我……  
一定还会回来的。  
一定。`; 
        break;
        case 7: 
        text = `那个终于得偿所愿的她，曾向我道谢过。  
最初只是偶然，我刚好发现……她在听我的曲子。以此为契机，我和她说上了话。  
我是在后来才听说，她一直在尝试成为月尘的一部分。  
那一天，她问我：“你也能为我写一首曲子吗？”
但是，在曲子完成之后，我却……再也没有见到过她。  
大概过了很长一段时间吧，也可能是因为我对时间不太敏感……我才知道她已经离开了。  
她没有成为星星……她留下的话语在更久之后才被传递到我的眼前。  
她说：“谢谢你为我谱写的曲子，这样我就了无牵挂了。”  
……我……真的值得她感谢吗？  
我想……应该就是从那时候开始吧，迷茫逐渐弥漫在乐谱之上……  
我……也迷失了某件事的意义，或许是我之前从未思考过。  
去了解执着于此事的人们的话，是不是就能寻得那份意义了呢？  
我大概在这之后的旅途中，也不会放弃作曲这件事吧。  
如果在那颗星球上，我的曲子也能传达给某人的话就好了。`; 
        break;

        default: text = ""; 
        break;
    }
    return text;
}
function whichRecord(){
    let record = "";
    
    // 确保 itemConfigs 存在
    if (typeof itemConfigs === 'undefined') return record;

    // 查找当前选中的物品
    const chosenItem = itemConfigs.find(item => item.isChosen);
    
    if (!chosenItem) return record;

    switch (chosenItem.id) {
        case 'rec-s1': // case 0
            record = `“这是……发起者的？”  
“嗯，既是最开始被留下来的话，也是被阅览次数最多的星星。”  
“是吗，这个地方最初是依托于这样的情感建立起来的啊。”  
“……你读出了怎样的情感？”  
“悲伤和焦虑……然后还有不安。”  
“这样啊。”  
“……你呢？”  
“大体上和你一样，但……还多了一点吧。”  
“是什么？”  
“……渴望。”`;
            break;
        case 'rec-s2': // case 1
            record = `“墓地是为了让生者能够与死者划分界限而建造的场所……以前好像是有这种说法的。不过，在旧文明还没有形成的时候，人类似乎会将死者继续视为群体的一员，带着他们的骨骸一起转移。”  
“是吗……我们那边……虽然也没有墓地，但有个大家都不太愿意靠近的垃圾场。”  
“是……用来处理废弃躯体的地方吗……？”  
“嗯，但大家不愿意靠近是因为害怕。”  
“害怕……？”  
“……害怕看见自己。”  
“是……吗……”  
“我在离开前去看过了……那里只有让人分辨不出用于何处的零件而已，像是人类模样的东西……哪里都看不见。”`
;
            break;
        case 'rec-s3': // case 2
            record = `“明明对地球有感情的人那么多，我们却没有在那里碰到过第三个人。”  
“嗯……也许刚好和我们错过了吧，毕竟，那颗星球还挺大的。”  
“是呢。……我能问你一个问题吗？”  
“嗯。”  
“在我们相遇之前，你在那颗星球上独自旅行了多久？”  
“啊……嗯……有点记不清了呢，我……本来对时间也不太敏感，但……应该有两年以上吧。”
“……是吗。”`
;
            break;
        case 'rec-s4': // case 3
            record =`“……记得和我那边频繁来往的星球之一，就有靠实验改造实现不死后推广到全星球上的。”  
“这样啊……实验改造和你那边的方式很像呢。”  
“嗯。你……有想过月人为什么会变成现在这样吗？”  
“我不太懂这方面的知识呢……你有想到过什么吗？”  
“……受月球背面的某种因素影响引发的基因突变。第一次听你提起的时候，我就这样想过了。”  
“是吗……咦，第一次提的时候你就想过了吗……？”  
“嗯。……去下一处吧。”`;
            break;
        case 'rec-s5': // case 4
            record = `“是在指我们呢。”  
“是呢。但在这里（月球），还是把地球看作故鄉的人更多来着……我的家人也是。”  
“在我那边，已经不太有人还将某颗别的星球看作故鄉的观念了。虽然教科书上还在用‘全人类共同的母星’这样的形容。”  
“我们这边也是。我说……”  
“怎么了？”  
“你……对地球是怎么想的呢？”  
“……虽然并不被我视作故鄉，但是……大概，还算是中意的地方吧。”`;
            break;
        case 'rec-s6': // case 5
            record =`“是旧人类的传统吗？”  
“嗯。档案馆那边有记录，好像是……生活在草原上的人有过的习俗。如果部落里的人把一族头发割下后离去，那就相当于在部落中已经是死者了。”  
“不过，这个人说是一定会回来。”  
“嘛……因为，我们也不是旧人类了吧。而且……这也是一种对‘生’的执念，我以前来这里的时候有这么想过。”  
“……确实如此，可……这其中似乎有更深的执念。”  
“……是呢。你……也会希望我能一直记住你吗？”  
“……我会给你留下纪念品的。”`;
            break;
        case 'rec-s7': // case 6
            record =`“这是你留下的吗？”  
“……嗯，是我在决定启程后留的。”  
“你没和我说过这件事。”  
“啊，嗯。其实，我也不介意说的。”  
“……毕竟，我也从来没问过。你也没问过我为什么在追求葬身之地，所以也没什么。”  
“……谢谢。”  
“我说……”  
“嗯？”  
“你的曲子，最后有传达到她那边吗？”  
“……我也……不太清楚呢。”  
“是吗。”`;
            break;
        case 'latten': // case 7
            record = `“我知道bluemoon指的是同一个月份出现的第二次满月，记得后来引申出了其他的意思，但我们那边没有这种现象，意思也就跟着一起遗失了。”
“啊，没关系。我以前问过发起者……记得是指代‘罕见的事情’，但……在月球上，总能看见蓝色呢。”
“……就算一直在身边也不会让人厌烦啊。”
“蓝色吗？”
“……嗯。”`;
            break;
        default:
            record = "";
            break;
    }

    return record;
}
/**
 * 预计算所有分页的起始索引
 */
function precomputePageHistory(text) {
    const history = [0];
    let tempText = text;
    let offset = 0;
    
    while (true) {
        const result = renderText(tempText, true);
        if (result.hasOverflowed) {
            offset += result.breakIndex;
            history.push(offset);
            tempText = text.substring(offset);
        } else {
            break;
        }
    }
    return history;
}

/**
 * textBefore 的点击处理逻辑
 */
function clickTB(event) {
    if (event) event.stopPropagation(); // 阻止事件冒泡到 window，防止触发自动翻页

    const textAfter = document.getElementById("textAfter");
    const textBack = document.getElementById("textBack");
    const textBefore = document.getElementById("textBefore");

    // 获取当前星星的 SeeText 计数
    let currentSeeCount = 0;
    if (typeof window.chooseStar !== 'undefined' && window.chooseStar >= 1 && window.chooseStar <= 7) {
        const varName = 'SeeText' + window.chooseStar;
        if (typeof window[varName] !== 'undefined') {
            window[varName]++; // 增加计数
            currentSeeCount = window[varName];
        }
    }

    const originalAction = () => {
        // --- 非首次显示：立即准备文本并渲染，以便与入场动画同步 ---
        if (currentSeeCount > 1) {
            isExtend = true;
            isExMode = false; // 确保 ex 模式关闭
            fullText = whichText();
            isTextFinished = true;
            
            // 1. 彻底初始化状态变量
            currentPageIndex = 0;
            currentTextIndex = 0;
            pageHistory = precomputePageHistory(fullText); // 获取预计算的分页历史
            
            // 2. 立即进行渲染第一页
            const pageStart = pageHistory[0]; // 此时一定是 0
            renderText(fullText.substring(pageStart));
            
            // 注意：不在此处调用 showTextOver()，改在动画结束后调用，避免用户点击导致翻页
        }

        // 1. 播放进场动画
        [textAfter, textBack].forEach(el => {
            if (el) {
                el.style.display = 'block';
                el.classList.add('anim-bottom-in');

                const onEnd = () => {
                    el.style.opacity = '1';
                    el.classList.remove('anim-bottom-in');
                    
                    // 仅针对首次显示 (SeeText == 1) 的情况，保留 200毫秒延迟后的打字机播放
                    if (el.id === 'textAfter') {
                        if (currentSeeCount === 1) {
                            isExtend = true;
                            isExMode = false; // 确保 ex 模式关闭
                            setTimeout(() => {
                                if (isExtend) {
                                    fullText = whichText();
                                    currentTextIndex = 0;
                                    pageHistory = [0];
                                    currentPageIndex = 0;
                                    isTextFinished = false;
                                    startTypewriter();
                                }
                            }, 200);
                        } else if (currentSeeCount > 1) {
                            // 非首次显示：动画结束后显示翻页提示，确保canvas已完全准备好
                            showTextOver();
                        }
                    }
                    el.removeEventListener('animationend', onEnd);
                };
                el.addEventListener('animationend', onEnd);
            }
        });
    };

    // 仅在初次阅读 (currentSeeCount === 1) 时触发 talking 对话框
    if (currentSeeCount === 1 && typeof window.showTalkingUI === 'function') {
        window.showTalkingUI(2, originalAction);
    } else {
        // 如果不是初次阅读，或者 UI.js 未加载，则直接执行原始操作
        originalAction();
    }
}
window.clickTB = clickTB;

/**
 * ex1 / ex2 的点击处理逻辑
 */
function clickEx(event) {
    if (event) event.stopPropagation();

    // 互斥逻辑：如果当前已有文本在展示（isExtend 为 true），或者是等待翻页状态，则不响应
    if (isExtend || isWaitingForNextPage) return;

    // 播放点击音效
    if (typeof exSound !== 'undefined' && exSound.play) {
        exSound.play();
    }

    const textAfter = document.getElementById("textAfter");
    const textBack = document.getElementById("textBack");
    
    // 确定当前选中的物品
    let chosenItemId = null;
    if (typeof itemConfigs !== 'undefined') {
        const chosen = itemConfigs.find(c => c.isChosen);
        if (chosen) chosenItemId = chosen.id;
    }

    if (!chosenItemId) return;

    // 获取当前物品的 SeeRecord 计数
    // 使用全局对象 window.SeeRecordCounts 来存储，如果不存在则初始化
    if (typeof window.SeeRecordCounts === 'undefined') {
        window.SeeRecordCounts = {};
    }
    if (typeof window.SeeRecordCounts[chosenItemId] === 'undefined') {
        window.SeeRecordCounts[chosenItemId] = 0;
    }
    window.SeeRecordCounts[chosenItemId]++;
    const currentSeeCount = window.SeeRecordCounts[chosenItemId];

    const originalAction = () => {
        // 设置状态
        isExtend = true;
        isExMode = true; // 开启 ex 模式
        fullText = whichRecord();
        
        // 如果没有文本，直接退出
        if (!fullText) {
            isExtend = false;
            isExMode = false;
            return;
        }

        // --- 逻辑分支：首次阅读 vs 非首次阅读 ---
        // 首次阅读：打字机效果
        // 非首次阅读：直接显示全文的第一页
        
        if (currentSeeCount > 1) {
            isTextFinished = true;
            currentPageIndex = 0;
            currentTextIndex = 0;
            pageHistory = precomputePageHistory(fullText);
            
            // 立即渲染第一页
            const pageStart = pageHistory[0];
            renderText(fullText.substring(pageStart));
        }

        // 播放进场动画
        [textAfter, textBack].forEach(el => {
            if (el) {
                el.style.display = 'block';
                el.classList.add('anim-bottom-in');

                const onEnd = () => {
                    el.style.opacity = '1';
                    el.classList.remove('anim-bottom-in');
                    
                    if (el.id === 'textAfter') {
                        if (currentSeeCount === 1) {
                            // 首次阅读：延迟播放打字机
                            isExtend = true;
                            // 保持 isExMode = true
                            setTimeout(() => {
                                if (isExtend) {
                                    // 重新获取文本（防止异步变化，虽不太可能）
                                    fullText = whichRecord();
                                    currentTextIndex = 0;
                                    pageHistory = [0];
                                    currentPageIndex = 0;
                                    isTextFinished = false;
                                    startTypewriter();
                                }
                            }, 200);
                        } else {
                            // 非首次：直接显示翻页提示
                            showTextOver();
                        }
                    }
                    el.removeEventListener('animationend', onEnd);
                };
                el.addEventListener('animationend', onEnd);
            }
        });
    };

    // 首次阅读时触发 talking UI (case 5)
    if (currentSeeCount === 1 && typeof window.showTalkingUI === 'function') {
        window.showTalkingUI(5, originalAction);
    } else {
        originalAction();
    }
}
window.clickEx = clickEx; // 暴露给全局，供 UI.js 调用

/**
 * 渲染打字机文本
 * 返回是否超出高度以及截断位置
 * @param {string} text 要渲染的文本
 * @param {boolean} isVirtual 是否为虚拟渲染（仅计算分页，不实际绘制到画布）
 */
function renderText(text, isVirtual = false) {
    const canvas = document.getElementById("textAfter");
    if (!canvas) return { hasOverflowed: false, breakIndex: text.length };
    const ctx = canvas.getContext("2d");
    
    if (!isVirtual) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (textAfterImg.complete && textAfterImg.naturalHeight !== 0) {
            ctx.drawImage(textAfterImg, 0, 0);
        }
        currentClickableAreas = []; // 仅在实际渲染时重置点击区域
    }
    
    const defaultColor = '#cbdbfc';
    ctx.fillStyle = defaultColor;
    ctx.font = '30px Silver'; 
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const startX = 8, maxWidth = 762, lineHeight = 40, maxHeight = 404;
    let x = startX;
    let y = 8;
    let hasOverflowed = false;
    let i = 0;

    // 获取当前星星的关键字配置
    const star = typeof window.chooseStar !== 'undefined' ? window.chooseStar : 0;
    const config = keywordConfig[star];

    // 获取当前页面的完整文本，用于预判关键字位置
    const pageFullText = isVirtual ? text : fullText.substring(pageHistory[currentPageIndex]);
    const keywordIndices = [];
    if (config && config.word) {
        let pos = pageFullText.indexOf(config.word);
        while (pos !== -1) {
            keywordIndices.push(pos);
            pos = pageFullText.indexOf(config.word, pos + 1);
        }
    }

    while (i < text.length) {
        const char = text[i];
        
        // 处理手动换行符
        if (char === '\n') {
            if (y + lineHeight * 2 > maxHeight) {
                hasOverflowed = true;
                i++; // 消耗掉这个换行符，下一页从它之后开始
                break;
            }
            y += lineHeight;
            x = startX;
            i++;
            continue;
        }

        // 检查关键字匹配
        let isKeywordMatch = false;
        // 如果当前位置是关键字起点，且完整关键字已在当前 text 中，则走整块处理逻辑（为了记录点击区域）
        if (config && keywordIndices.includes(i) && text.substring(i, i + config.word.length) === config.word) {
            isKeywordMatch = true;
        }

        const stringToMeasure = isKeywordMatch ? config.word : char;
        const stringWidth = ctx.measureText(stringToMeasure).width;

        // 自动换行逻辑
        if (x + stringWidth > startX + maxWidth) {
            // 检查：如果下一行超出了最大高度，则在此处截断
            if (y + lineHeight * 2 > maxHeight) { 
                hasOverflowed = true;
                // 注意：当前的字符/关键字应该属于下一页
                break;
            }
            y += lineHeight;
            x = startX;
        }

        // 实际绘制逻辑
        if (!isVirtual) {
            const isDeactivated = deactivatedKeywords[star];
            // 检查当前单个字符是否属于关键字的一部分
            const isPartOfKeyword = config && keywordIndices.some(idx => i >= idx && i < idx + config.word.length);

            if (isKeywordMatch) {
                // 完整关键字绘制
                ctx.fillStyle = isDeactivated ? defaultColor : config.color;
                ctx.fillText(config.word, x, y);
                
                // 只有在未被点击（变回默认颜色）的情况下才记录点击区域
                if (!isDeactivated) {
                    currentClickableAreas.push({
                        x: x,
                        y: y,
                        w: stringWidth,
                        h: lineHeight,
                        callback: config.callback
                    });
                }
                
                ctx.fillStyle = defaultColor; // 恢复默认颜色
            } else {
                // 普通字符绘制（如果是关键字的一部分，则提前变色）
                if (isPartOfKeyword) {
                    ctx.fillStyle = isDeactivated ? defaultColor : config.color;
                }
                ctx.fillText(char, x, y);
                if (isPartOfKeyword) {
                    ctx.fillStyle = defaultColor;
                }
            }
        }

        // 更新索引和 X 坐标
        if (isKeywordMatch) {
            i += config.word.length;
            x += stringWidth;
        } else {
            i++;
            x += stringWidth;
        }
    }

    return {
        hasOverflowed: hasOverflowed,
        breakIndex: i
    };
}

/**
 * 启动打字机效果
 */
function startTypewriter() {
    if (typewriterTimer) clearInterval(typewriterTimer);
    
    const textToType = fullText.substring(currentTextIndex);
    let localIndex = 0;
    
    typewriterTimer = setInterval(() => {
        if (localIndex <= textToType.length) {
            const currentSub = textToType.substring(0, localIndex);
            const result = renderText(currentSub);
            
            if (result.hasOverflowed) {
                // 停止显示并处理分页
                clearInterval(typewriterTimer);
                typewriterTimer = null;
                showTextOver();
                // 使用 renderText 返回的精确截断位置更新全局索引
                currentTextIndex += result.breakIndex; 
                // 记录下一页的起始索引
                pageHistory.push(currentTextIndex);
                currentPageIndex++;
            } else {
                // 播放音效：仅当新文字出现且不是空白字符时
                if (localIndex > 0) {
                    const char = textToType[localIndex - 1];
                    if (char?.trim() && !/[……。，！？：“”——、]/.test(char)) {
                        if (isExMode) {
                            if (typeof textHer1Sound !== 'undefined' && textHer1Sound.play) {
                                textHer1Sound.play();
                            }
                        } else {
                            playTextSound();
                        }
                    }
                }
                
                localIndex++;
                if (localIndex > textToType.length) {
                    // 所有文本播放完毕，同样显示 text-Over1
                    clearInterval(typewriterTimer);
                    typewriterTimer = null;
                    isTextFinished = true; // 标记全部结束
                    showTextOver();
                }
            }
        }
    }, 100);
}

/**
 * 根据当前星星序号播放对应的打字机音效
 */
function playTextSound() {
    const star = typeof window.chooseStar !== 'undefined' ? window.chooseStar : 0;
    let sound = null;

    // 根据序号获取对应的音效对象
    // 注意：这些音效在 sounds.js 中定义为全局常量
    try {
        switch (star) {
            case 1: if (typeof text1Sound !== 'undefined') sound = text1Sound; break;
            case 2: if (typeof text2Sound !== 'undefined') sound = text2Sound; break;
            case 3: if (typeof text3Sound !== 'undefined') sound = text3Sound; break;
            case 4: if (typeof text4Sound !== 'undefined') sound = text4Sound; break;
            case 5: if (typeof text5Sound !== 'undefined') sound = text5Sound; break;
            case 6: if (typeof text6Sound !== 'undefined') sound = text6Sound; break;
            case 7: if (typeof text7Sound !== 'undefined') sound = text7Sound; break;
        }
        
        if (sound && typeof sound.play === 'function') {
            sound.play();
        }
    } catch (e) {
        console.warn('播放文本音效失败:', e);
    }
}

/**
 * 显示继续提示 (text-Over1)
 */
function showTextOver() {
    const textOver = document.getElementById("text-Over1");
    if (textOver) {
        textOver.style.display = 'block';
        textOver.style.opacity = '1';
        isWaitingForNextPage = true;
    }
}

/**
 * 隐藏继续提示 (text-Over1)
 */
function hideTextOver() {
    const textOver = document.getElementById("text-Over1");
    if (textOver) {
        textOver.style.display = 'none';
        textOver.style.opacity = '0';
        isWaitingForNextPage = false;
    }
}

/**
 * 全局点击监听，用于翻页
 */
window.addEventListener('click', (e) => {
    // 如果点击发生在 UI 图层、bUI 图层或物品图层内，不触发翻页/退出
    if (e.target.closest('#UI, #bUI, #item')) return;

    // 只有在“等待翻页”状态下才处理
    if (!isWaitingForNextPage) return;

    if (!isTextFinished) {
        // 1. 打字机模式下的翻页（文本未显示完）
        hideTextOver();
        startTypewriter();
    } else {
        // 2. 文本已显示完（非首次显示进入，或首次显示播放完毕）
        // 如果当前还没到最后一页，点击可以翻到下一页
        if (currentPageIndex < pageHistory.length - 1) {
            navigatePage(1);
        } else {
            // 如果已经是最后一页，且文本已播放完毕，点击自动触发返回逻辑
            clickTextBack();
        }
    }
});

/**
 * 键盘与滚轮监听，用于历史翻页
 */
window.addEventListener('keydown', (e) => {
    if (!isTextFinished) return;
    
    if (e.key === 'ArrowUp') {
        navigatePage(-1);
    } else if (e.key === 'ArrowDown') {
        navigatePage(1);
    }
});

window.addEventListener('wheel', (e) => {
    if (!isTextFinished) return;
    
    if (e.deltaY < 0) {
        navigatePage(-1); // 向上滚
    } else if (e.deltaY > 0) {
        navigatePage(1); // 向下滚
    }
});

/**
 * 历史翻页导航
 */
function navigatePage(direction) {
    const newIndex = currentPageIndex + direction;
    if (newIndex >= 0 && newIndex < pageHistory.length) {
        currentPageIndex = newIndex;
        const pageStart = pageHistory[currentPageIndex];
        // 静态渲染该页内容
        renderText(fullText.substring(pageStart));
    }
}

/**
 * textBack 的点击处理逻辑（退出）
 */
function clickTextBack() {
    // 只有当文本全部播放完毕后，返回按钮才可用
    if (!isTextFinished) return;

    const textAfter = document.getElementById("textAfter");
    const textBack = document.getElementById("textBack");
    const listBotton = document.getElementById("listBotton");
    const hiding = document.getElementById("hiding");

    isExtend = false;
    isExMode = false; // 重置 ex 模式
    isWaitingForNextPage = false;
    isTextFinished = false; // 重置结束状态
    
    // 彻底重置所有分页和索引状态
    currentTextIndex = 0;
    pageHistory = [0];
    currentPageIndex = 0;
    fullText = "";

    hideTextOver();
    
    if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
    }
    renderText("");

    [textAfter, textBack].forEach(el => {
        if (el) {
            el.classList.add('anim-bUI-leave');
            const onEnd = () => {
                el.style.opacity = '0';
                el.style.display = 'none';
                el.classList.remove('anim-bUI-leave');
                el.removeEventListener('animationend', onEnd);
            };
            el.addEventListener('animationend', onEnd);
        }
    });

    if (listBotton) listBotton.style.pointerEvents = 'auto';
    if (hiding) hiding.style.pointerEvents = 'auto';
}

/**
 * 初始化 tips 画布样式
 */
function initTipsCanvas() {
    const canvas = document.getElementById("tips");
    if (!canvas) return;

    canvas.style.left = '432px';
    canvas.style.top = '11px';
    canvas.style.zIndex = '6';
    canvas.style.opacity = '0';
    canvas.style.display = 'none';
}

// 统一初始化
window.addEventListener('load', () => {
    initTextCanvas("textBefore", 432, 237, 1, './res/lighting/text.png', clickTB);
    initTextCanvas("textAfter", 180, 64, 5, './res/UI/Text.png');
    initTextCanvas("textBack", 32, 24, 6, './res/UI/back.png', clickTextBack);
    initTextCanvas("text-Over1", 939, 471, 6, './res/UI/talking-over.png');
    initTipsCanvas();
});
