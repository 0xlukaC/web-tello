const express = require("express");
const app = express();
const webport = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	console.log("here");
	res.render("index");
	// res.send("hi");
});

app.listen(webport);

//start of tello connection

const dgram = require("dgram");
const host = "192.168.10.1";

// Send Command & Receive Response
const port = "8889";
const client = dgram.createSocket("udp4");

client.on("message", (msg, rinfo) => {
	console.log(`${rinfo.port} ${rinfo.address} - ${msg}`);
});

client.on("error", (err) => {
	console.log(`${err} error, closing socket`);
	// client.close(); //closes the socket
});

client.on("listening", () => {
	let clientAddress = client.address();
	console.log(
		`listening for command on ${clientAddress.address}:${clientAddress.port}`
	);
});
client.bind(port);

// Receive Tello Video Stream

const video = dgram.createSocket("udp4");
const videoPort = 1111; //may have to change to number
const videoServer = "0.0.0.0";

video.on("listening", () => {
	let clientAddress = video.address();
	console.log(`VIDEO is A OK ${clientAddress.address}:${clientAddress.port}`);
});

video.on("message", (msg, rinfo) => {
	// console.log(`Video message: ${msg}`);
	console.log("hello");
	console.log(msg);
});

video.on("error", (err) => {
	console.log("there is a error", err);
});

// video.bind(videoServer, videoPort);
video.bind({
	port: videoPort,
	address: videoServer
});
// Recieve state

// function parseState(state) {
// 	return state
// 		.split(";")
// 		.map((x) => x.split(":"))
// 		.reduce((data, [key, value]) => {
// 			data[key] = value;
// 			return data;
// 		}, {});
// }

// const droneState = dgram.createSocket("udp4");
// droneState.bind(8890);

//creates the command line interface

const readlinePackage = require("readline");
const { Buffer } = require("node:buffer");
const rl = readlinePackage.createInterface({
	input: process.stdin,
	output: process.stdout
});

//relays input
rl.on("line", (line) => {
	if (line === "close") closeApp();

	messanger(line);
});

//sends the message
function messanger(msg) {
	console.log("ok", msg);
	const buffer = Buffer.from(msg);
	client.send(buffer, 0, buffer.length, port, host, (err, bytes) => {
		if (err) {
			console.log(`${err} err from msg ${bytes}`);
		}
	});
}
// messanger("command");
// messanger("streamon");

//closes the CLI and stops the program
function closeApp() {
	client.close();
	//add land feature
	rl.close();
	process.exit(0);
}

process.on("uncaughtException", () => {
	client.close();
});
