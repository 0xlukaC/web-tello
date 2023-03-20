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

const http = require("http");
const WebSocket = require("ws");
const STREAM_PORT = 3001;
const spawn = require("child_process").spawn;

// video.on("listening", () => {
// 	let clientAddress = video.address();
// 	console.log(`VIDEO is A OK ${clientAddress.address}:${clientAddress.port}`);
// });

// video.on("error", (err) => {
// 	console.log("there is a error", err);
// });
// // video.bind(videoServer, videoPort);
// video.bind({
// 	port: videoPort,
// 	address: videoServer
// });

// 2. Create the stream server where the video stream will be sent

const streamServer = http
	.createServer(function (request, response) {
		// Log that a stream connection has come through
		console.log(
			`stream connection on ${STREAM_PORT} from: ${request.socket.remoteAddress}:${request.socket.remotePort}`
		);
		// Data from stream (FFmpeg) goes to web socket
		request.on("data", (data) => {
			webSocketServer.broadcast(data);
		});
	})
	.listen(STREAM_PORT); // Listen for streams on port 3001

// 3. Begin web socket server

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
		"1056x480",
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
	//streamer.stderr.pipe(process.stderr);
	streamer.on("exit", (code) => {
		console.log("error/exit", code);
	});
}, 3000);

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

process.on("uncaughtException", (err) => {
	console.log(err);
	client.close();
});
