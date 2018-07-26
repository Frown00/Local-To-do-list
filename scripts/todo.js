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
function Task(id, text = "Task", links = [], images = [], date = new Date(), progressDate = new Date()) {
    this.id = id;
    this.state = "todo";

    this.text = text;
    this.links = links;
    this.images = images;

    this.date = date;
    this.startDay = this.date.today();
    this.startHour = this.date.timeNow();

    this.progressDate = progressDate;
    this.progressStartDay = this.progressDate.today();
    this.progressStartHour = this.progressDate.timeNow();
}

// Zmienne
    //let listOfTasks = [];
let listOfAllTasks = [];           // Przechowuje liste zadan do zrobienia

let currentId = 1;
let appendTaskId = 0;
let listTaskUl = document.getElementsByClassName("list-of-tasks");
// Baza IndexedDB
let todoStore = localforage.createInstance({
    name: "Store for to do task"
});







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
                listOfAllTasks = _.sortBy(listOfAllTasks, 'id');
                lastTask = _.last(listOfAllTasks);
                currentId = parseInt(lastTask.id) + 1;

                // W zaleznosci od wybranego url dostosuj wyswietlane zadania
                if(url === todoUrl) {
                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "todo");
                //appendAllTasks(listOfAllTasks);
                    appendAllTasks(listOfAllTasks);
                } else if(url === doingUrl) {
                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "in progress");
                    appendAllTasks(listOfAllTasks);
                } else if(url === doneUrl) {
                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "have done");
                    appendAllTasks(listOfAllTasks);
                }

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
let todoUrl = "https://frown00.github.io/Local-To-do-list/todo.html";
let doingUrl = "https://frown00.github.io/Local-To-do-list/doing.html";
let doneUrl = "https://frown00.github.io/Local-To-do-list/done.html";


let addTaskBtn = document.getElementById("add-task-btn");
let taskTextarea = document.getElementsByClassName("task-textarea");
//let listTaskUl = document.getElementsByClassName("list-of-tasks");
let haveDoneBtn = document.getElementsByClassName("icon-ok-circled");
let inProgressBtn = document.getElementsByClassName("icon-flag");
let removeBtn = document.getElementsByClassName("icon-trash");

todoBtn.addEventListener("click", () => {
    displayPage(todoUrl);
    appendAllTasks(listOfAllTasks);
});
doingBtn.addEventListener("click", () => {
    displayPage(doingUrl);
});
doneBtn.addEventListener("click", function() {
    displayPage(doneUrl);
});


////////////////////////////////////////////////////////
(function(){
displayPage(todoUrl);
})();
//doneBtn.addEventListener("click", displayPage(doneUrl));
// Dodawanie zadania do strony
let appendAllTasks = (listTasks) => {
    // Dołaczanie zadań do dokumentu html
    console.log("Dlugosc:" + listTasks.length);
    appendTaskId = 0;
    for(let i = 0; i < listTasks.length; i++) {
        appendTask(listTasks[i]);
    }
}

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
        console.log(links);
        let task = new Task((currentId.toString()), text, links);

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

    //// Tworzenie elementow
    let li = document.createElement("li");
    let taskDiv = document.createElement("div");
    let iconsDiv = document.createElement("div");
    let text = document.createElement("p");
    let links = document.createElement("p");
    let linksUl = document.createElement("ul");

    let date = document.createElement("span");

    let doingIcon = document.createElement("i");
    let removeIcon = document.createElement("i");
    let editIcon = document.createElement("i");
    let doneIcon = document.createElement("i");

    //// Ustawainie atrybutow
    doingIcon.setAttribute("class", "big-icon icon-flag");
    removeIcon.setAttribute("class", "big-icon icon-trash");
    editIcon.setAttribute("class", "big-icon icon-pencil-squared");
    doneIcon.setAttribute("class", "big-icon icon-ok-circled");

    li.setAttribute("class", "task-container");
    li.setAttribute("data-task", task.id);
    taskDiv.setAttribute("class", "task");
    iconsDiv.setAttribute("class", "icons");
    linksUl.setAttribute("class", "links");

    //// Obrobka tekstu
    text.innerHTML = task.text;

    //// Obrobka linkow
    if(task.links.length > 0) {
        links.innerHTML = `<h4 class="links-title"> Links: </h4>`;
        for(let i = 0; i < task.links.length; i++) {
            let linksLi = document.createElement("li");
            linksLi.innerHTML = `<a href="${task.links[i]}">${task.links[i]}</a>`;
            linksUl.appendChild(linksLi);
        }

    };

    date.innerHTML += task.startDay + " " + task.startHour;

    //console.log(li);
    links.appendChild(linksUl);

    taskDiv.appendChild(text);
    taskDiv.appendChild(links);
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
    inProgressBtn[appendTaskId].addEventListener("click", () => {
        changeState("in progress");
    });
    haveDoneBtn[appendTaskId].addEventListener("click", () => {
        changeState("have done");
    });
    appendTaskId += 1;
}



let removeTask = (e) => {
    console.log(e.target);
    let task = e.target.parentElement.parentElement; // li
    let parentTask = task.parentElement; // ul
    let taskId = task.dataset.task; // id
    parentTask.removeChild(task);
    appendTaskId -= 1;


    todoStore.removeItem(taskId).then(function() {
        // Run this code once the key has been removed.
        console.log('Task deleted');
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

}

let changeState = (state) => {
    console.log(event);
    console.log(state);
    const task = event.target.parentElement.parentElement;
    const taskId = task.dataset.task;
    const parentTask = task.parentElement;
    let taskCopy;

    todoStore.getItem(taskId).then(function(t) {
        taskCopy = Object.assign({}, t);
        taskCopy.state = state;
    }).then(function(t) {
        todoStore.removeItem(taskId).then(function() {
            parentTask.removeChild(task);
            appendTaskId -= 1;
        }).catch(function(err){
            console.log(err);
        });
    }).then(function(task){
        todoStore.setItem(taskCopy.id, taskCopy).then(function() {

        }).catch(function(err){
            console.log(err);
        });
    }).catch(function(err) {
        console.log(err);
    });

    //removeTask(event);
}
