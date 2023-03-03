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
let currentType = options[1];

function switcher(element) {
	element.style.backgroundColor = "rgba(43, 43, 43, 0.73)";

	options[element.dataset.other].style.backgroundColor = "";
	console.log(element, options);
	currentType = element;
	resetOpacity();
}

// by default
options[1].style.backgroundColor = "rgba(43, 43, 43, 0.73)";

//option[1] is photo
//option[0] is video

function capture(element) {
	let inner = element.querySelectorAll("circle")[1];
	if (currentType == options[1]) {
		inner.style.opacity = "0.7";
		setTimeout(() => {
			inner.style.opacity = "1";
		}, 100);
		return;
	}
	if (currentType == options[0] && inner.style.opacity == 0.7)
		return (inner.style.opacity = "1");
	//else
	return (inner.style.opacity = "0.7");
}

function resetOpacity() {
	let element = document.getElementById("record");
	let inner = element.querySelectorAll("circle")[1];
	inner.style.opacity = "1";
}
