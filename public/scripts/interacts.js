let ws = new WebSocket("ws://localhost:3002"); // connects to the websocket on 3002

ws.addEventListener("open", (event) => {
	console.log("WebSocket connection established browser");
});

ws.addEventListener("error", (event) => {
	console.error("WebSocket error:", event);
});

ws.addEventListener("message", (event) => {
	let obj = Object.entries(JSON.parse(event.data)).map(([title, index]) => ({
		title,
		index
	}));
	console.log(obj);

	document.getElementById("speed").innerHTML = Math.floor(
		(+obj[3].index + +obj[4].index + +obj[5].index) / 3
	);

	document.getElementById("acceleration").innerHTML = Math.floor(
		(+obj[13].index + +obj[14].index + +obj[15].index) / 3
	);

	obj.forEach((title, index) => {
		let element = document.querySelectorAll(
			`[id=${CSS.escape(title.title)}]`
		);

		if (element[0]?.id == title.title) {
			element[0].innerHTML = title.index;
		}
	});
});

// {"pitch":"0","roll":"1","yaw":"0","vgx":"0","vgy":"0","vgz":"0","templ":"43","temph":"45","tof":"10","h":"0","bat":"22","baro":"526.05","time":"0","agx":"-1.00","agy":"-21.00","agz":"-1000.00"}

let keys = document.getElementsByTagName("kbd");
document.addEventListener("keydown", (event) => {
	// loops through the keys and identifies which key was pressed then sends it through the udp socket and stylizes the key
	for (let i = 0; i < keys.length; i++) {
		if (keys[i].innerHTML == event.key.toUpperCase()) {
			ws.send(event.key.toUpperCase());
			console.log(event.key.toUpperCase());
			keys[i].style =
				"background-color: #303236; border: solid 3px #44474c; border-bottom-color: #44474c; border-radius: 0.933vw; box-shadow: inset 0 -3px 0 #303236;";
		}
	}
});

document.addEventListener("keyup", (event) => {
	// when the key is let go it updates its style so it looks normal
	for (let i = 0; i < keys.length; i++) {
		if (event.key.toUpperCase() == keys[i].innerHTML) keys[i].style = "";
	}
});

function button(element) {
	// sends what button was pressed and updates the style
	console.log(element.id);
	ws.send(element.id);
	element.style.backgroundColor = "#303236";
	setTimeout(() => {
		element.style.backgroundColor = "";
	}, 100);
}

let options = document.getElementsByClassName("options");
let currentType = options[1];

//allows toggle between video and photo
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

