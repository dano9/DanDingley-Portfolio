// const mainContent = document.getElementById("mainContent");
// const gameHud = document.getElementById("GameUI");
const immerseBttn = document.getElementById("immerse-switch");
const portfolioContent = document.querySelector(".page-box");
var isMobile = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) != null;
let immerseMode = false;
var time = 0;
var deltaTime = 0.05;
function Loop()
{
    time += deltaTime;
    GameLoop();
    pvUpdate();
    // PVUpdate();
    requestAnimationFrame(Loop);
}
function OpenPage()
{
    gameHud.style.display = "none";
    pvStart();
     Resize();
    //console.log("isMobile:" + isMobile);
    // PVStart();
    GameStart();
    Loop();
}
function Resize()
{
    if (isMobile)
    {
        immerseBttn.innerText = "Game View";
    }
    // portraitProjV = window.innerWidth < 700;
    // if (portraitProjV)
    // {
    //     mainContent.style.width = "92%";
    // }
    // else {mainContent.style.width = "70%";}
    // let mCRect = mainContent.getBoundingClientRect();
    
    GameResize();
    pvResize();
    // PVResize();
}
function SwitchImmersion()
{
    console.log("Switching immersion!");
    immerseMode = !immerseMode;
    if (immerseMode)
    {
        portfolioContent.style.display = "none";
        canvas.style.cursor = "none";
        gameHud.style.display = "block";
        if (isMobile)
        {
            mouseX = cWidth / 2;
            mouseY = cHeight / 2;
            immerseBttn.innerText = "Portfolio View";
        }
        else
        {
            immerseBttn.innerText = "Game View (P - toggle)";
        }
    }
    else
    {
        canvas.style.cursor = "auto";
        gameHud.style.display = "none";
        if (isMobile)
        {
            immerseBttn.innerText = "Game View";
        }
        else
        {
            immerseBttn.innerText = "Portfolio View (P)";
        }
        portfolioContent.style.display = "block";
        window.scrollTo(0,0);
    }
}

// immerseBttn.addEventListener("mouseover", function( event ) {   
//         event.target.style.backgroundColor = "rgba(255, 0, 242, 0.8)"; event.target.style.color = "#ffffff";}, false);
// immerseBttn.addEventListener("mouseout", function( event ) {   
//     event.target.style.backgroundColor = "rgba(255, 0, 242, 0.1)"; event.target.style.color = "#ffffff77";}, false);

immerseBttn.addEventListener("click", SwitchImmersion)

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "p":
            SwitchImmersion();
            break;
    }
});
window.addEventListener("resize", () => {
    Resize();
});
OpenPage();