
class ThumbnailManager {

    constructor(container, projectManager, inspector) {

        this.container = container;
        this.projectManager = projectManager;
        this.inspector = inspector;

        this.thumbCount = 8;
        this.baseWidth = 355.54;
        this.baseHeight = 200;
        this.widthMultiplier = 0.5;

        this.thumbnails = [];

        this.hoveringProject = null;
        this.isMobile = window.isMobile;

        this.onThumbnailSelected = null;
        this.resize();
    }



    get projects() {
        return this.projectManager.projects;
    }


    get thumbnailWidth() {
        return this.baseWidth * this.widthMultiplier;
    }


    /* ========================================
       CREATION
    ======================================== */

    createThumbnail(project, index) {

        const element = document.createElement("div");

        element.classList.add("project-thumb");
        element.id = "t" + index;

        element.innerHTML = `
            <img class="project-thumb-img"
                 src="${project.getThumbnailSrc()}">

            <p class="project-thumb-title">
                ${project.getThumbnailText()}
            </p>
        `;

        const thumb = new ThumbnailWidget(
            project,
            element,
            this.projects.indexOf(project)
        );

        this.addThumbnailListeners(thumb);

        this.setThumbnailWidth(thumb);

        return thumb;
    }


    addThumbnailListeners(thumb) {

        if (!this.isMobile) {

            thumb.element.addEventListener("mouseenter", () => {

                thumb.isMouseOver = true;

            });

            thumb.element.addEventListener("mouseleave", () => {

                thumb.isMouseOver = false;

            });
        }

        thumb.element.addEventListener("click", () => {
            this.selectThumbnail(thumb);
        });
    }


    fill() {

        this.container.innerHTML = "";

        this.thumbnails = [];

        if (this.projects.length === 0) return;

        const startOffset = 2;

        for (
            let i = -startOffset;
            i < this.thumbCount - startOffset;
            i++
        ) {

            const ti = i + startOffset;

            const pi = this.wrapIndex(
                i,
                this.projects.length
            );

            const project = this.projects[pi];

            const thumb = this.createThumbnail(
                project,
                ti
            );

            this.thumbnails.push(thumb);

            project.curThumbWidget = thumb;

            this.container.appendChild(thumb.element);
        }

        this.container.scrollLeft =
            this.thumbnailWidth * startOffset;
    }


    /* ========================================
       THUMBNAIL RECYCLING
    ======================================== */

    wrapIndex(index, length) {

        return ((index % length) + length) % length;
    }


    shiftThumbnails(amount) {

        if (!this.projects.length) return;

        const count = this.thumbnails.length;

        const start = amount > 0 ? 0 : count - 1;
        const end = amount > 0 ? count : -1;
        const step = amount > 0 ? 1 : -1;

        for (let i = start; i !== end; i += step) {

            const thumb = this.thumbnails[i];

            const nextIndex = this.wrapIndex(
                i + amount,
                count
            );

            const nextThumb = this.thumbnails[nextIndex];

            const projectIndex = this.wrapIndex(
                thumb.projectIndx + amount,
                this.projects.length
            );

            thumb.project = this.projects[projectIndex];
            thumb.projectIndx = projectIndex;

            this.recycleElements(thumb, nextThumb);

            if (this.isMobile) {
                thumb.setHover(false);
            }
        }
    }


    recycleElements(thumb, nextThumb) {

        const newImage = nextThumb.image;
        const newText = nextThumb.titleText;

        newImage.remove();
        newText.remove();

        thumb.element.prepend(newImage);
        thumb.element.appendChild(newText);

        thumb.image = newImage;
        thumb.titleText = newText;

        thumb.image.src = thumb.project.getThumbnailSrc();

        thumb.titleText.textContent =
            thumb.project.getThumbnailText();
    }


    /* ========================================
       HOVER AND SELECTION
    ======================================== */

    hoverThumbnail(thumb) {

        if (!thumb) return;

        thumb.isMouseOver = true;

        this.hoveringProject = thumb.project;

        this.thumbnails.forEach(other => {
            if (other !== thumb) {
                other.isMouseOver = false;
            }
        });

    }


    exitHoverThumbnail(thumb) {

        if (!thumb) return;

        thumb.isMouseOver = false;

        if (this.hoveringProject === thumb.project) {
            this.hoveringProject = null;
        }

    }


    selectThumbnail(thumb) {

        this.thumbnails.forEach(other => {
            other.setHover(other === thumb);
        });

        if (this.onThumbnailSelected) {
            this.onThumbnailSelected(thumb.project);
        }
        else {
            this.inspector.inspect(thumb.project);
        }
    }


    /* ========================================
       HOVER STATE MANAGEMENT
    ======================================== */

    updateHoverStates(
        isScrolling,
        isEdgeScrolling,
        lastScrollTime,
        time
    ) {

        this.thumbnails.forEach(thumb => {

            const isInspected =
                this.inspector.inspectedProject === thumb.project;

            const shouldHover = thumb.isMouseOver;// || (isInspected && !isScrolling && !isEdgeScrolling);
                // (
                //     thumb.isMouseOver ||
                //     (
                //         isInspected &&
                //         (
                //             this.hoveringProject === thumb.project ||
                //             this.hoveringProject === null
                //         )
                //     )
                // ) &&
                // !isScrolling &&
                // !isEdgeScrolling &&
                // time - lastScrollTime > 0.3;

            thumb.element.classList.toggle("hover", shouldHover);

        });
    }


    clearHoverStates() {

        this.thumbnails.forEach(thumb => {
            thumb.setHover(false);
            thumb.setHoverClass(false);
        });

        this.hoveringProject = null;
    }


    /* ========================================
       RESIZING
    ======================================== */

    setThumbnailWidth(thumb) {

        const width = this.thumbnailWidth + "px";
        const height = this.baseHeight * this.widthMultiplier + "px";

        thumb.element.style.width = width;
        thumb.element.style.minWidth = width;
        thumb.element.style.maxWidth = width;

        thumb.element.style.height = height;
        thumb.element.style.minHeight = height;
        thumb.element.style.maxHeight = height;

        thumb.element.style.overflow = "hidden";
        thumb.element.style.flexShrink = "0";

        thumb.image.style.width = "100%";
        thumb.image.style.height = "100%";
        thumb.image.style.objectFit = "cover";
    }


    resize() {

        this.widthMultiplier =
            window.innerWidth < 800 ? 0.5 : 0.8;

        this.container.style.height =
            this.baseHeight * this.widthMultiplier + "px";

        this.thumbnails.forEach(thumb => {
            this.setThumbnailWidth(thumb);
        });
    }


    getThumbnailWidth() {
        return this.thumbnailWidth;
    }

}



class ThumbnailScroller {

    constructor(container, thumbnailManager) {

        this.container = container;
        this.thumbnailManager = thumbnailManager;

        this.lastScrollDir = -1;

        this.curAutoScrollSpeed = 1;
        this.curEdgeScrollSpeed = 0;

        this.lastAutoScrollFrame = 0;

        this.lastScrollPos = 0;
        this.lastScrollTime = -10;
        this.lastHoverTime = -10;

        this.isMouseOver = false;
        this.isScrolling = false;
        this.isEdgeScrolling = false;
        this.isAutoScrolling = false;

        this.mouseXP = 0;

        this.leftArrow = null;
        this.rightArrow = null;

        this.createArrows();
        this.addEventListeners();
    }


    get time() {
        return window.time;
    }


    get thumbnailWidth() {
        return this.thumbnailManager.getThumbnailWidth();
    }


    /* ========================================
       INITIALISATION
    ======================================== */

    createArrows() {

        this.leftArrow = document.createElement("img");

        this.leftArrow.src = "Assets/thinArrow.png";

        this.leftArrow.classList.add(
            "left",
            "pv-scroller-arrow"
        );

        this.rightArrow = document.createElement("img");

        this.rightArrow.src = "Assets/thinArrow.png";

        this.rightArrow.classList.add(
            "right",
            "pv-scroller-arrow"
        );

        this.container.parentElement.appendChild(this.leftArrow);
        this.container.parentElement.appendChild(this.rightArrow);

        this.resize();
    }


    addEventListeners() {

        this.container.addEventListener("mousemove", event => {

            const rect = this.container.getBoundingClientRect();

            this.mouseXP =
                (event.clientX - rect.left) / rect.width;
        });

        this.container.addEventListener("pointerenter", () => {

            this.isMouseOver = true;
        });

        this.container.addEventListener("pointerleave", () => {

            this.lastHoverTime = this.time;
            this.isMouseOver = false;
        });

        this.container.addEventListener("wheel", event => {

            this.mouseScrollPreview(event);
        });
    }


    /* ========================================
       MANUAL SCROLLING
    ======================================== */

    mouseScrollPreview(event) {

        event.preventDefault();

        let deltaX = event.deltaX * 2;
        let deltaY = -event.deltaY * 2;

        // Normalise wheel input
        if (event.deltaMode === 1) {
            deltaX *= 16 * 4;
            deltaY *= 16 * 4;
        }
        else if (event.deltaMode === 2) {
            deltaX *= this.container.clientWidth;
            deltaY *= this.container.clientHeight;
        }

        // Combine horizontal and vertical scrolling
        const delta = deltaX - deltaY;

        this.container.scrollLeft += delta;

        if (delta < 0) {
            this.lastScrollDir = -1;
        }
        else if (delta > 0) {
            this.lastScrollDir = 1;
        }
    }


    /* ========================================
       INFINITE SCROLLING
    ======================================== */

    scrollNewThumbnails() {

        const offset =
            this.startScrollVal - this.container.scrollLeft;

        const width = this.thumbnailWidth;

        if (Math.abs(offset) < width) return;

        let shiftAmount = offset / width;

        shiftAmount = offset > 0
            ? Math.floor(shiftAmount)
            : Math.ceil(shiftAmount);

        // Recycle thumbnails
        this.thumbnailManager.shiftThumbnails(-shiftAmount);

        // Preserve the fractional scroll distance
        this.container.scrollLeft += shiftAmount * width;
    }


    get startScrollVal() {

        return this._startScrollVal || 0;
    }


    set startScrollVal(value) {

        this._startScrollVal = value;
    }


    /* ========================================
       AUTOMATIC AND EDGE SCROLLING
    ======================================== */

    calculateTargetSpeed() {

        this.isEdgeScrolling = false;

        if (!this.isMouseOver) {
            this.mouseXP = 0.5;
        }

        // Automatic scrolling when the mouse leaves
        if (
            !this.isMouseOver &&
            this.time - this.lastHoverTime > 0.7 &&
            !this.thumbnailManager.inspector.isInspecting
        ) {

            this.isAutoScrolling = true;
            this.curEdgeScrollSpeed = 0;

            return this.lastScrollDir;
        }

        this.isAutoScrolling = false;

        // Edge scrolling
        if (!window.isMobile && this.isMouseOver) {

            if (this.mouseXP > 0.9) {

                this.isEdgeScrolling = true;

                this.curEdgeScrollSpeed = Math.min(
                    this.curEdgeScrollSpeed + 0.35,
                    8
                );

                this.lastScrollDir = 1;

                return this.curEdgeScrollSpeed;
            }

            if (this.mouseXP < 0.1) {

                this.isEdgeScrolling = true;

                this.curEdgeScrollSpeed = Math.max(
                    this.curEdgeScrollSpeed - 0.35,
                    -8
                );

                this.lastScrollDir = -1;

                return this.curEdgeScrollSpeed;
            }
        }

        this.curEdgeScrollSpeed = 0;

        return 0;
    }


    updateAutoScroll(target) {

        const acceleration = 0.15;

        if (this.curAutoScrollSpeed < target) {

            this.curAutoScrollSpeed = Math.min(
                this.curAutoScrollSpeed + acceleration,
                target
            );
        }

        else if (this.curAutoScrollSpeed > target) {

            this.curAutoScrollSpeed = Math.max(
                this.curAutoScrollSpeed - acceleration,
                target
            );
        }

        // Apply scrolling
        if (Math.abs(this.curAutoScrollSpeed) > 0.05) {

            this.container.scrollLeft += this.curAutoScrollSpeed;
        }
        else {
            this.curAutoScrollSpeed = 0;
        }
    }


    updateArrows() {

        this.leftArrow.style.opacity =
            !this.isAutoScrolling &&
            this.curAutoScrollSpeed < -0.5
                ? 0.6 : 0;

        this.rightArrow.style.opacity =
            !this.isAutoScrolling &&
            this.curAutoScrollSpeed > 0.5
                ? 0.6 : 0;
    }


    /* ========================================
       SCROLL STATE
    ======================================== */

    updateScrollState() {

        const difference =
            this.lastScrollPos - this.container.scrollLeft;

        if (difference !== 0) {

            this.lastScrollDir = difference < 0 ? 1 : -1;
        }

        if (Math.abs(difference) > 20) {

            if (!this.isScrolling) {

                this.thumbnailManager.clearHoverStates();
            }

            this.isScrolling = true;
            this.lastScrollTime = this.time;
        }
        else {

            this.isScrolling = false;
        }

        this.lastScrollPos = this.container.scrollLeft;
    }


    /* ========================================
       RESIZING
    ======================================== */

    resize() {

        const height =
            this.thumbnailManager.baseHeight *
            this.thumbnailManager.widthMultiplier;

        this.leftArrow.style.height = height * 0.5 + "px";
        this.rightArrow.style.height = height * 0.5 + "px";

        this.leftArrow.style.top = height * 0.25 + "px";
        this.rightArrow.style.top = height * 0.25 + "px";
    }


    /* ========================================
       UPDATE
    ======================================== */

    update() {

        const target = this.calculateTargetSpeed();

        this.updateAutoScroll(target);

        this.updateArrows();

        this.scrollNewThumbnails();

        this.updateScrollState();

        this.thumbnailManager.updateHoverStates(
            this.isScrolling,
            this.isEdgeScrolling,
            this.lastScrollTime,
            this.time
        );
    }

}


class ThumbnailWidget {

    constructor(project, element, projectIndx) {

        this.project = project;
        this.element = element;

        this.image = element.querySelector(".project-thumb-img");
        this.titleText = element.querySelector(".project-thumb-title");

        this.projectIndx = projectIndx;

        this.isMouseOver = false;
    }


    setHover(value) {
        this.isMouseOver = value;
    }


    setHoverClass(value) {
        this.element.classList.toggle("hover", value);
    }


    updateProject(project) {

        this.project = project;

        this.image.src = project.getThumbnailSrc();

        this.titleText.textContent =
            project.getThumbnailText();
    }

}




export default class OtherProjectViewer {

    constructor() {

        this.container = document.getElementById("other-projects-view");

        this.scrollContainer = document.createElement("div");
        this.scrollContainer.id = "pv-scroller";

        this.inspectContainer = document.createElement("div");
        this.inspectContainer.id = "pv-inspect-section";
        this.inspectContainer.style.display = "none";

        this.container.appendChild(this.scrollContainer);
        this.container.appendChild(this.inspectContainer);


        // Create managers

        this.projectManager = new ProjectManager(projectNames);

        this.inspector = new ProjectInspector(
            this.inspectContainer
        );

        this.thumbnailManager = new ThumbnailManager(
            this.scrollContainer,
            this.projectManager,
            this.inspector
        );

        this.scroller = new ThumbnailScroller(
            this.scrollContainer,
            this.thumbnailManager
        );
    }


    start() {

        this.projectManager.setupProjects();

        this.thumbnailManager.fill();

        this.scroller.startScrollVal =
            this.scrollContainer.scrollLeft;
    }


    update() {

        this.scroller.update();

        this.inspector.update();
    }


    resize() {

        this.thumbnailManager.resize();

        this.scroller.resize();
    }


    switchFilter() {

        this.inspector.close();

        this.projectManager.toggleFilter();

        const label = this.projectManager.viewingFeatured
            ? "Featured Projects"
            : "All Projects";

        this.filterButton.textContent = label;

        this.filterSubLabel.textContent =
            `A collection of projects I've worked on (click '${label}' to toggle)`;

        this.thumbnailManager.fill();

        this.scroller.startScrollVal =
            this.scrollContainer.scrollLeft;
    }

}












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
            this.shortDesc = "A very early prototype for a vr game. Building on what I learned from my first VR prototype and inspired by games like BoneWorks I wanted to do a more physics heavy experience. In doing so I found it very challenging to deliver a smooth user friendly experience as the physics simulations would all too often conflict with what couldn't be simulated and so a lot of solutions to try to compensate for these times had to be implemented.";
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
        return 'OtherProjects/' + this.title + '/Thumbnails/0.png';
    }
    getThumbnailText() 
    {
        return this.title + ' (' + this.date + ')';
    }
    getImage(indx)
    {
        return 'OtherProjects/' + this.title + '/Thumbnails/' +(indx % this.thumbnailCount) + '.png';
    }
}




class ProjectManager {

    constructor(projectNames) {

        this.projectNames = projectNames;

        this.projects = [];

        this.viewingFeaturedProjs = true;
    }


    setupProjects() {

        this.projects = [];

        this.projectNames.forEach((name, index) => {

            let title = name;

            // Ignore excluded projects
            if (name[0] === '!') return;

            // Only include featured projects when filtering
            if (this.viewingFeaturedProjs && name[0] !== '*') {
                return;
            }

            // Remove featured marker
            if (name[0] === '*') {
                title = name.slice(1);
            }

            this.projects.push(
                new Project(title, index)
            );
        });

        return this.projects;
    }


    toggleFilter() {

        this.viewingFeaturedProjs = !this.viewingFeaturedProjs;

        return this.setupProjects();
    }


    getProject(index) {

        return this.projects[index];
    }


    getProjectCount() {

        return this.projects.length;
    }


    get isViewingFeatured() {

        return this.viewingFeaturedProjs;
    }

}

class ProjectInspector {

    constructor(container) {

        this.container = container;

        this.isInspecting = false;
        this.inspectedProject = null;

        this.content = null;
        this.iframe = null;

        this.animationDuration = 300;
    }


    /* ========================================
       INSPECT PROJECT
    ======================================== */

    inspect(project) {

        if (
            this.inspectedProject === project &&
            this.isInspecting
        ) {
            return;
        }

        this.inspectedProject = project;

        this.isInspecting = true;

        this.iframe = null;

        let bio = project.shortDesc;

        if (project.link !== "") {
            bio = project.link + "<br>" + bio;
        }

        bio += `<br><br>${project.engine} (${project.date})`;


        // Create media section

        let iframeHtml = `
            <div id="head-ifrm" style="position:relative">

                <div id="main-proj-img-div">
                    <img id="main-proj-img"
                         src="${project.getImage(0)}">
                </div>
        `;

        if (project.embddVideo) {

            iframeHtml += `
                <iframe src="${project.embddVideo}"
                        allow="compute-pressure">
                </iframe>
            `;
        }

        iframeHtml += '</div>';


        // Create project information

        const cardHtml = `
            <div>
                <h2 id="main-proj-title">${project.title}</h2>

                <p id="main-proj-desc">${bio}</p>
            </div>
        `;


        // Populate inspection container

        this.container.innerHTML = `
            <div id="pvp-content">

                <div id="project-header-card" class="central-content-2">

                    ${iframeHtml}

                    ${cardHtml}

                </div>

            </div>
        `;


        // Handle iframe

        this.iframe = this.container.querySelector("iframe");

        if (this.iframe !== null) {

            this.iframe.style.opacity = 0;

            this.iframe.addEventListener("load", () => {

                this.onLoadIFrame(this.iframe);
            });

            const bufferIcon = document.createElement("img");

            bufferIcon.classList.add("buffer-icon");

            bufferIcon.src = "Assets/bufferIcon.png";

            this.container
                .querySelector("#main-proj-img-div")
                .appendChild(bufferIcon);
        }


        // Initialise animation

        this.content = this.container.querySelector("#pvp-content");

        this.container.style.display = "block";

        this.content.style.overflow = "hidden";
        this.content.style.maxHeight = "0px";
        this.content.style.opacity = "0";

        this.content.style.transition =
            `max-height ${this.animationDuration}ms ease, opacity 200ms ease`;

        // Force browser to register initial state
        this.content.offsetHeight;

        const targetHeight = this.content.scrollHeight;

        this.content.style.minHeight = targetHeight + "px";
        this.content.style.maxHeight = targetHeight + "px";
        this.content.style.opacity = "1";
    }


    /* ========================================
       CLOSE INSPECTOR
    ======================================== */

    close() {

        if (!this.isInspecting) return;

        this.isInspecting = false;

        if (this.content) {

            this.content.style.maxHeight = "0px";
            this.content.style.minHeight = "0px";
            this.content.style.opacity = "0";

            const content = this.content;

            setTimeout(() => {

                if (!this.isInspecting && this.content === content) {

                    this.container.style.display = "none";
                    this.container.innerHTML = "";

                    this.content = null;
                    this.iframe = null;
                    this.inspectedProject = null;
                }

            }, this.animationDuration);
        }
    }

    /* ========================================
       UPDATE INSPECTION ANIMATION
    ======================================== */

    update() {

        if (!this.isInspecting || !this.content) return;

        // Keep the animation's target height updated
        // if images or other content change its dimensions.
        const targetHeight = this.content.scrollHeight;

        this.content.style.maxHeight = targetHeight + "px";
    }


    /* ========================================
       IFRAME LOADED
    ======================================== */

    onLoadIFrame(iframe) {

        setTimeout(() => {

            const buffer = this.container.querySelector(
                ".buffer-icon"
            );

            if (buffer) {
                buffer.style.opacity = 0;
            }

            const matchElement = this.container.querySelector(
                "#main-proj-img"
            );

            if (!matchElement || !iframe) return;

            const rect = matchElement.getBoundingClientRect();

            if (window.isMobile) {

                iframe.style.width = (rect.width + 1) + "px";

                iframe.style.height = (rect.height + 0.5) + "px";

                iframe.style.left = "0.25px";
            }
            else {

                iframe.style.height = rect.height + "px";
            }

            iframe.style.opacity = 1;

        }, 1000);
    }

}


const projectNames = ["*Space Blocks", "*Untitled VR Game", "*Apothalypse", "Down Stream", "*Battle Babies", "*The Yellow Mellow Fellow", "*Home Wrecker", "*Slice VR Prototype", 
    "*Multiplayer FPS", "*Horror Laboratory", "The Punk Police", "*Baby Snatcher", "!Limb Land", "!Ant Farm Simulation", "SuperGary LowFPS", 
    "!Multiplayer FPS", "!Gnome Wizard", "!Alien Harbourer"];
// const pvContainer = document.getElementById("other-projects-view");

// const pvPreviewScroll = document.createElement("div");
// pvPreviewScroll.id = "pv-scroller";

// const pvPInspectSection = document.createElement("div");
// pvPInspectSection.id = "pv-inspect-section";

// pvPInspectSection.style.display = "none";

// pvContainer.appendChild(pvPreviewScroll);
// pvContainer.appendChild(pvPInspectSection);


// Create managers

// const projectManager = new ProjectManager(projectNames);

// const projectInspector = new ProjectInspector(pvPInspectSection);