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

    constructor(idTask, text = "Task", links = [], images = [], date = new Date(), progressDate = new Date()) {
        this.idTask = idTask;
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

let numTodo = 0;
let numInProgress = 0;
let numHaveDone = 0;

// Baza IndexedDB
let taskStore = localforage.createInstance({
    name: "task_store"
});


//// URL do podstron/zakladek ////
let todoUrl = "http://localhost/local-todo-list/todo.html";
let doingUrl = "http://localhost/local-todo-list/doing.html";
let doneUrl = "http://localhost/local-todo-list/done.html";


//// HANDLARY ////
let todoBtn = document.getElementById("todo");
let doingBtn = document.getElementById("doing");
let doneBtn = document.getElementById("done");

let todoNumber = document.getElementById("number-todo");
let inProgressNumber = document.getElementById("number-inprogress");
let haveDoneNumber = document.getElementById("number-havedone");

let taskTextarea = document.getElementsByClassName("task-textarea");
let listTaskUl = document.getElementsByClassName("list-of-tasks");
let haveDoneBtn = document.getElementsByClassName("icon-ok-circled");
let inProgressBtn = document.getElementsByClassName("icon-flag");

let editBtn = document.getElementsByClassName("icon-pencil-squared");
let removeBtn = document.getElementsByClassName("icon-trash");


//// LISTENERY ////
todoBtn.addEventListener("click", () => {
    displayPage(todoUrl);
    appendAllTasks(listOfAllTasks);
}, true);

doingBtn.addEventListener("click", () => {
    displayPage(doingUrl);
}, true);

doneBtn.addEventListener("click", () => {
    displayPage(doneUrl);
}, true);




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
                listOfAllTasks.map((task) => task.idTask = parseInt(task.idTask));
                listOfAllTasks = _.sortBy(listOfAllTasks, 'idTask');
                
                
                // W zaleznosci od wybranego url dostosowuje wyswietlane zadania
                if(url === todoUrl) {
                    // let textAutoSize = document.querySelector('textarea');
                    // let addTaskBtn = document.getElementById('add-task-btn');
                    // // console.log(textAutoSize);
                    // // // console.log(autosize);
                    // textAutoSize.addEventListener('keydown', autosize, true);
                    // addTaskBtn.addEventListener('click', addTask, true);
                    
                    lastTask = _.last(listOfAllTasks);
                    currentId = parseInt(lastTask.idTask) + 1;                                          // Inkrementacja id od ostatniego zapisanego zadania
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
        

        let urlRegex = /(https?:\/\/[\S]+)/g;          // Regex do rozpoznawania url (https, http)
        text = text.replace(urlRegex, function(url) {   // Usuniecie z tekstu linkow i dodanie ich do tablicy
            links.push(url);
            return "";
        });

        text = text.replace(" ", "&nbsp");              // Podmiana białych znaków na odpowiednik html (non-breaking space)
        text = text.replace(/\r?\n/g, "<br> ");          // Podmiana nowej linii w stringu na odpowiednik html
        // Dodanie do bazy oraz do tablicy zdan //
        let task = new Task((currentId.toString()), text, links);
        taskStore.setItem(task.idTask, task).then(function(value) {
            // This will output `1`.
            listOfAllTasks.push(task);
            appendTask(task);
            currentId += 1;
        }).catch(function(err) {
            console.log(err);
        });

        numTodo++;
        updateTaskNumbers();
    }
    taskTextarea[0].focus();
    taskTextarea[0].value = "";     // Wyczyszczenie pola tekstowego

    taskTextarea[0].style.height = '2em';
    
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

    let date = document.createElement("div");

    let doingIcon = document.createElement("i");
    let removeIcon = document.createElement("i");
    let editIcon = document.createElement("i");
    let doneIcon = document.createElement("i");

    //// Ustawainie atrybutow ////
    doingIcon.setAttribute("class", "setting-icon icon-flag");
    doneIcon.setAttribute("class", "setting-icon icon-ok-circled");
    editIcon.setAttribute("class", "setting-icon icon-pencil-squared");
    removeIcon.setAttribute("class", "setting-icon icon-trash");    

    doingIcon.setAttribute("title", "In progress");
    doneIcon.setAttribute("title", "Have done");
    editIcon.setAttribute("title", "Edit task");
    removeIcon.setAttribute("title", "Remove task");

    taskLi.setAttribute("class", "task-container");
    taskLi.setAttribute("data-task", task.idTask);
    taskDiv.setAttribute("class", "task");
    iconsDiv.setAttribute("class", "icons-container");
    linksUl.setAttribute("class", "links");

    text.setAttribute("class", "task-text");
    links.setAttribute("class", "links");
    date.setAttribute("class", "date");
    //// Obrobka tekstu ////
    text.innerHTML = task.text;

    //// Obrobka linkow ////
    if(task.links.length > 0) {
        links.innerHTML = `<h4 class="links-title"> Links: </h4>`;
        for(let i = 0; i < task.links.length; i++) {
            const linksLi = document.createElement("li");
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
    
    // Edytowanie usuwanie
    editBtn[appendTaskId].addEventListener("click", editTask, true);
    removeBtn[appendTaskId].addEventListener("click", removeTask, true);
    
    // Zmiana stanu zadania
    inProgressBtn[appendTaskId].addEventListener("click", (e) => {
        changeState(e, "in progress");
    }, true);
    haveDoneBtn[appendTaskId].addEventListener("click", (e) => {
        changeState(e, "have done");
    }, true);
    appendTaskId += 1;
 
}

let editTask = (e) => {
    const task = e.target.parentElement.parentElement;  // taskLi
    //const parentTask = task.parentElement;              // taskUl
    //const taskId = task.dataset.task;                   // id
    const taskDiv = task.firstChild;
    
    let editText;
    let editLinks;
    
    let taskDivFirst = taskDiv.firstChild;
    let elementNum = 0;
    while (taskDivFirst) {
        
        if(elementNum === 0) {
            editText = taskDivFirst;
        } else if(elementNum === 1) {
            editLinks = taskDivFirst.children[1];
        }
        taskDiv.removeChild(taskDivFirst);
        taskDivFirst = taskDiv.firstChild;
        
        elementNum++;
    }

    const editTextarea = document.createElement("textarea");
    editTextarea.setAttribute("class", "edit-task-textarea");
    //editText = editText.replace("&nbsp", " ");              // Podmiana białych znaków na odpowiednik html (non-breaking space)
    //editTextarea = editText.replace("<br>", "");          // Podmiana nowej linii w stringu na odpowiednik html
    console.log(editText.innerHTML);
    editText.innerHTML = editText.innerHTML.replace("\r\n", "<br>/");
    editText.innerHTML = editText.innerHTML.replace("&nbsp;", " ");
    
    console.log(editText.innerHTML);
    editTextarea.innerHTML = editText.innerHTML + "\r\n";
    

    if(editLinks !== undefined) {
        const linksInTask = editLinks.getElementsByTagName("a");
        const arrayOfLinks = [];
        for(let i = 0; i < linksInTask.length; i++) {
            arrayOfLinks.unshift(linksInTask[i].getAttribute("href"));
        }
        console.log(arrayOfLinks);
        
        for(let i = 0; i < arrayOfLinks.length; i++) {
            editTextarea.innerHTML += arrayOfLinks[i] + "\r\n";
        }
    }
    

    taskDiv.appendChild(editTextarea);
    
    
}


//// Usuwanie zadania z DOM oraz z bazy ////
let removeTask = (e) => {
    const task = e.target.parentElement.parentElement;  // taskLi
    const parentTask = task.parentElement;              // taskUl
    const taskId = task.dataset.task;                   // id

    parentTask.removeChild(task);
    appendTaskId -= 1;
    taskStore.getItem(taskId).then((task)=> {
        let state = task.state;
        if(state === "todo") {
            numTodo--;
        } else if(state === "in progress") {
            numInProgress--;
        } else if(state === "have done") {
            numHaveDone--;
        }

        updateTaskNumbers();
    }).catch((err) => {
        console.log(err);
    });

    taskStore.removeItem(taskId).then(() => {
        //console.log('Task deleted');
    }).catch(function(err) {
        console.log(err);
    });
    
    
}

//// Zmiana stanu wybranego zadania ////
////    state = todo -> todo
////    state = in progress -> doing
////    state = have done -> done
let changeState = (event, targetState) => {
    const task = event.target.parentElement.parentElement;  // taskLi
    const parentTask = task.parentElement;                  // taskUl
    const taskId = task.dataset.task;                       // id

    let taskCopy;                                           // Kopia obiektu z bazy potrzebna do przeniesienia (IndexedDB nie umozliwia zmian wartosci w krotkach)

    taskStore.getItem(taskId).then((t) => {
        taskCopy = Object.assign({}, t);
        if(taskCopy.state === "todo") {
            numTodo--;
            if(targetState === "in progress")
                numInProgress++;
            else if(targetState === "have done")
                numHaveDone++;
        } else if(taskCopy.state === "in progress") {
            numInProgress--;
            if(targetState === "todo")
                numTodo++;
            else if(targetState === "have done")
                numHaveDone++;
        } else if(taskCopy.state === "have done") {
            numHaveDone--;
            if(targetState === "todo")
                numTodo++;
            else if(targetState === "in progress")
                numInProgress++;
        }

        updateTaskNumbers();

        taskCopy.state = targetState;
    }).then((t) => {
        taskStore.removeItem(taskId).then(function() {
            parentTask.removeChild(task);
            appendTaskId -= 1;
        }).catch(function(err){
            console.log(err);
        });
    }).then((task) => {
        taskStore.setItem(taskCopy.idTask, taskCopy).then(function() {

        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });

    
    
}

//// Uruchamiane tylko przy zaladowaniu strony
let countTask = () => {
    
    taskStore.iterate((task, key, iterationNumber) => {
        let state = task.state;
        if(state === "todo") {
            numTodo++;
        } else if(state === "in progress") {
            numInProgress++;
        } else if(state === "have done") {
            numHaveDone++;
        }
    }).then(function() {
        updateTaskNumbers();
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
};

let updateTaskNumbers = () => {
    todoNumber.textContent = numTodo;
    inProgressNumber.textContent = numInProgress;
    haveDoneNumber.textContent = numHaveDone;
}


let autosize = () => {
    let el = document.querySelector('textarea');
    el.style.cssText = 'padding: 5px';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
    // setTimeout(function(){
      
    // },0);
}

////////////////////////////////////////////////////////


(() => {
    //window.location.reload(true);       // Resetuje cache powodujacy problemy przy zmianach w kodzie
    // Przaladowanie pliku
    if( window.localStorage )
    {
        if( !localStorage.getItem('firstLoad') )
        {
            localStorage['firstLoad'] = true;
            window.location.reload();
        }  
        else
            localStorage.removeItem('firstLoad');
    }
    
    countTask();
    displayPage(todoUrl);
    //
})();

// Po zaladowaniu wylaczenie maski
window.onload = function() {
    document.getElementById("loading-mask").style.display = "none";
}