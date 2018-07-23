
// Okresla czas DD/NM/RRRR
Date.prototype.today = function () {
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth() + 1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// Okresla czas HH:MM:SS
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

var uniqueId = function() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
};
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

// Bazy do przechowywania zadan
let todoStore = localforage.createInstance({
    name: "Store for to do task"
});

// Zmienne
    //let listOfTasks = [];
    let todoTasks = [];           // Przechowuje liste zadan do zrobienia
    let doingTasks = [];            // Przechowuje liste zadan robionych
    let doneTasks = [];             // Przechowuje liste zadan zrobionych
    let currentId = 1;
    let appendTaskId = 0;


// Listeners
//addTaskBtn.addEventListener("click", addTask);



// Dodawanie zadania do strony
var addTask = function() {
    console.log("Dolaczono " + appendTaskId);
    
    text = taskTextarea[0].value;
    console.log(text);
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
        let task = new Task(uniqueId(), text);
        console.log("Zadanie : ");
        console.log(task);
        appendTask(task);
        
        currentId += 1;
        todoTasks.push(task);

        todoStore.setItem(task.id, task).then(function(value) {
            // This will output `1`.
            console.log(value[0]);
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
    }
    taskTextarea[0].focus();
    taskTextarea[0].value = "";
    
    
}

// Dołacza zadanie do dokumentu
var appendTask = function(task = []) {
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
    li.setAttribute("data-task", task.id);
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

    listTaskUl[0].appendChild(li);
    
    removeBtn[appendTaskId].addEventListener("click", removeTask, false);
    appendTaskId += 1;
}



var removeTask = function(e) {
    console.log(e.target);
    let task = e.target.parentElement.parentElement; // li
    let parentTask = task.parentElement; // ul
    parentTask.removeChild(task);
    appendTaskId -= 1;

    
    todoStore.removeItem(task.dataset.task).then(function() {
        // Run this code once the key has been removed.
        console.log('Task deleted');
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
    
}




// Wczytuje wszystkie zadania
function readSavedTasks() {
    
    let tt = [];
    let obj1 = {
        "a": 1
    };

    let obj2 = {
        "a": 2
    };
    // Dodawanie zadan do tablicy
    todoStore.iterate(function(task, key, iterationNumber){
        //console.log(typeof task);
        //todoTasks.push(task);
    }).then(function(){
        //end
    }).catch(function(err) {
        console.log(err);
    });

    tt.push(obj1);
    tt.push(obj2);
    
    console.log(tt);

    appendTaskId = 0;
    // Dołaczanie zadań do dokumentu html
    todoStore.iterate(function(task, key, iterationNumber){
        appendTask(task);
        
    }).then(function() {
        console.log("End");
    }).catch(function(err) {
        console.log(err);
    });

    

}

// AJAX - do wczytywania zakładek/stron
(function() {
    
    let todoBtn = document.getElementById("todo");
    let doingBtn = document.getElementById("doing");
    let doneBtn = document.getElementById("done");
    
    todoBtn.addEventListener("click", showTodoTasks);
    doingBtn.addEventListener("click", showDoingTasks);
    
    const xhr = new XMLHttpRequest();
    
    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4 && this.status == 200) {
            document.getElementById("main").innerHTML = xhr.responseText;
        } else if(this.status == 404) {
            console.log("File not found");
        }
    });

    

    function showDoingTasks() {
        xhr.open("GET", "http://localhost/Local-To-do-list/doing.html", false);
        xhr.send();
        
    }

    function showTodoTasks() {
        xhr.open("GET", "http://localhost/Local-To-do-list/todo.html", false);
        xhr.send();
        
        readSavedTasks();
    }
    showTodoTasks();
    
})();

let taskTextarea = document.getElementsByClassName("task-textarea");
let addTaskBtn = document.getElementById("add-task-btn");
let listTaskUl = document.getElementsByClassName("list-of-tasks");
let removeBtn = document.getElementsByClassName("icon-trash");
let inputText = document.getElementsByClassName("bob");