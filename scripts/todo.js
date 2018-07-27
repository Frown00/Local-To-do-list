// Okresla czas DD/NM/RRRR
Date.prototype.today = function () {
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth() + 1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// Okresla czas HH:MM:SS
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}



// Zainicjowanie konstruktora dla Obiektu Task
class Task {

    constructor(id, text = "Task", links = [], images = [], date = new Date(), progressDate = new Date()) {
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

}

// Zmienne
let listOfAllTasks = [];           // Przechowuje liste zadan do zrobienia
let currentId = 1;
let appendTaskId = 0;


// Baza IndexedDB
let taskStore = localforage.createInstance({
    name: "task_store"
});


//// URL do podstron/zakladek ////
let todoUrl = "https://frown00.github.io/Local-To-do-list/todo.html";
let doingUrl = "https://frown00.github.io/Local-To-do-list/doing.html";
let doneUrl = "https://frown00.github.io/Local-To-do-list/done.html";


//// HANDLARY ////
let todoBtn = document.getElementById("todo");
let doingBtn = document.getElementById("doing");
let doneBtn = document.getElementById("done");

let taskTextarea = document.getElementsByClassName("task-textarea");
let listTaskUl = document.getElementsByClassName("list-of-tasks");
let haveDoneBtn = document.getElementsByClassName("icon-ok-circled");
let inProgressBtn = document.getElementsByClassName("icon-flag");
let removeBtn = document.getElementsByClassName("icon-trash");


//// LISTENERY ////
todoBtn.addEventListener("click", () => {
    displayPage(todoUrl);
    appendAllTasks(listOfAllTasks);
});

doingBtn.addEventListener("click", () => {
    displayPage(doingUrl);
});

doneBtn.addEventListener("click", () => {
    displayPage(doneUrl);
});



//////////////////////  XTMLHttpRequest / AJAX   ///////////////////////////////
let get = (url) => {

    return new Promise((resolve, reject) =>{

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onload = () => {
            if (xhr.status == 200) {
                resolve(xhr.responseText);
            }
            else {
                reject(Error(xhr.statusText));
            }
        };

        xhr.onerror = () => {
            reject(Error("Network Error"));
        };

      xhr.send();
    });
}

let displayPage = (url) => {
    get(url).then((response) => {
        //document.getElementById("main").innerHTML = response;
        document.getElementById("main").innerHTML = response
        let arr = [];
        let len = 0;
        let addTaskBtn = document.getElementById("add-task-btn");
        taskStore.length().then(function(numberOfKeys){
            len = numberOfKeys;
        }).catch(function(err) {
            console.log(err);
        });

        //// Dodanie zadan z bazy do listy ////
        taskStore.iterate((task, key, iterationNumber) => {

            arr.push(task);
            if(iterationNumber > len - 1){
                return arr;
            }

        }).then((arrTask) =>{

            if(arrTask!== undefined && arrTask.length > 0) {
                listOfAllTasks = arrTask;

                // W zaleznosci od wybranego url dostosowuje wyswietlane zadania
                if(url === todoUrl) {

                    listOfAllTasks = _.sortBy(listOfAllTasks, 'id');
                    lastTask = _.last(listOfAllTasks);
                    currentId = parseInt(lastTask.id) + 1;                                          // Inkrementacja id od ostatniego zapisanego zadania
                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "todo");
                    appendAllTasks(listOfAllTasks);

                } else if(url === doingUrl) {

                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "in progress");
                    appendAllTasks(listOfAllTasks);

                } else if(url === doneUrl) {
                    // TODO
                    // Sortowanie po dacie, aby moc wyswietlic zrobione zadania segregujac po dniu
                    listOfAllTasks = _.filter(listOfAllTasks, (task) => task.state === "have done");
                    appendAllTasks(listOfAllTasks);

                }

            } else {
                currentId = 1;
            }
        }).catch((err) => {
            console.log(err);
        });

    }).catch((error) => {
        console.error("Failed!", error);
    });
}
/////////////////////////////////////////////////////////////////////////

//////////////////////  METODY GLOBALNE   ///////////////////////////////

//// Dodanie zadania do listy i bazy ////
let addTask = () => {
    text = taskTextarea[0].value;
    links = [];

    //// Dodanie poprawnego zadania do bazy ////
    isText = text.replace(/\s/g, "").length;      // Sprawdzenie czy tekst nie jest pusty
    if(isText) {
        text = text.replace(" ", "&nbsp");              // Podmiana białych znaków na odpowiednik html (non-breaking space)
        text = text.replace(/\r?\n/g, "<br>");          // Podmiana nowej linii w stringu na odpowiednik html

        let urlRegex = /(https?:\/\/[^\s]+)/g;          // Regex do rozpoznawania url (https, http)
        text = text.replace(urlRegex, function(url) {   // Usuniecie z tekstu linkow i dodanie ich do tablicy
            links.push(url);
            return "";
        });

        // Dodanie do bazy oraz do tablicy zdan //
        let task = new Task((currentId.toString()), text, links);
        taskStore.setItem(task.id, task).then(function(value) {
            // This will output `1`.
            listOfAllTasks.push(task);
            appendTask(task);
            currentId += 1;
        }).catch(function(err) {
            console.log(err);
        });
    }
    taskTextarea[0].focus();
    taskTextarea[0].value = "";     // Wyczyszczenie pola tekstowego
}


//// Dołaczanie wszystkich zapisanych zadań do DOM ////
let appendAllTasks = (listTasks) => {
    appendTaskId = 0;
    for(let i = 0; i < listTasks.length; i++) {
        appendTask(listTasks[i]);
    }
}

//// Dołacza zadanie do DOM ////
let appendTask = (task = []) => {

    //// Tworzenie elementow ////
    let taskLi = document.createElement("li");
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

    //// Ustawainie atrybutow ////
    doingIcon.setAttribute("class", "big-icon icon-flag");
    removeIcon.setAttribute("class", "big-icon icon-trash");
    editIcon.setAttribute("class", "big-icon icon-pencil-squared");
    doneIcon.setAttribute("class", "big-icon icon-ok-circled");

    taskLi.setAttribute("class", "task-container");
    taskLi.setAttribute("data-task", task.id);
    taskDiv.setAttribute("class", "task");
    iconsDiv.setAttribute("class", "icons");
    linksUl.setAttribute("class", "links");

    //// Obrobka tekstu ////
    text.innerHTML = task.text;

    //// Obrobka linkow ////
    if(task.links.length > 0) {
        links.innerHTML = `<h4 class="links-title"> Links: </h4>`;
        for(let i = 0; i < task.links.length; i++) {
            let linksLi = document.createElement("li");
            linksLi.innerHTML = `<a href="${task.links[i]}">${task.links[i]}</a>`;
            linksUl.appendChild(linksLi);
        }

    };

    //// Obrobka daty ////
    date.innerHTML += task.startDay + " " + task.startHour;

    // Dołaczanie elementow do DOM'u
    links.appendChild(linksUl);

    taskDiv.appendChild(text);
    taskDiv.appendChild(links);
    taskDiv.appendChild(date);

    iconsDiv.appendChild(doingIcon);
    iconsDiv.appendChild(doneIcon);
    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(removeIcon);

    taskLi.appendChild(taskDiv);
    taskLi.appendChild(iconsDiv);

    listTaskUl[0].appendChild(taskLi);

    removeBtn[appendTaskId].addEventListener("click", removeTask, false);
    inProgressBtn[appendTaskId].addEventListener("click", () => {
        changeState("in progress");
    });
    haveDoneBtn[appendTaskId].addEventListener("click", () => {
        changeState("have done");
    });
    appendTaskId += 1;
}


//// Usuwanie zadania z DOM oraz z bazy ////
let removeTask = (e) => {
    const task = e.target.parentElement.parentElement;  // taskLi
    const parentTask = task.parentElement;              // taskUl
    const taskId = task.dataset.task;                   // id
    parentTask.removeChild(task);
    appendTaskId -= 1;

    taskStore.removeItem(taskId).then(function() {
        //console.log('Task deleted');
    }).catch(function(err) {
        console.log(err);
    });

}

//// Zmiana stanu wybranego zadania ////
////    state = todo -> todo
////    state = in progress -> doing
////    state = have done -> done
let changeState = (state) => {
    const task = event.target.parentElement.parentElement;  // taskLi
    const parentTask = task.parentElement;                  // taskUl
    const taskId = task.dataset.task;                       // id

    let taskCopy;                                           // Kopia obiektu z bazy potrzebna do przeniesienia (IndexedDB nie umozliwia zmian wartosci w krotkach)

    taskStore.getItem(taskId).then(function(t) {
        taskCopy = Object.assign({}, t);
        taskCopy.state = state;
    }).then(function(t) {
        taskStore.removeItem(taskId).then(function() {
            parentTask.removeChild(task);
            appendTaskId -= 1;
        }).catch(function(err){
            console.log(err);
        });
    }).then(function(task){
        taskStore.setItem(taskCopy.id, taskCopy).then(function() {

        }).catch(function(err){
            console.log(err);
        });
    }).catch(function(err) {
        console.log(err);
    });
}

////////////////////////////////////////////////////////


(() => {
    displayPage(todoUrl);
})();
