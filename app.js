import AppBehavior from "./appBehavior.js";
import { GameStart, GameResize, GameLoop, GameSwitch} from "./InteractiveBG.js";
import OtherProjectViewer from "./otherProjectsView.js";
import ProjectsView from "./projectsView.js";

class RootApp extends AppBehavior
{
    constructor(parentApp)
    {
        super(parentApp);
        this.time = 0;
        this.rootApp = this;
        this.projectsView = new ProjectsView(this);
    }
    start()
    {
        this.gameSwitch();
        GameResize();
        GameStart();
        console.log("game initiated", window.isMobile);
        this.opv = new OtherProjectViewer();
        this.opv.start();

        super.start();

        this.update();
    }
    update()
    {
        const newTime = performance.now() / 1000;
        this.deltaTime = newTime - this.time;
        this.time = newTime;
        GameLoop(this.deltaTime * 2);
        // console.log("dt:", this.deltaTime);
        this.opv.update();
        super.update();
        requestAnimationFrame(()=>this.update());
    }
    onResize()
    {
        super.onResize();
        GameResize();
        this.opv.resize();
    }
    gameSwitch()
    {
        console.log("Switching gameFocus!");
        window.gameFocused = !window.gameFocused;
        GameSwitch(window.gameFocused);
        if (window.gameFocused)
        {
            portfolioContent.style.display = "none";
            if (isMobile)
            { gameSwitchBtn.innerText = "Profile"; }
            else
            { gameSwitchBtn.innerText = "Game View (P - toggle)"; }
        }
        else
        {
            if (isMobile)
            { gameSwitchBtn.innerText = "Game"; }
            else
            { gameSwitchBtn.innerText = "Portfolio View (P)"; }
            portfolioContent.style.display = "block";
            window.scrollTo(0,0);
        }
    }
}


window.isMobile = (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || 
    navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || 
    navigator.userAgent.match(/Windows Phone/i)) != null;

window.gameFocused = true;





let app = new RootApp();

window.addEventListener("resize", () => {
    app.onResize();
});
document.addEventListener("keydown", (event) => {
    if (event.key == "p") {app.gameSwitch(); gameSwitchBtn.blur();}
});
const portfolioContent = document.querySelector(".page-box");
const gameSwitchBtn = document.getElementById("gameview-switch");
gameSwitchBtn.addEventListener("click", app.gameSwitch);
gameSwitchBtn.addEventListener("mouseup", ()=>{setTimeout(document.body.focus(),200);});

app.start();