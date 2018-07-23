
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
        
    }
    showTodoTasks();
    


    function parseScript(_source) {
        var source = _source;
        var scripts = new Array();
    
        // Strip out tags
        while(source.indexOf("<script") > -1 || source.indexOf("</script") > -1) {
            var s = source.indexOf("<script");
            var s_e = source.indexOf(">", s);
            var e = source.indexOf("</script", s);
            var e_e = source.indexOf(">", e);
    
            // Add to scripts array
            scripts.push(source.substring(s_e+1, e));
            // Strip from source
            source = source.substring(0, s) + source.substring(e_e+1);
        }
    
        // Loop through every script collected and eval it
        for(var i=0; i<scripts.length; i++) {
            try {
                eval(scripts[i]);
            }
            catch(ex) {
                // do what you want here when a script fails
            }
        }
    
        // Return the cleaned source
        return source;
    }
