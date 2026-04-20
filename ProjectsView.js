const pvContainer = document.getElementById("projects-view");
const pvDimensions = pvContainer.getBoundingClientRect();
const pvPreviewScroll = document.createElement("div");
pvPreviewScroll.id = "pv-scroller";
pvContainer.appendChild(pvPreviewScroll);
const pvPInspectSection = document.createElement("div");
pvPInspectSection.id = "pv-inspect-section";
pvPInspectSection.style.display = "none";

const leftScrollArrow = document.createElement("img");
leftScrollArrow.src="thinArrow.png"; leftScrollArrow.classList.add("left"); leftScrollArrow.classList.add("pv-scroller-arrow");
pvContainer.appendChild(leftScrollArrow);
const rightScrollArrow = document.createElement("img");
rightScrollArrow.src="thinArrow.png"; rightScrollArrow.classList.add("right"); rightScrollArrow.classList.add("pv-scroller-arrow");
pvContainer.appendChild(rightScrollArrow);

//'<img src="thinArrow.png" class="pv-scroller-arrow left"><img src="thinArrow.png" class="pv-scroller-arrow right">';
pvContainer.appendChild(pvPInspectSection);

let projectCount = 3;
const thumbCount=8; //How many thumbnails there should be at any given time
const baseThumbnailWidth =355.54;
const baseThumbnailHeight = 200;
let curThumbWidthMulti=0.5;

pvPreviewScroll.style.height =(baseThumbnailHeight*curThumbWidthMulti) + "px";


let startScrollVal=0;
let lastAutoScrollFrame=0;
let curAutoScrollSpeed=1;
let lastScrollDir = -1;

let isMouseOver=false;

let viewingFeaturedProjs = true;
let isInspectingProject=false;
let inspectedProject=null;
let curInspHeight=10;
let targInspHeight=100;
let pvpContent=null;

let hoveringProj = null;


const projectNames = ["*Space Blocks", "*Untitled VR Game", "*Apothalypse", "Down Stream", "*Battle Babies", "*The Yellow Mellow Fellow", "*Home Wrecker", "*Slice VR Prototype", "*Multiplayer FPS", "*Horror Laboratory", "The Punk Police", "*Baby Snatcher", "!Limb Land", "!Ant Farm Simulation", "SuperGary LowFPS", "!Multiplayer FPS", "!Gnome Wizard", "!Alien Harbourer"];
class Project {
    constructor(title, pIndx)
    {
        this.title = title;
        this.curThumbWidget=null;
        this.shortDesc = "";
        this.title = title;
        this.link = "";
        this.isSelected = false;
        this.isHovering = false;
        this.scaleMultiplier = 1;
        this.embddVideo = "";
        this.embddGame = "";
        this.thumbnailCount = 1;
        this.date = "";
        this.engine = "Made in Unity";
        this.onGameThumb = false;
        this.depthRows = [];
        this.pIndx = pIndx;
        if (title == "Down Stream")
        {
            //this.embddVideo = "https://www.youtube.com/embed/GrznYMMlR1Y?si=wFJH9_5cEPwg71vM?autoplay=1";
            this.link = "<a href='https://giac.itch.io/downstream' target='_blank'>Play it here</a>";
            this.shortDesc = " A short psx style horror game I made with a friend. Simulating the waves helped to build my knowledge of mesh manipulation as well as shaders for the river flow effect and the post process psx-stlye pixelation and color grading.  asdas<a href='https://github.com/GIACgames/TheTyneHorror' target='_blank'>View the Source Code</a>";
            this.date = "2023";
        }
        if (title == "Space Blocks")
        {
            //this.embddVideo = "https://www.youtube.com/embed/GrznYMMlR1Y?si=wFJH9_5cEPwg71vM?autoplay=1";
            //this.link = "<a href='https://giac.itch.io/downstream' target='_blank'>Play it here</a>";
            this.shortDesc = "Voxel space sandbox game heavily inspired by minecraft with an emphasis on physics. Currently in development.";
            this.date = "2024-2026";
            this.thumbnailCount=3;
        }
        if (title == "Apothalypse")
        {
            this.embddVideo = "https://www.youtube.com/embed/GrznYMMlR1Y?si=wFJH9_5cEPwg71vM?autoplay=1";
            this.link = "<a href='https://gamejolt.com/games/apothalypse/588775' target='_blank'>Play it here</a>";
            this.shortDesc = "A metroidvania demo I made with an artist. One of the largest projects I've worked on that made me truly understand the commitment and dedication it takes to produce an expansive polished game.";
            this.date = "2021";
        }
        else if (title == "Battle Babies")
        {
            this.thumbnailCount = 3;
            this.embddVideo = "https://www.youtube.com/embed/nCHip9cDun8?si=m1XXmrsR9dB1xVg7";
            //this.link = "<a href='https://play.google.com/store/apps/details?id=com.GIAC.BattleBabies&hl=en_AU&gl=UK' target='_blank'>Play it on android</a>";
            this.shortDesc = "My second mobile game and my first attempt at network multipayer."
            this.date = "2019";
        }
        else if (title == "The Yellow Mellow Fellow")
        {
            this.embddVideo = "https://www.youtube.com/embed/ZsghkTp9hxE?si=-ILIo4XBpJfRKAhz?autoplay=1";
            this.thumbnailCount = 1;
            this.shortDesc = "University coursework with the specifications to build upon a barebones pac-man style game provided by Newcastle University by implementing more complex features, and a striking visual art style. One of these features was replacing unity's built in nav mesh with a custom A* pathfinding algorithm to have more faithful and challenging ghost behaviour. I created all the 3d models using blender and modified the textures in photoshop."
            this.date = "2024";
        }
        else if (title == "Baby Snatcher")
        {
            this.thumbnailCount = 6;
            this.embddVideo = "https://www.youtube.com/embed/XRQCRqLSyNE?si=1oGz0sY3rbytSX_s";
            this.embddGame = "https://serve.gamejolt.net/cecc1ec53ffe6135afb0366309f6fe5be8d27a16e30981a1d59c07005415f4f0,1693865747,7/data/games/8/51/500051/files/60ed62573da0a/index.html?"
            this.link = "<a href='https://gamejolt.com/games/BabySnatcher/500051' target='_blank'>Visit Page</a>";
            this.shortDesc = "A short stealth game me and an artist made for a game jam, my focuses were on enemy behaviour and creating a system for their pathfinding.";
            this.date = "2020";
        }
        else if (title == "Untitled VR Game")
        {
            this.thumbnailCount = 1;
            this.embddVideo = "https://www.youtube.com/embed/CiewjF7CtH4?si=Y7eTUP2qdkeFSHeX";
            this.link = "";
            this.shortDesc = "A wave based arena fighter VR game. I learnt a lot about active ragdolls and 3D animation making this as well as the struggles of balancing realistic physics with fun responsive VR controls and performance since I developed it with the Oculus Quest in mind.";
            this.date = "2021";
            /*this.depthRows.push(new DepthRow());
            this.depthRows[0].para = "BLA BVLAa asdasda fihfuaydiu auidshiuadh wuidahiudaps uiashdjkwhbdkj hsduhahdushd ujsahdjhasukdha jhdfajhd asjd ajsdhk as dhajskdh";
            this.depthRows[0].subHeading = "Subasdas";
            this.depthRows[0].imgs = ["your-image.png"];
            this.depthRows[0].codeSnip = "this is code asdasdhyoiwdh asidhaoisd haisdh aoidhoaisdh apsdaiodsh aowi yw guir fhsj hgasjgaydgy wgyeegyfg sydft yfg as dyuasg daisdu gaisudpo adisadgauysdyt";
            */
        }
        else if (title == "Slice VR Prototype")
        {
            this.thumbnailCount = 1;
            this.embddVideo = "https://www.youtube.com/embed/0l5-sz8B3zA?si=_vU7jb5PzZSoa6rW";
            this.link = "";
            this.shortDesc = "A very early prototype for a vr game. Building on what I learned from my first VR prototype and inspired by games like BoneWorks I wanted to do a more physics heavy experience. In doing so I found it very challenging to deliver a smooth user friendly experience as the physics simulations would all too often conflict with what couldn't be simulated and so lot of solutions to try to compensate for these times had to be implemented.";
            this.date = "2023";
        }
        else if (title == "SuperGary LowFPS")
        {
            
            this.thumbnailCount = 1;
            this.embddGame = "https://itch.io/embed-upload/9141999?";
            this.link = "<a href='https://itch.io/jam/acm-summer-jam-2023/rate/2224849' target='_blank'>Visit Page</a>";
            this.shortDesc = "I made this game for a game jam with the theme 'Its not a bug it's a feature'.";
            this.date = "2023";
        } 
        else if (title == "Multiplayer FPS")
        {
            this.thumbnailCount = 1;
            this.embddVideo = "https://www.youtube.com/embed/XumNbK_RL0c?si=U_7L0FZ7gpY34Bbj";
            this.link = "";
            this.shortDesc = "Prototype for a network multiplayer first person shooter. Taught me about inverse kinematics and animation as well as velocity based player movement. I also learnt how multiplayer games synchronise scene data, make predictions for slow data and how that aspect needs to be planned and accomodated for in nearly every aspect of the game.";
            this.date = "2019";
        }
        else if (title == "Horror Laboratory")
        {
            this.thumbnailCount = 1;
            this.embddVideo = "https://www.youtube.com/embed/WL2zOTz3Aeo?si=X8KQMExxY1IF33-T";
            this.link = "";
            this.shortDesc = "Experimental horor game where each corridor/room is segmented into a grid of tiles generated from a text file so the grid can be used for player and enemy pathfinding to eliminate the need for physics simulation. I now realise that what little is gained in performance from this approach is not worth the many drawbacks.";
            this.date = "2022";
        }
        else if (title == "Home Wrecker")
        {
            this.thumbnailCount = 1;
            this.embddVideo = "https://www.youtube.com/embed/GwVc7RWEfZU?si=0cVaKXzQhP9uFOPF";
            this.link = "";
            this.shortDesc = "A game design project for university in which we had to create a design document and early prototype. I also experimented with texture manipulation to enable destructive terrain and island detection algorithms to get pixel perfect collision.  <a href='https://docs.google.com/document/d/1BkHHxTAXP4tpdTUMZ5kxRpfiY3omXYdfLGzv5fSaqOA/edit?usp=sharing' target='_blank'>View the Design Doc here.</a>";
            this.date = "2025";
        }
        else if (title == "The Punk Police")
        {
            this.thumbnailCount = 2;
            this.embddGame = "https://serve.gamejolt.net/5450d4c1ba084ba25fcd6166a0c25eba66c49e94f20021586869179765039689,1770202334,7/data/games/7/159/473159/files/5ebec4baaeb4b/index.html"
            this.date= "2020";
            this.shortDesc = "Simple sideways shooter made in a week for a gamejam. ";
            this.link = "<a href='https://gamejolt.com/games/ThePunkPolice/473159' target='_blank'>Visit Page</a>";
        }
    }
    getThumbnailSrc() 
    {
        return 'Projects/' + this.title + '/Thumbnails/0.png';
    }
    getThumbnailText() 
    {
        return this.title + ' (' + this.date + ')';
    }
    getImage(indx)
    {
        return 'Projects/' + this.title + '/Thumbnails/' +(indx % this.thumbnailCount) + '.png';
    }
}
class ThumbnailWidget {
    constructor(project, element, projectIndx)
    {
        this.project = project;
        this.element = element;
        this.image=element.querySelector(".project-thumb-img");
        this.titleText=element.querySelector(".project-thumb-title");
        this.projectIndx = projectIndx;
        this.isMouseOver=false;
        this.oldImg=null;
        this.oldText=null;
    }
}

//Fill the projects array
let projects = [];
// for (let p = 0; p < projectCount; p++)
// {
//     projects[p] = new Project(p!=0 ? "your-image.png": "ProfPic.jpg", "project" + p);
// }
const thumbnails = new Array(thumbCount);


function setupProjects()
{
    projects=[];
    projectNames.forEach( (pName, pi) => {
        pTitle = pName;
        if (pName[0] != '!' && (!viewingFeaturedProjs || pName[0] == '*'))
        {
            if (pName[0] == '*') {pTitle = pName.slice(1,pName.length);}
            projects.push( new Project(pTitle, pi));
        }
    });
    projectCount = projects.length;
}
// let lastHastenTime=0;
// function hastenThumbTransitions()
// {
//     lastHastenTime = time;
//     thumbnails.forEach(thumb=>{
//         thumb.image.style.transitionDuration=0;
//         if (thumb.element.classList.contains("hover")) {thumb.element.classList.remove("hover");}
//     });
//     setTimeout(()=>{
//         if (time - lastHastenTime > 0.2)
//         {
//             thumbnails.forEach(thumb=>{
//             thumb.image.style.transitionDuration="0.23s";
//         });
//         }
//     }, 0.25);
// }

function fillScrollContainer()
{
    pvPreviewScroll.innerHTML="";
    const startOffset = 2;
    for (let i = -startOffset; i < thumbCount-startOffset; i++)
    {
        let ti = i+startOffset;
        let pi = ((i % projects.length) + projects.length) % projects.length;
        const projThumb = document.createElement("div");
        projThumb.classList.add("project-thumb");
        projThumb.id = "t" + ti;
        projThumb.innerHTML=`<img class="project-thumb-img" src="${projects[pi].getThumbnailSrc()}"><p class="project-thumb-title">${projects[pi].getThumbnailText()}<p>`;
        let width = baseThumbnailWidth*curThumbWidthMulti + "px";
        projThumb.style.width = width;
        projThumb.style.minWidth = width;
        projThumb.style.maxWidth = width;
        
        if (!isMobile)
        {
            projThumb.addEventListener("mouseenter", (e)=>{hoverThumbnail(e.target)});
            // projThumb.addEventListener("mousemove", (e)=>{hoverThumbnail(e.target,true,false)});
            projThumb.addEventListener("mouseleave", (e)=>{exitHoverThumbnail(e.target)});
        }
        projThumb.addEventListener("click", (e)=>{
            const thumb=thumbnails[e.target.id.slice(1,e.target.id.length)];
            thumb.isMouseOver=true;
            thumbnails.forEach(otherThumb=>{
                if (otherThumb !== thumb)
                {
                    otherThumb.isMouseOver=false;
                }
            });
            inspectProject(thumb.project);
        })
        // console.log(projects[pi]);
        // projImage.src = ;//thumbSrc;
        pvPreviewScroll.appendChild(projThumb);
        
        thumbnails[ti] = new ThumbnailWidget(projects[pi], projThumb, pi);
        
        projects[pi].curThumbWidget = thumbnails[ti];
    }
    // pvContainer.innerHTML += '<img src="thinArrow.png" class="pv-scroller-arrow left"><img src="thinArrow.png" class="pv-scroller-arrow right">';
    // pvContainer.scrollLeft += (baseThumbnailWidth*curThumbWidthMulti)*startOffset;
    setTimeout(()=>{pvPreviewScroll.scrollLeft = (baseThumbnailWidth*curThumbWidthMulti)*(startOffset); startScrollVal=pvPreviewScroll.scrollLeft;}, 1);
}

function shiftThumbnails(shiftAmnt)
{
    for (let i = shiftAmnt > 0 ? 0 : thumbnails.length-1; shiftAmnt > 0 ? i < thumbnails.length : i >= 0; i += shiftAmnt > 0 ? 1 : -1)
    {
        const thumb = thumbnails[i];
        const nextThumb = thumbnails[(((i + shiftAmnt) % thumbnails.length) + thumbnails.length) % thumbnails.length];

        const pi = (((thumb.projectIndx + shiftAmnt) % projects.length) + projects.length) % projects.length;

        thumb.project = projects[pi];
        thumb.projectIndx+= shiftAmnt;
        // thumb.image.src = thumb.project.getThumbnailSrc();
        if (nextThumb.project === thumb.project)
        {
            thumb.oldImg = thumb.image;
            thumb.oldText = thumb.titleText;
            const newImage = nextThumb.image; const newText = nextThumb.titleText;
            try{ newImage.parentElement.removeChild(newImage); newText.parentElement.removeChild(newText);}
            catch {}
            // thumb.element.insertBefore(newImage, thumb.textContent);
            // thumb.element.appendChild(newImage);
            // thumb.element.appendChild(newText);
            thumb.element.appendChild(newText);
            thumb.element.insertBefore(newImage, thumb.element.firstChild);
            thumb.image = newImage;
            thumb.titleText = newText;
        }
        else
        {
            const newImage = nextThumb.oldImg; 
            const newText = nextThumb.oldText;
            try{ newImage.parentElement.removeChild(newImage); newText.parentElement.removeChild(newText);}
            catch {}
            // thumb.element.insertBefore(newImage, thumb.textContent);
            thumb.element.appendChild(newText);
            thumb.element.insertBefore(newImage, thumb.element.firstChild);
            thumb.image = newImage;
            thumb.titleText = newText;
            thumb.image.src = thumb.project.getThumbnailSrc();
            thumb.titleText.textContent = thumb.project.getThumbnailText();
            console.log("loaded new image");
        }
        if (isMobile)
        {
            thumb.isMouseOver=false;
        }
    }
}

let lastScrollPos=0;
let isScrolling;
let lastScrollTime=-10;
let lastHoverTime=-10;
function scrollNewThumbnails()
{
    let scrollDif = startScrollVal - pvPreviewScroll.scrollLeft;
    if (Math.abs(scrollDif) > (baseThumbnailWidth*curThumbWidthMulti))
    {
        pvPreviewScroll.scrollLeft = startScrollVal;
        let shiftAmnt = scrollDif / (baseThumbnailWidth*curThumbWidthMulti);
        shiftAmnt = scrollDif>0 ? Math.floor(shiftAmnt) :  Math.ceil(shiftAmnt);
        shiftThumbnails(-shiftAmnt);
    }
}
function scrollPreview(event) {
    if (isEdgeScrolling)
    {
        pvPreviewScroll.scrollLeft += event.deltaX;
        return;
    }
  event.preventDefault();
  const deltaTotal = (event.deltaY * -1) + event.deltaX;
  pvPreviewScroll.scrollLeft += deltaTotal;
  if (deltaTotal < 0) {lastScrollDir=1;}
  else if (deltaTotal > 0) {lastScrollDir=-1;}
}
let curEdgeScrollSpeed=0;
let isEdgeScrolling=false;
function manageScroll()
{
    isEdgeScrolling=false;
    if (!isMouseOver) {mouseXP=0.5; }
    let targScroll = 0;
    isAutoScrolling=false;
    if (!isMouseOver && time-lastHoverTime>0.7 && !isInspectingProject)
    {
        targScroll = 1 * lastScrollDir;
        curEdgeScrollSpeed=0;
        isAutoScrolling=true;
    }
    else
    {
        if (!isMobile && isMouseOver && mouseXP > 0.9)
        {
            curEdgeScrollSpeed = Math.min(curEdgeScrollSpeed+0.2,7);
            targScroll=curEdgeScrollSpeed;
            lastScrollDir=1; isEdgeScrolling=true;
        }
        else if (!isMobile && isMouseOver && mouseXP < 0.1)
        {
            curEdgeScrollSpeed = Math.max(curEdgeScrollSpeed-0.2,-7);
            targScroll=curEdgeScrollSpeed;  
            lastScrollDir=-1; isEdgeScrolling=true;
        }
        else
        {
            curEdgeScrollSpeed=0;
            targScroll=0;
        }
    }

    let accel=Math.max(0.1*Math.abs(curAutoScrollSpeed),0.05);
    if (curAutoScrollSpeed < targScroll) {curAutoScrollSpeed+=accel;}
    if (curAutoScrollSpeed > targScroll) {curAutoScrollSpeed-=accel;}


    if (Math.abs(curAutoScrollSpeed) > 0 && time - lastAutoScrollFrame > 0.05/Math.abs(curAutoScrollSpeed))
    {
        pvPreviewScroll.scrollLeft += 1 * curAutoScrollSpeed;//Math.abs(curAutoScrollSpeed);
        lastAutoScrollFrame = time;
    }
    if (!isAutoScrolling && curAutoScrollSpeed < -0.5)
    {
        leftScrollArrow.style.opacity=0.6;
    } else {leftScrollArrow.style.opacity=0;}
    if (!isAutoScrolling && curAutoScrollSpeed > 0.5)
    {
        rightScrollArrow.style.opacity=0.6;
    } else {rightScrollArrow.style.opacity=0;}
    scrollNewThumbnails();


    scrollDif =lastScrollPos-pvPreviewScroll.scrollLeft;
    if (scrollDif != 0)
    {
        lastScrollDir = scrollDif < 0 ? 1 : -1;
    }
    scrollDif = Math.abs(scrollDif);
    if (scrollDif> 20)
    {
        if (!isScrolling)
        {
            thumbnails.forEach(thumb=>{
                if (thumb.element.classList.contains("hover")) {thumb.element.classList.remove("hover");}
                if (isMobile)
                {
                    thumb.isMouseOver=false;
                }
            });
        }
        isScrolling=true;
        lastScrollTime=time;
    }
    else
    {
        isScrolling=false;
    }
    lastScrollPos=pvPreviewScroll.scrollLeft;
}

let mouseXPos=0;
let mouseXP=0;
pvPreviewScroll.addEventListener("mousemove", (event) => {
    var rect = pvPreviewScroll.getBoundingClientRect();
    mouseXPos = event.clientX;
    mouseXP = (mouseXPos - rect.left) / rect.width;
    //console.log(mouseX);
    //console.log(rect.width);
    
});
function pvStart()
{
    setupProjects();
    fillScrollContainer();
}
function pvUpdate()
{
    // manageCursorScroll();
    // autoScroll();
    manageScroll();
    // if (isMouseOver && !isMobile)
    // {
    //     pvPreviewScroll.scrollLeft += 
    // }
    manageThumbnails();
    manageInspectedProject();
}

function hoverThumbnail(target)
{
    
    const thumb = thumbnails[parseInt(target.id.slice(1,target.id.length))];
    thumb.isMouseOver=true;
    hoveringProj = thumb.project;
    thumbnails.forEach(otherThumb=>{
        if (otherThumb !== thumb)
        {
            otherThumb.isMouseOver=false;
        }
    });
    // target.innerHTML = "Hello";
    
    
}
function exitHoverThumbnail(target)
{
    // target.innerHTML = "Hello";
    const thumb = thumbnails[parseInt(target.id.slice(1,target.id.length))];
    thumb.isMouseOver=false;
    if (thumb.project === hoveringProj)
    {
        hoveringProj = null;
    }
    
}
function manageThumbnails()
{
    thumbnails.forEach(thumb=>{
        if (((inspectedProject === thumb.project && (hoveringProj===thumb.project || hoveringProj==null)) || (thumb.isMouseOver))&& !isScrolling && !isEdgeScrolling && time-lastScrollTime>0.3)
        {
            if (!thumb.element.classList.contains("hover")) {thumb.element.classList.add("hover");}
        }
        else {
            if (thumb.element.classList.contains("hover")) {thumb.element.classList.remove("hover");}
        }
    });
}



pvPreviewScroll.addEventListener("mouseover", ()=>{if (!isMouseOver) {
    // if (!isMobile){document.body.style.overflowY="hidden";}
};isMouseOver=true;});
pvPreviewScroll.addEventListener("mouseout", ()=>{if(isMouseOver){
    lastHoverTime=time;
    // if (!isMobile){document.body.style.overflowY="scroll";}
}
     isMouseOver=false;})

let ifrmOpac=0;
let iframe= null;
function inspectProject(project)
{
    if (inspectedProject === project && isInspectingProject) { return;}
    iframe=null;
    inspectedProject=project;
    isInspectingProject=true;

    let bio = project.shortDesc;
    if (project.link != "") {bio = project.link + "<br>" + bio;}
    bio += "<br><br>" + project.engine + " (" + project.date + ")";
    
    let ifrmHtml = '<div id="head-ifrm" style="position:relative">';
    ifrmHtml+=`<div id="main-proj-img-div"><img id="main-proj-img" src="${project.getImage(0)}"></div>`;
    if (project.embddVideo) {
        ifrmHtml += `<iframe src="${project.embddVideo}" allow="compute-pressure"></iframe>`;
    }
    ifrmHtml += '</div>';

    let cardHtml = `<div><h2 id="main-proj-title">${project.title}</h2><p id="main-proj-desc">${bio}</p></div></div>`;
    pvPInspectSection.innerHTML = 
    `<div id="pvp-content">
        <div id="project-header-card" class="central-content-2">${ifrmHtml+cardHtml}
    </div>`;

    iframe = pvPInspectSection.querySelector("iframe");
    if (iframe!=null){
        iframe.style.opacity=0;
        iframe.addEventListener("load", () => {
            onLoadIFrame(iframe, pvPInspectSection.querySelector("#main-proj-img"));
    });
        const bufferIcon = document.createElement("img");
        bufferIcon.classList.add("buffer-icon");
        bufferIcon.src = "bufferIcon.png";
        pvPInspectSection.querySelector("#main-proj-img-div").appendChild(bufferIcon);

    }
    ifrmOpac=0;
    console.log(project.title);
    pvPInspectSection.style.height="10px";
    pvPInspectSection.style.display="block";
    curInspHeight=10;
    pvpContent = pvPInspectSection.querySelector("#pvp-content");
    
}
function closeInspectedProject()
{
    isInspectingProject=false;
    curInspHeight=10;
    pvPInspectSection.style.display="none";
    pvPInspectSection.innerHTML = "";
    iframe=null;
}
function manageInspectedProject()
{
    if (!isInspectingProject) { return;}
    targInspHeight = pvpContent.getBoundingClientRect().height;
    if (curInspHeight < targInspHeight)
    {
        curInspHeight+=30;
        pvPInspectSection.style.height=curInspHeight + "px";
    }
    else if (curInspHeight > targInspHeight)
    {
        curInspHeight=targInspHeight;
        pvPInspectSection.style.height=curInspHeight + "px";
    }
    if (iframe != null)
    {
        // var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        // if (iframeDoc.readyState == 'complete')
        // {
        //     if (ifrmOpac < 1)
        //     {
        //         ifrmOpac+=0.1;
        //         iframe.style.opacity=ifrmOpac;
        //         if (ifrmOpac >= 1)
        //         {
        //             let imgrect = pvpContent.querySelector("#main-proj-img").getBoundingClientRect();
        //             if (isMobile)
        //             {
        //                 iframe.style.width=(imgrect.width+1)+"px";
        //                 iframe.style.height=(imgrect.height+0.5)+"px";
        //                 iframe.style.left = "0.5px";
        //             }
        //             else
        //             {
        //                 iframe.style.height=imgrect.height+"px";
        //             }
        //             ifrmOpac = 1;
        //             iframe.style.opacity=1;

        //         }
        //     }
        // }
    }
}
function onLoadIFrame(iframe, matchEl)
{
    setTimeout(()=>{
        pvPInspectSection.querySelector(".buffer-icon").style.opacity=0;
    let imgrect = matchEl.getBoundingClientRect();
    if (isMobile)
    {
        iframe.style.width=(imgrect.width+1)+"px";
        iframe.style.height=(imgrect.height+0.5)+"px";
        iframe.style.left = "0.25px";
    }
    else
    {
        iframe.style.height=imgrect.height+"px";
    }
    console.log("iframe loaded"); iframe.style.opacity=1;},

    1000);
}


function pvResize()
{
    curThumbWidthMulti=0.8;
    if (window.innerWidth < 800)
    {
        curThumbWidthMulti=0.5;    
    }
    const pvScrollH = (baseThumbnailHeight*curThumbWidthMulti);
    pvPreviewScroll.style.height =pvScrollH + "px";
    rightScrollArrow.style.height = (pvScrollH*0.5) + "px";
    leftScrollArrow.style.height = (pvScrollH*0.5) + "px";
    rightScrollArrow.style.top = (pvScrollH*0.25) + "px";
    leftScrollArrow.style.top = (pvScrollH*0.25) + "px";
    thumbnails.forEach(thumb=>{
        let width = (baseThumbnailWidth*curThumbWidthMulti)+ "px";
        thumb.element.style.width = width;
        thumb.element.style.minWidth = width;
        thumb.element.style.maxWidth = width;
    });
}

const projFilterBtn = document.getElementById("project-filter-btn");
const projFilterSubLabel = document.getElementById("proj-filter-sub-label");

function switchProjFilter()
{
    closeInspectedProject();
    viewingFeaturedProjs = !viewingFeaturedProjs;
    const label = viewingFeaturedProjs ? "Featured Projects" : "All Projects";
    projFilterBtn.textContent = label;
    projFilterSubLabel.textContent = `A collection of projects I've worked on (click '${label}' to toggle)`;
    setupProjects();
    fillScrollContainer();
    
}
projFilterBtn.addEventListener("click",switchProjFilter);








pvPreviewScroll.onwheel = scrollPreview;