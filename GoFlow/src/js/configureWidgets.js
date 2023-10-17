import { TasksWidget } from "./Widgets/tasks.js"
import { IncrementalGoalWidget } from "./Widgets/incrementalGoal.js"
import { TextBox } from "./Widgets/textBox.js";
import { MediaWidget } from "./Widgets/media.js";


let widgets = [];
let widgetData = {};
let currentProject = "Project1"
let currentProjectPage = "page2"
let allPages;
let projectData;
// call rePosWidgets functiom on resizing window
window.onresize = rePosWidgets

// todo: do it extra file
const exampleData = {xPos: "0px", yPos: "0px",anchorX: ["left","0px"], anchorY:["top","0px"], title: "Title", project: currentProject, page: currentProjectPage}
const titleHtml = `        
<div class="title-bar">
    <span contenteditable="true" class="titleText">title</span>
</div>  `;

const restoreData = async () => {
    try {
        const result = await window.electronAPI.restoreData();

        if (result.success) {
            projectData = {... result}
        } else {
            console.error("Data restore failed:", result.error);
        }
    } catch (error) {
        console.error("Error while restoring data:", error);
    }
};

async function loadPage(){
    document.querySelector(".widgets").innerHTML = ""
    for (const widget of projectData.projects[currentProject]["pages"][currentProjectPage]) {
        spawnWidget(widgetData[widget.data.type]["html"], widget.uniqueWidgetData, widget.widgetId, widget.data.type, widget.data)
    } 
    allPages = projectData.projects[currentProject]["pages"]
    rePosWidgets()
}

const loadWidgetData = async () =>{
    try {
        const result = await window.electronAPI.getWidgetData();

        if (result.success) {
            for (const wD of result.filesData) {
                widgetData[wD.type] = wD;        
            }
        } else {
            console.error("Data restore failed:", result.error);
        }
    } catch (error) {
        console.error("Error while restoring data:", error);
    }
    
    await restoreData()
    await loadPage()
}
function addWidget(type){
    const exampleDataExtended = {...exampleData, ...{type: type, page: currentProjectPage, project: currentProject}}
    spawnWidget(widgetData[type]["html"], {... widgetData[type]["uniqueWidgetData"]}, Math.random().toString(36).substr(2, 10), type, {... exampleDataExtended})
}


function spawnWidget(html, uniqueWidgetData, wId, wType, data){
    const widgetsContainer = document.querySelector(".widgets");
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.id = `${wType}-${wId}`
    widget.innerHTML = titleHtml + html
    widgetsContainer.appendChild(widget);
    if(wType=="tasks"){
        widgets.push(new TasksWidget(wId, data, uniqueWidgetData))
    }else if(wType== "incrementalGoal"){
        widgets.push(new IncrementalGoalWidget(wId, data, uniqueWidgetData))
    }else if(wType=="textBox"){
        widgets.push(new TextBox(wId, data, uniqueWidgetData))
    }else if(wType=="media"){
        widgets.push(new MediaWidget(wId, data, uniqueWidgetData))
    }

}


// addEventListener("DOMContentLoaded", (event) => {
//     document.getElementById("addWidgetButton").addEventListener("click", function() {
//         addWidget("tasks")
//     });
// });

addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("saveData").addEventListener("click", function() {
        for (let w of widgets){
            w.saveData()
        }
    });
});

addEventListener("beforeunload", (event) => {
    for (let w of widgets){
        w.saveData()
    }   
});


document.addEventListener("keydown", async function(event) {
    if(event.target.id == "body"){
        await restoreData()
    // todo make it better (ez task)
    if (event.key === "ArrowLeft") {
        currentProjectPage = "page1"
        loadPage()
        // Do something for the left arrow key press
    } else if (event.key === "ArrowRight") {
        currentProjectPage = "page2"
        loadPage()
    }
    }
  });
  

function rePosWidgets(){
    let width = window.innerWidth
    let height = window.innerHeight
    for (let w of widgets) {
        const anchorX = w.data.anchorX;
        const anchorY = w.data.anchorY;
        let newXPos;
        let newYPos;
      
        // rePos x
        if (anchorX[0] == "right") {
            newXPos = width - parseInt(w.uniqueWidgetData.width) - parseInt(anchorX[1]);
        } else if (anchorX[0] == "left") {
            newXPos = parseInt(anchorX[1]);
        }
    
        // rePos y
        if (anchorY[0] == "bottom") {
            newYPos = height - parseInt(w.uniqueWidgetData.height) - parseInt(anchorY[1]);
        } else if (anchorY[0] == "top") {
            newYPos = parseInt(anchorY[1]);
        }
    
      
        w.data.xPos = newXPos + "px";
        w.data.yPos = newYPos + "px";
        w.updatePos();
      }
      
}
const addButton = document.getElementById("addWidgetButton");
const menu = document.querySelector(".widgetButtonsMenu");

addButton.addEventListener("click", function() {
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
});

document.addEventListener("click", function(event) {
  if (!menu.contains(event.target) && event.target !== addButton) {
    menu.style.display = "none";
  }else if(menu.contains(event.target) && event.target !== addButton){
    menu.style.display = "none";
    addWidget(event.target.getAttribute("data-widgetType"))
  }
});

loadWidgetData();
