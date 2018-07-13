// Okresla czas DD/NM/RRRR
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth() + 1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// Okresla czas HH:MM:SS
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

// Zainicjowanie konstruktora dla Obiektu Task
function Task(id, text = "Task", links = [], images = []) {
    this.id = id;
    this.text = text;
    this.links = links;
    this.images = images;
    this.date = new Date();
    this.startDay = this.date.today();
    this.startHour = this.date.timeNow(); 
}


// Handlers
let taskTextarea = document.getElementById("task-textarea");
let addTaskBtn = document.getElementById("add-task-btn");
let listTaskUl = document.getElementById("list-of-tasks");

let removeBtn = document.getElementsByClassName("icon-trash");


// Zmienne
//let listOfTasks = [];
let listOfTasks = [];           // Przechowuje liste zadan do zrobienia
let doingTasks = [];            // Przechowuje liste zadan robionych
let doneTasks = [];             // Przechowuje liste zadan zrobionych
let currentId = 1;
let appendTaskId = 0;
//

function addTask() {

    text = taskTextarea.value;
    links = [];
    isText = text.replace(/\s/g, "").length;      // Sprawdzenie czy tekst nie jest pusty
    if(isText) {
        text = text.replace(" ", "&nbsp");        // Podmiana białych znaków na odpowiednik html (non-breaking space)
        text = text.replace(/\r?\n/g, "<br>");    // Podmiana nowej linii w stringu na odpowiednik html
        let urlRegex = /(https?:\/\/[^\s]+)/g;    // Regex do rozpoznawania url (https, http)
        text = text.replace(urlRegex, function(url) {
            links.push(url);
            return "";
        });
        //console.log(links);
        let task = new Task(currentId, text);
        appendTask(task);
        appendTaskId += 1;
        currentId += 1;        
        listOfTasks.push(task);
    }
    document.getElementById("task-textarea") .focus();
    taskTextarea.value = "";
}

function removeTask(e) {
    console.log(e.target);
    let task = e.target.parentElement.parentElement;
    let parentTask = task.parentElement;
    parentTask.removeChild(task);
    appendTaskId -= 1;
}


// Wczytuje wszystkie zadania
function readSavedTasks() {

    for(let i = 0, len = listOfTasks.length; i < len; i++) {
       appendTask(listOfTasks[i]);
    }
    
}

// Dołacza zadanie do dokumentu
function appendTask(task = []) {
    let li = document.createElement("li");
    let taskDiv = document.createElement("div");
    let iconsDiv = document.createElement("div");    
    let p = document.createElement("p");
    let doingIcon = document.createElement("i");
    let removeIcon = document.createElement("i");
    let editIcon = document.createElement("i");
    let doneIcon = document.createElement("i");
    
    doingIcon.setAttribute("class", "big-icon icon-flag");
    removeIcon.setAttribute("class", "big-icon icon-trash");
    editIcon.setAttribute("class", "big-icon icon-pencil-squared");
    doneIcon.setAttribute("class", "big-icon icon-ok-circled");
    
    

    li.setAttribute("class", "task-container");
    taskDiv.setAttribute("class", "task");
    iconsDiv.setAttribute("class", "icons");
    
    p.innerHTML = task.text;
    p.innerHTML += "<br>" + task.startDay + " " + task.startHour;
    
    //console.log(li);
    
    
    taskDiv.appendChild(p);

    iconsDiv.appendChild(doingIcon);
    iconsDiv.appendChild(doneIcon);
    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(removeIcon);
    
    li.appendChild(taskDiv);
    li.appendChild(iconsDiv);
    
    listTaskUl.appendChild(li);

    removeBtn[appendTaskId].addEventListener("click", removeTask, false);
}

readSavedTasks();