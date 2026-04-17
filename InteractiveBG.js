
const background = document.querySelector(".background");
let bgDimensions = background.getBoundingClientRect();
const canvas = document.createElement("canvas");
canvas.width = bgDimensions.width;
canvas.height = bgDimensions.height;
background.appendChild(canvas);

const titleUI = document.getElementById("title");
const gameHud = document.getElementById("game-hud");

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = "green";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const pixelSize = 8;
const scaling = 1;

let cWidth = bgDimensions.width / scaling;
let cHeight = bgDimensions.height / scaling;

let mouseX =0; let mouseY = 0;
let mouseTargX =0; let mouseTargY=0;
let startTapX = 0;
let startTapY = 0;
let mouseMoved = false;
let isCirclingTitle;
let lockedToMouse=false;

const wormList = [];
const wormLength = 10;
const wormSpeed = 4;
let mWormLength = 20;
let mWormBankd = 0;
let drawnMWorm = false;
let lastBiteTime = 0;
let lastSplitPoint;
let splitEffectFrame = -1;
let round = 0;
let pinkieLevel = 1;
let wCI = 0;
let highScore = 0;
let lastPortfolioScrolPos = 0;

let mousePoses = [];
let detachdMPs = [];

var GameLoop = function Loop() {
    Update();
    Render();
    // requestAnimationFrame(GameLoop);
    return true;
}
var GameStart = function Start()
{
    window.scrollTo(0,0);
    mouseY = canvas.height / 2;
    mouseX = canvas.width / 2;
    SetupEvents();
    mWormLength = 12;
    ctx.scale(scaling,scaling);
    canvas.width = bgDimensions.width;
    canvas.height = bgDimensions.height;
    cWidth = canvas.width /scaling;
    cHeight = canvas.height /scaling;
    //if (isMobile)
    {
    //ctx.fillStyle = "purple";
    }
    //else
    {
        ctx.fillStyle = "black";
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    GameLoop();
    return true;
}

let touchHandler = function(event) {
    if (immerseMode)
    {
        let x = 0, y = 0;
    
        if (event.touches && event.touches[0]) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
            x = event.originalEvent.changedTouches[0].clientX;
            y = event.originalEvent.changedTouches[0].clientY;
        } else if (event.clientX && event.clientY) {
            x = event.clientX;
            y = event.clientY;
        }
        if (event.type == "touchstart")
        {
            //console.log("started touch " + mouseX);
            startTapX = x;
            startTapY = y;
        }
        mouseX += (x - startTapX) * 1.5;
        mouseY += (y - startTapY) * 1.5;
        mouseTargX = mouseX;
        mouseTargY = mouseY;
        lockedToMouse=true;
        startTapX = x;
        startTapY = y;
        //mouseX = x;
        //mouseY = 500;

        if (mouseX > cWidth - 10) {mouseX = cWidth - 10;}
        else if (mouseX < 10) {mouseX = 10;}
        if (mouseY > cHeight - 10) {mouseY = cHeight - 10;}
        else if (mouseY < 10) {mouseY = 10;}
        //console.log("mouseX: " + mouseX);
    }

    mp = PixelSnap(mouseX,mouseY)
    if (mousePoses.length == 0 || mp[0] != mousePoses[0][0] || mp[1] != mousePoses[0][1])
    {
        mousePoses.unshift(mp);
        DrawMouseWorm();
    }
}


class LightWorm {
    constructor(wli, x, y, xv, yv) {
        // Constructor: initialize object properties
        this.wli = wli;
        this.x = x;
        this.y = y;
        
        this.xv = xv;
        this.yv = yv;
        this.RandomVals();
        this.px = x;
        this.py = y;
        this.UpdatePPos();
        
        this.lastPoses = [];
        this.needsToRender = false;
        this.isDead = false;
        this.length = wormLength;
        this.caughtFrame = -1;
       // this.respawnOnDeath;
    }
    RandomVals()
    {
        let side = Math.random() * 4;
        let vel = (Math.random() * 2) - 1;
        if (side < 1) {this.x = 0; this.y = Math.random() * (cHeight - 1); this.xv = 1; this.yv = vel;}
        else if (side < 2) {this.x = cWidth; this.y = Math.random() * (cHeight - 1); this.xv = -1; this.yv = vel;}
        else if (side < 3) {this.y = 0; this.x = Math.random() *(cWidth); this.yv = 1; this.xv = vel;}
        else {this.y = cHeight; this.x = Math.random() * (cWidth); this.yv = -1; this.xv = vel;}
        //this.x = canvas.width;//Math.random(0,canvas.width);
        //this.y = canvas.height - 1;//Math.random(0,canvas.height);
        //this.xv =-1;
        //this.yv = 0;
    }
    // Methods can be defined inside the class
    Update() {
        if (!this.isDead)
        {
            this.x += this.xv * wormSpeed;
            this.y += this.yv * wormSpeed;
            let oldpx = this.px; let oldpy = this.py;
            this.UpdatePPos();
            if (this.px != oldpx || this.py != oldpy)
            {
                this.lastPoses.push([this.px, this.py]);
                this.needsToRender = true;
            }
            this.CheckCollision();
        }
        else
        {
            this.length -= 1;
            if (this.length > 0)
            {
            this.needsToRender = true;
            }
            else if (this.caughtFrame == -1)
            {
                this.FullyDie();
            }
            if (this.caughtFrame != -1)
            {
                this.CaughtAnimation();
            }

        }
    }
    UpdatePPos()
    {
        let ppos = PixelSnap(this.x, this.y);
        this.px = ppos[0]; this.py = ppos[1];
    }
    Render()
    {
        if (this.needsToRender)
        {
            this.lastPoses.forEach((pos, index) => {
                //DrawSquare(pos[0], pos[1], "red");
                //console.log(index);
            });
            DrawSquare(this.px, this.py, "#772563");
            if (this.lastPoses.length > this.length && this.length > 0)
            {
                const index = 0;
                DrawSquare(this.lastPoses[index][0], this.lastPoses[index][1], "black");
                this.lastPoses.shift();
            }
            this.needsToRender = false;
        }
    }
    CheckCollision() {
        if (this.x < 0 || this.x >= canvas.width ||
            this.y < 0 || this.y >= canvas.height) {
                this.Die();
        }
    }
    Die()
    {
        this.isDead = true;
    }
    Catch()
    {
        if (!this.isDead)
        {
            mWormBankd += Math.ceil(this.length * 0.5);
            this.isDead = true;
            this.caughtFrame = 0;
        }
    }
    DetectCatch(mx,my)
    {
        this.lastPoses.forEach((element) => {
        let cThresh = pixelSize * 7;
        if (this.caughtFrame == -1 && mx < element[0] + cThresh && mx > element[0] - cThresh && 
            my < element[1] + cThresh && my > element[1])
            {
                this.Catch();
            }
        })
    }
    CaughtAnimation()
    {
        let col = "pink";
        let multi = 1;
        let posIndex = this.caughtFrame;
        if (this.caughtFrame > 6) {posIndex = this.caughtFrame - 6; col = "black"; multi = 1.1;}
        DrawSquare(this.px + (posIndex * pixelSize), this.py,col,multi);
        DrawSquare(this.px, this.py + (posIndex * pixelSize),col,multi);
        DrawSquare(this.px - (posIndex * pixelSize), this.py,col,multi);
        DrawSquare(this.px, this.py - (posIndex * pixelSize),col,multi);
        this.caughtFrame += 1;
        if (this.caughtFrame == 13)
        {
            this.FullyDie();
        }
    }
    FullyDie()
    {
        DrawSquare(this.px, this.py, "black");
        wormList.forEach((element, index) => {       
            if (element.wli == this.wli){
            wormList.splice(index, 1);}
        })
    }
}

function SetupEvents()
{
    if (!isMobile)
    {
        // Event listener to track mouse movement
        window.addEventListener("mousemove", (event) => {
            if (!isCirclingTitle)
            {
                mouseMoved = true;
                mouseTargX = event.clientX / scaling;
                mouseTargY = event.clientY / scaling;
            }
        });
    }
    else
    {
        window.addEventListener('touchstart', touchHandler, false);
        window.addEventListener('touchmove', touchHandler, false);
        //window.addEventListener('touchend', touchHandler, false);
    }
}

function Update()
{
    isCirclingTitle = (!immerseMode && (isMobile || time < 4));
    if (immerseMode)
    {
        window.scrollBy(0,100);
    }
    if (isCirclingTitle || (!mouseMoved && !isMobile && !immerseMode))
    {
        lockedToMouse = false;
        let titleRect = titleUI.getBoundingClientRect();
        mouseTargX = titleRect.left + (-window.scrollX) + (titleRect.width / 4) - 20 + (Math.sin(time * 2) * 200);
        mouseTargY = titleRect.bottom + (-window.scrollY) + 0 + (Math.sin((time - 1) * 5) * 20);
        mouseX = mouseTargX;
        mouseY = mouseTargY;
    }
    else
    {
        if (lockedToMouse)
        {
            mouseX=mouseTargX; mouseY=mouseTargY;
        }
        else
        {
            let xDif = mouseTargX-mouseX; let yDif = mouseTargY-mouseY;
            let magnitude = Math.sqrt((xDif * xDif) + (yDif * yDif));
            const mouseTargetSpeed = 10;
            mouseX +=(xDif / magnitude) * mouseTargetSpeed * Math.min(5, magnitude/8);
            mouseY += (yDif / magnitude) * mouseTargetSpeed * Math.min(5, magnitude/8);
            if (magnitude < 2)
            {
                lockedToMouse = true;
            }
        }
    }
    mp = PixelSnap(mouseX,mouseY)
    if (mousePoses.length == 0 || mp[0] != mousePoses[0][0] || mp[1] != mousePoses[0][1])
    {
        mousePoses.unshift(mp);
        DrawMouseWorm();
    }

    let lastRound = -1;
    let lastLength = -1;
    

    let difcltyRampSpeed = 0.4;
    round = Math.floor(Math.pow(mWormLength / 50,0.95));
    let targLength = Math.floor(Math.pow(round + 1,1/0.95) * 50);
    pinkieLevel = 1 + Math.min(round, 10);
    if (wormList.length < pinkieLevel)
    {
        wormList.push(new LightWorm(wCI, 0, 0, 0,0));
        wCI += 1;
    }

    let sTSlice = -1;
    if (!drawnMWorm && time - lastBiteTime > 1)
    {
        mousePoses.forEach((instance, index) => {
                if (DetectMWSlice(PixelSnap(instance[0],instance[1]), index)) {sTSlice = index;}});
    }
    if (sTSlice != -1)
    {
        SliceMWorm(sTSlice);
    }
    drawnMWorm = false;
    wormList.forEach((instance, index) => {
        instance.Update();
    });
    DetectCatch(mouseX, mouseY);

    if (detachdMPs.length > 0)
    {
        DrawSquare(detachdMPs[0][0],detachdMPs[0][1],"black", 1.1);
        detachdMPs.shift();
    }

    if (splitEffectFrame != -1)
    {
        let col = "red";
        let multi = 1;
        let px = lastSplitPoint[0]; let py = lastSplitPoint[1];
        let posIndex = splitEffectFrame;
        if (splitEffectFrame > 14) {posIndex = splitEffectFrame - 14; col = "black"; multi = 1.1;}
        else if (splitEffectFrame > 7) {posIndex = splitEffectFrame - 7; col = "white"; multi = 1;}
        DrawSquare(px + (posIndex * pixelSize), py + (posIndex * pixelSize),col,multi);
        DrawSquare(px - (posIndex * pixelSize), py + (posIndex * pixelSize),col,multi);
        DrawSquare(px - (posIndex * pixelSize), py - (posIndex * pixelSize),col,multi);
        DrawSquare(px + (posIndex * pixelSize), py - (posIndex * pixelSize),col,multi);
        splitEffectFrame += 1;
        if (splitEffectFrame > 22)
        {
            splitEffectFrame = -1;
        }
    }

    if (mWormBankd > 0)
    {
        mWormBankd -= 1;
        mWormLength += 1;
    }
    let updateHud=false;
    if (mWormLength < highScore)
    {
        updateHud=true;
    }
    if (lastLength != mWormLength) {updateHud=true;}
    if (lastRound != round) {updateHud=true;}
    if (mWormLength > highScore)
    {
        highScore = mWormLength;
        updateHud=true;
    }
    lastLength = mWormLength;
    lastRound = round;
    if (updateHud) {UpdateGameHUD();}
}
function UpdateGameHUD()
{
    gameHud.innerHTML = `<p class="hud-p">
        <span>Round ${round}</span> | 
        <span>Length: ${mWormLength}</span> | 
        <span>High Score: ${highScore}</span>
    </p>`;
}
function Render()
{
    wormList.forEach((instance, index) => {
        instance.Render();
    });
}

// Function to draw a red square at the mouse coordinates
function DrawSquare(x, y, col, multi = 1) {
    mp = PixelSnap(x,y);
    x = mp[0]; y = mp[1];
    ctx.fillStyle = col;
    ctx.fillRect(x - (pixelSize * 0.5 * multi), y - (pixelSize * 0.5 * multi), pixelSize * multi, pixelSize * multi);
}

function DetectCatch(x, y)
{
    wormList.forEach((instance, index) => {
        instance.DetectCatch(x,y);
    });
}
function SliceMWorm(index)
{
    splitEffectFrame = 0;
    lastSplitPoint = mousePoses[index];
    detachdMPs = detachdMPs.concat(mousePoses.slice(index - 1, mousePoses.length));
    //detachdMPs.push(mousePoses[mousePoses.length-1]);
    mousePoses = mousePoses.slice(0,index);
    mWormLength = index;
    lastBiteTime = time;

    detachdMPs.forEach((instance, index) => {
        DrawSquare(instance[0],instance[1],"grey",1);
    });
    
}
const biteThrsh = pixelSize * 3;
function DetectMWSlice(seg, index)
{
    let foundSlice = false;
    if (index > 9 && index < mWormLength - 9)
    {
        wormList.forEach((worm, index) => {
            if (!foundSlice && !worm.isDead && worm.px < seg[0] + biteThrsh && worm.px > seg[0] - biteThrsh && worm.py < seg[1] + biteThrsh && worm.py > seg[1] - biteThrsh)//(worm.px == seg[0] && worm.py == seg[0])
            {
                foundSlice = true;
            }
        });
    }
    return foundSlice;
}

function DrawMouseWorm()
{
    drawnMWorm = true;
    let sTSlice = -1;
    mousePoses.forEach((instance, index) => {
        let col = "#ffaf54";
        if (index == 0)
        {
            DrawSquare(instance[0],instance[1],col,1)
        }
        else if (index < mWormLength)
        {
            if (time - lastBiteTime > 1) {if(DetectMWSlice(PixelSnap(instance[0],instance[1]), index)) { sTSlice = index;} }
            if (index > mWormLength / 1.5) {col = "#412200";}
            else if (index > mWormLength / 3) {col = "#ad5c00";}
            else if (index > mWormLength / 5) {col = "#ff8800";}
            let a = mousePoses[index - 1][0] - instance[0];
            let b = mousePoses[index - 1][1] - instance[1];
            let mag = Math.sqrt((a*a) + (b*b));
            let ua = a/mag; let ub = b/mag;
            if (mag > pixelSize)
            {
                DrawSquare(instance[0],instance[1],"black",1)
                let dif = mag - pixelSize;
                instance[0] += dif * ua;
                instance[1] += dif * ub;
                //mousePoses[index] = PixelSnap(instance[0] + (dif * ua), instance[1] + (dif * ub));
            }
            DrawSquare(instance[0],instance[1],col,1)
        }
    });
    if (mousePoses.length > mWormLength) 
    {
        let index = mousePoses.length - 1;
        DrawSquare(mousePoses[index][0],mousePoses[index][1],"black",1)
        mousePoses.pop();
    }
    if (sTSlice != -1)
    {
        SliceMWorm(sTSlice);
    }
}
var GameResize = function Resize()
{
    bgDimensions = background.getBoundingClientRect();
    ctx.scale(scaling,scaling);
    canvas.width = bgDimensions.width;
    canvas.height = bgDimensions.height;
    //console.log(canvas.width);
    cWidth = canvas.width /scaling;
    cHeight = canvas.height /scaling;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function PixelSnap(x, y) {
    return [
        Math.round(x / pixelSize) * pixelSize,
        Math.round(y / pixelSize) * pixelSize
    ].map(Math.round);
}