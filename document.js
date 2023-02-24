document.addEventListener("keydown", (event) => {
let keys = document.getElementsByTagName("kbd")
for (let i = 0; i < keys.length; i++) {
    if (keys[i] == event.key.toUpperCase()) keys[i].style = "background-color: #303236;
    border: solid 3px #44474c;
    border-bottom-color: #44474c;
    border-radius: 0.933vw;
    box-shadow: inset 0 -3px 0 #303236;"
}

})

// kbd inner text 
// toUpper case