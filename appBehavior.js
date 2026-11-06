
class AppBehavior
{
    static rootApp=null;
    constructor(parentApp=null)
    {
        this.rootApp=AppBehavior.rootApp;
        this.parentApp = parentApp;
        this.childNodes = [];
        if (parentApp)
        {
            parentApp.childNodes.push(this);
        }
    }
    start()
    {
        this.childNodes.forEach(child => child.start());
    }
    update()
    {
        this.childNodes.forEach(child =>{if (!child.dontautoupdate) {child.update()}});
    }
    scaledUpdate()
    {
        this.childNodes.forEach(child => child.scaledUpdate());
    }
    lateUpdate()
    {
        this.childNodes.forEach(child =>{if (!child.dontautoupdate) {child.lateUpdate()}});
    }
    onResize()
    {
        this.childNodes.forEach(child => child.onResize());
    }
    beforeUnload(event)
    {
        this.childNodes.forEach(child => child.beforeUnload(event));
    }
    onDisconnect()
    {
        this.childNodes.forEach(child => child.onDisconnect() );
    }
    destroy()
    {
        if (this.parentApp)
        {
            this.parentApp.removeChild(this);
        }
    }
    removeChild(cn)
    {
        this.childNodes.splice(this.childNodes.indexOf(cn),1);
    }


}

export {AppBehavior as default};