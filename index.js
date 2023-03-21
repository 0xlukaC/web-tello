const express = require("express");
const app = express();
const webport = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index");
	// res.send("hi");
});

app.listen(webport);

// start of tello connection

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

// Receive Tello Video Stream and State

const http = require("http");
const WebSocket = require("ws");
const STREAMPORT = 3001; // this is the port that ffmpeg streams on
const spawn = require("child_process").spawn; //creates a instance of ffmpeg
const STATEPORT = 8890;
const throttle = require("lodash/throttle");

// Recieve state
const droneState = dgram.createSocket("udp4");
droneState.on("listening", () => console.log("Listening for state"));
droneState.on("error", (err) =>
	console.log("there is a error with the state", err)
);

function parseState(msg) {
	return msg
		.split(";")
		.map((x) => x.split(":"))
		.reduce((data, [key, value]) => {
			data[key] = value;
			return data;
		}, {}); // no idea what is going on here
}

// Web socket to connect to front end

const wss = new WebSocket.Server({ port: 3002 });
let active = false;

wss.on("connection", (ws) => {
	active = true;
	console.log("WebSocket connection established");

	ws.on("message", (data, isBinary) => {
		let msg = data.toString();
		console.log(msg);
		if ((msg = "W")) messanger("up 20");
		else if ((msg = "A")) messanger("ccw 15");
		else if ((msg = "S")) messanger("down 20");
		else if ((msg = "D")) messanger("cc 15");
		else if ((msg = "I")) messanger("forward 20");
		else if ((msg = "J")) messanger("left 20");
		else if ((msg = "K")) messanger("back 20");
		else if ((msg = "L")) messanger("right 20");
		else if ((msg = "land")) messanger("land");
		else if ((msg = "fly")) messanger("takeoff");
		else if ((msg = "emergancy-btn")) messanger("emergancy");
	});

	droneState.on(
		"message",
		throttle((msg) => {
			if (active) {
				const formattedState = JSON.stringify(
					parseState(msg.toString())
				);
				ws.send(formattedState);
			}
		}, 500)
	);

	ws.send("test");
});

droneState.bind(STATEPORT, "0.0.0.0");
//

//

//

// Create the stream server where the video stream will be sent

const streamServer = http
	.createServer(function (req, res) {
		// Log that a stream connection has come through
		console.log(
			`stream connection on ${STREAMPORT} from: ${req.socket.remoteAddress}:${req.socket.remotePort}`
		);
		// Data from stream (FFmpeg) goes to web socket
		req.on("data", (data) => {
			webSocketServer.broadcast(data);
		});
	})
	.listen(STREAMPORT); // Listen for streams on port 3001

// Begin web socket server

const webSocketServer = new WebSocket.Server({
	server: streamServer
});

// Broadcast the stream via websocket to connected clients
webSocketServer.broadcast = (data) => {
	webSocketServer.clients.forEach(function each(client) {
		if (client.readyState == WebSocket.OPEN) {
			client.send(data);
		}
	});
};

setTimeout(function () {
	let args = [
		"-i",
		"udp://0.0.0.0:11111",
		"-r",
		"30",
		"-s",
		"960x720",
		"-codec:v",
		"mpeg1video",
		"-b",
		"800k",
		"-f",
		"mpegts",
		"http://127.0.0.1:3001/stream"
	];

	// Spawn an ffmpeg instance
	let streamer = spawn("ffmpeg", args);
	// Uncomment for ffmpeg stream info
	// streamer.stderr.pipe(process.stderr);
	streamer.on("exit", (code) => {
		console.log("exit code", code);
	});
}, 3000);

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

process.on("uncaughtException", (err) => {
	console.log(err);
	client.close();
});
