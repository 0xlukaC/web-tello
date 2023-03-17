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

const dgram = require("dgram");
const host = "192.168.10.1";
const port = "8889";

//creates the client UDP
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
	console.log(`listening on ${clientAddress.address}:${clientAddress.port}`);
});
client.bind(port);

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
	const buffer = Buffer.from(msg);
	client.send(buffer, 0, buffer.length, port, host, (err, bytes) => {
		if (err) {
			console.log(`${err} err from msg ${bytes}`);
		}
	});
}
messanger("command");

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
