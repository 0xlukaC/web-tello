let keys = document.getElementsByTagName("kbd");
document.addEventListener("keydown", (event) => {
	for (let i = 0; i < keys.length; i++) {
		if (keys[i].innerHTML == event.key.toUpperCase()) {
			keys[i].style =
				"background-color: #303236; border: solid 3px #44474c; border-bottom-color: #44474c; border-radius: 0.933vw; box-shadow: inset 0 -3px 0 #303236;";
		}
	}
});

document.addEventListener("keyup", (event) => {
	for (let i = 0; i < keys.length; i++) {
		if (event.key.toUpperCase() == keys[i].innerHTML) keys[i].style = "";
	}
});

function button(element) {
	element.style.backgroundColor = "#303236";
	setTimeout(() => {
		element.style.backgroundColor = "";
	}, 100);
}

let options = document.getElementsByClassName("options");
function switcher(element) {
	element.style.backgroundColor = "rgba(43, 43, 43, 0.73)";

	options[element.dataset.other].style.backgroundColor = "";
}

// by default
options[1].style.backgroundColor = "rgba(43, 43, 43, 0.73)";
