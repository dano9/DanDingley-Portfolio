const mainContent = document.getElementById("mainContent");
const gameHud = document.getElementById("GameUI");

var isMobile = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) != null;

var time = 0;
function Loop()
{
    time += 0.05;
    GameLoop();
    PVUpdate();
    requestAnimationFrame(Loop);
}
function OpenPage()
{
    Resize();
    //console.log("isMobile:" + isMobile);
    PVStart();
    GameStart();
    Loop();
}
OpenPage();

window.addEventListener("resize", () => {
    Resize();
});
function Resize()
{
    let mCRect = mainContent.getBoundingClientRect();
    portraitProjV = mCRect.width < 500;
    GameResize();
    PVResize();
   // mainContent.style.minWidth = "10px";
    if (isMobile)
    {
        //mainContent.style.width = Math.min(window.innerWidth * 0.48, 1000) + "px";
    }
    
    //if (!isMobile) 
    {mainContent.style.marginLeft = ((window.innerWidth - mCRect.width) * 0.5) + "px";}
    //else
    //{mainContent.style.marginLeft = ((window.innerWidth - mCRect.width) * 0.25) + "px";}
    //else {mainContent.style.padding = "15px";}
    //console.log(mainContent.style.maxWidth);
    //mainContent.style.padding = "50px";

    
    console.log("portrait:" + portraitProjV);

    gameHud.style.maxWidth = Math.min(Math.max(window.innerWidth * 0.9, 200), 1000) + "px";
    gameHud.style.width = Math.min(Math.max(window.innerWidth * 0.6, 200), 1000) + "px";
    let gHRect = gameHud.getBoundingClientRect();
    gameHud.style.marginTop = (mCRect.height + (window.innerHeight * 1.8)) + "px";
    //if (!isMobile) 
    {}

    let pad = Math.round(0.13 * gHRect.width);
    if (!portraitProjV) 
    {
        gameHud.style.display = "flex";
        gameHud.style.height = 80 + "px";
        gameHud.style.marginLeft = ((window.innerWidth - gHRect.width) * 0.5) + "px";
        document.getElementById("wormLength").style.paddingLeft = pad + "px";
        document.getElementById("highScore").style.paddingLeft = pad + "px";
        document.getElementById("wormRound").style.paddingLeft = pad + "px";
    }
    else
    {
        gameHud.style.display = "inline";
        gameHud.style.width = 100 + "%";
        gameHud.style.height = 150 + "px";
        gHRect = gameHud.getBoundingClientRect();
        gameHud.style.marginLeft = ((window.innerWidth - gHRect.width) * 0.5) + "px";
        document.getElementById("wormLength").style.paddingLeft = 20 + "px";
        document.getElementById("highScore").style.paddingLeft = 20 + "px";
        document.getElementById("wormRound").style.paddingLeft = 20 + "px";
    }
}
