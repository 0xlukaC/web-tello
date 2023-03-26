import express from "express";
const app = express(); // makes so I dont have to write as much code
const webport = 3000; // the web port for the website

app.use(express.static("public")); // uses the public folder for static files
app.set("view engine", "ejs"); // sets the file that is rendered

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(webport);

// start of tello connection

import dgram from "dgram";
const host = "192.168.10.1"; // ip of drone

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
client.bind(port); // connects the socket to the port

// Receive Tello Video Stream and State

import http from "http";
import WebSocket, { WebSocketServer } from "ws";
const STREAMPORT = 3001; // this is the port that ffmpeg streams on
import { spawn } from "child_process"; //creates a instance of ffmpeg
const STATEPORT = 8890;
import throttle from "lodash/throttle.js";

// Recieve state
const droneState = dgram.createSocket("udp4");
droneState.on("listening", () => console.log("Listening for state"));
droneState.on("error", (err) =>
	console.log("there is a error with the state", err)
);

//makes the message readable
function parseState(msg) {
	return msg
		.split(";")
		.map((x) => x.split(":"))
		.reduce((data, [key, value]) => {
			data[key] = value;
			return data; // converts an array of key-value pairs into a object by iterating over each element and assigning each kv pair
		}, {});
}

// Web socket to connect to front end

const wss = new WebSocketServer({ port: 3002 });
let active = false;

wss.on("connection", (ws) => {
	active = true;
	console.log("WebSocket connection established");

	ws.on("message", (data, isBinary) => {
		let msg = data.toString();
		console.log(msg, "on 3002");
		if (msg == "W") messanger("up 50");
		else if (msg == "A") messanger("ccw 30");
		else if (msg == "S") messanger("down 50");
		else if (msg == "D") messanger("cw 30");
		else if (msg == "I") messanger("forward 50");
		else if (msg == "J") messanger("left 50");
		else if (msg == "K") messanger("back 50");
		else if (msg == "L") messanger("right 50");
		else if (msg == "land") messanger("land");
		else if (msg == "fly") messanger("takeoff");
		else if (msg == "emergancy-btn") messanger("emergency");
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

const webSocketServer = new WebSocketServer({
	server: streamServer
});

let opened = false; // updates when the socket is sending
// Broadcast the stream via websocket to connected clients
webSocketServer.broadcast = (data) => {
	webSocketServer.clients.forEach(function each(client) {
		if (client.readyState == WebSocket.OPEN) {
			opened = true;
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
		"800k", //bitrate
		"-f",
		"mpegts",
		"http://127.0.0.1:3001/stream"
	];

	// Spawn an ffmpeg instance
	let streamer = spawn("ffmpeg", args);
	// runFacemesh();
	streamer.on("exit", (code) => {
		console.log("exit code", code);
	});
}, 3000);

const relayWS = new WebSocketServer({ port: 3003 });

relayWS.on("connection", function connection(ws) {
	ws.on("error", console.error);
	console.log("video relay established");

	ws.on("message", function message(data) {
		console.log(data);
		runFacemesh(data);
	});

	ws.send("something");
});

// // ai`
import * as faceDetection from "@tensorflow-models/face-detection";
// import "@mediapipe/face_mesh";
// import "@tensorflow/tfjs-core";

const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
const detectorConfig = {
	runtime: "mediapipe",
	solutionPath: "/node_modules/@mediapipe/face_mesh"
};

const runFacemesh = async (vid) => {
	console.log("in");
	detector = await faceDetection.createDetector(model, detectorConfig);
	const faces = await detector.estimateFaces({ input: vid });
	console.log(faces);
};
// const runFacemesh = async () => {
// 	// loads the ai model
// 	const net = await facemesh.load(
// 		facemesh.SupportedPackages.mediapipeFacemesh
// 	);
// 	setInterval(() => {
// 		detect(net);
// 	}, 100);
// };

// // detects the faceimport
// const detect = async (net) => {
// 	//check if readystate is open so we can execute
// 	if (opened) {
// 		// Make Detections
// 		const face = await net.estimateFaces({
// 			input: "http://127.0.0.1:3001/stream"
// 		});
// 		console.log(face);
// 	}
// };

//creates the command line interface

import readlinePackage from "readline";
import { Buffer } from "node:buffer";
const rl = readlinePackage.createInterface({
	input: process.stdin,
	output: process.stdout
});
// rl allows you to send commands via commandline

//relays input
rl.on("line", (line) => {
	if (line === "close") closeApp();

	messanger(line);
});

//sends the message
function messanger(msg) {
	const buffer = Buffer.from(msg);
	client.send(buffer, 0, buffer.length, port, host, (err, bytes) => {
		if (err) {
			console.log(`${err} err from msg ${bytes}`);
		}
	});
}

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
