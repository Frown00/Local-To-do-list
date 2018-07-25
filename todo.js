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
function Task(id, text = "Task", links = ["http://google.com"], images = ["http://google.com"]) {
    this.id = id;
    this.text = text;
    this.links = links;
    this.images = images;
    this.date = new Date();
    this.startDay = this.date.today();
    this.startHour = this.date.timeNow();
    this.state = "todo";
}

// Zmienne
    //let listOfTasks = [];
let listOfAllTasks = [];           // Przechowuje liste zadan do zrobienia

let currentId = 1;
let appendTaskId = 0;

// Baza IndexedDB
let todoStore = localforage.createInstance({
    name: "Store for to do task"
});



function appendAllTasks(listTasks) {
    // Dołaczanie zadań do dokumentu html
    console.log("Dlugosc:" + listTasks.length);
    appendTaskId = 0;
    for(let i = 0; i < listTasks.length; i++) {
        appendTask(listTasks[i]);
    }
}



//////  XMLHttpRequest   //////
let get = (url) => {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
  
      xhr.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (xhr.status == 200) {
          // Resolve the promise with the response text
          resolve(xhr.responseText);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(xhr.statusText));
        }
      };
  
      // Handle network errors
      xhr.onerror = function() {
        reject(Error("Network Error"));
      };
  
      // Make the request
      xhr.send();
    });
}

let displayPage = (url) => {
    get(url).then((response) => {
        //document.getElementById("main").innerHTML = response;
        document.getElementById("main").innerHTML = response
        let arr = [];
        let len = 0;

        todoStore.length().then(function(numberOfKeys){
            len = numberOfKeys;   
        }).catch(function(err) {
            console.log(err);
        });
        
        todoStore.iterate(function(task, key, iterationNumber) {
            //console.log(typeof task);
            //let t = new Task(task.id, task.text, task.links, task.images);
            arr.push(task);
            if(iterationNumber > len - 1){
                console.log(arr);
                return arr;                
            }    
        }).then(function(arrTask){
            if(arrTask.length > 0) {
                listOfAllTasks = arrTask;
                listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "todo"); 
                listOfAllTasks = _.sortBy(listOfAllTasks, 'id');
                //appendAllTasks(listOfAllTasks);
                lastTask = _.last(listOfAllTasks);
                currentId = parseInt(lastTask.id) + 1;
                appendAllTasks(listOfAllTasks);
            } else {
                currentId = 1;
            }
        }).catch(function(err) {
            console.log(err);
        });
        
    }).catch((error) => {
        console.error("Failed!", error);
    });  
}
//console.log(todoTasks);
/////////////////////////////////////////////////

let todoBtn = document.getElementById("todo");
let doingBtn = document.getElementById("doing");
let doneBtn = document.getElementById("done");
let todoUrl = "http://localhost/Local-To-do-list/todo.html";
let doingUrl = "http://localhost/Local-To-do-list/doing.html";
let doneUrl = "http://localhost/Local-To-do-list/done.html";


let addTaskBtn = document.getElementById("add-task-btn");
let taskTextarea = document.getElementsByClassName("task-textarea");
//let listTaskUl = document.getElementsByClassName("list-of-tasks");
let removeBtn = document.getElementsByClassName("icon-trash");

todoBtn.addEventListener("click", function() {
    displayPage(todoUrl);
    appendAllTasks(listOfAllTasks);   
});
doingBtn.addEventListener("click", function() { 
    displayPage(doingUrl);
});

////////////////////////////////////////////////////////

displayPage(todoUrl);

//doneBtn.addEventListener("click", displayPage(doneUrl));
// Dodawanie zadania do strony
let addTask = function() {
    text = taskTextarea[0].value;
    
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
        let task = new Task((currentId.toString()) , text);
        
        todoStore.setItem(task.id, task).then(function(value) {
            // This will output `1`.
            listOfAllTasks.push(task);
            appendTask(task);
            currentId += 1;
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
    }
    taskTextarea[0].focus();
    taskTextarea[0].value = "";
    
    
}

// Dołacza zadanie do dokumentu
let appendTask = function(task = []) {
    
    let listTaskUl = document.getElementsByClassName("list-of-tasks");
    let li = document.createElement("li");
    let taskDiv = document.createElement("div");
    let iconsDiv = document.createElement("div");
    let text = document.createElement("p");
    
    let date = document.createElement("span");

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

    text.innerHTML = task.text;
    date.innerHTML += "<br>" + task.startDay + " " + task.startHour;

    //console.log(li);


    taskDiv.appendChild(text);
    taskDiv.appendChild(date);

    iconsDiv.appendChild(doingIcon);
    iconsDiv.appendChild(doneIcon);
    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(removeIcon);

    li.appendChild(taskDiv);
    li.appendChild(iconsDiv);
    console.log(li);
    console.log(listTaskUl);
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