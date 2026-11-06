import AppBehavior from "./appBehavior.js";

export default class ProjectsView extends AppBehavior
{
    constructor(parentApp)
    {
        super(parentApp);

        this.projects = [];
        this.orderOfProjects = ["STATIC77"];
    }

    async start()
    {
        this.projectsList = document.getElementById("projects-list");

        await this.setupProjects();
    }

    async setupProjects()
    {
        let projectsHTML = "";

        this.projects = [];

        for (const projName of this.orderOfProjects)
        {
            // Dynamically import the project class
            const module = await import(`./Projects/${projName}/project.js`);

            // Instantiate the default-exported class
            const ProjectClass = module.default;
            const project = new ProjectClass(this.parentApp, projName);

            this.projects.push(project);

            // Load the project's HTML
            projectsHTML += await project.loadBaseHTML();
        }

        this.projectsList.innerHTML = projectsHTML;
    }
}

export class Project extends AppBehavior
{
    constructor(parentApp, name)
    {
        super(parentApp);
        this.name = name;
    }

    async loadBaseHTML()
    {
        const response = await fetch("./Projects/" + this.name + "/base.html");

        if (!response.ok)
        {
            throw new Error(`Failed to load project HTML: ${response.status}`);
        }

        return await response.text();
    }
}