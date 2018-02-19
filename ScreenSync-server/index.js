const app     = require('express')();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const ss        = require('socket.io-stream');
const fs      = require('fs');
const path    = require('path');

var controller = null;
var manifest = {};

var receivedManifest = false; // Indicates if we received the manifests from the controller

var receivedFileTimeout = null;

var fileQueue = {};

var sockets = [];

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    ss(socket).on('server.receive', (stream, data) => {
        if (!fs.existsSync('./files')) {
            fs.mkdirSync('./files');
        }

        var filename = path.basename(data.name);
        stream.pipe(fs.createWriteStream('./files/' + filename));
        
        stream.on('end', () => {
            console.log("Finished: ", filename)
            socket.emit("send.server.received", { file: filename });
        })

        var size = 0;
        progress = 0;
        stream.on('data', (chunk) => {
            size += chunk.length;
            let newProgress = Math.floor(size / data.size * 100) + '%';
            if(newProgress != progress) {
                progress = newProgress;
                socket.emit("updateuploadstatus", { name: filename, progress: progress });
            }
        })
    })

    socket.on('selectrole', (data) => {
        if(data.type == 'controller') {
            console.log("Controller Connected");
            socket.broadcast.send("controllerconnected");
            controller = socket;
        } else if(data.type == 'interface') {
            console.log("Interface Connected");
            if (manifest[data.name].sockets.indexOf(socket) == -1) {
                manifest[data.name].sockets.push(socket); // Make sure no dupes are in this array (or it would send all commands twice)
            }
            SendInterfaceConnectionsUpdate();
        }
    });

    socket.on('getmanifest', (data) => {
        console.log("Return Manifest")
        let returndata = {
            receivedManifest: receivedManifest,
            manifest: manifest
        }

        socket.emit("returnmanifest", returndata);
    });

    ss(socket).on('requestfile', function (stream, data) {
        let file = fs.statSync('./files/' + data.name);
        socket.emit('downloadstats', {name: data.name, size: file.size});

        console.log("Requested File Stream", data.name)
        fs.createReadStream('./files/'+data.name).pipe(stream);
    });

    socket.on('file.received', (data) => {
        fileQueue[socket.id].shift();
        NextInFileQueue(socket);
    });

    socket.on('updatemanifest', (data) => {
        console.log("Update Manifest");
        receivedManifest = true;

        let tempManifest = data;
        let allSockets = [];
        for (let key in manifest) {
            // Kick all interfaces because the manifest has changed, They need to re-validate all their files when connecting again.
            // TODO: Check if interface can stay connected instead of kicking and simply download & revalidate (atm kicking is the easiest option)
            if (manifest.hasOwnProperty(key)) {
                for (let i = 0; i < manifest[key].sockets.length; i++) {
                    manifest[key].sockets[i].emit("kick");
                    console.log("Kick Socket number #" + i + " from: " + key);
                }
            }
        }

        manifest = tempManifest;

        let returndata = {
            receivedManifest: receivedManifest,
            manifest: manifest
        }

        socket.broadcast.emit("returnmanifest", returndata);
        SendInterfaceConnectionsUpdate();
        ReceivedAllFiles();
    });

    socket.on('disconnect', () => {
        if(controller == socket) {
            console.log("Controller Disconnected");
            controller = null;
        }

        for (let key in manifest) {
            if (manifest.hasOwnProperty(key)) {
                for (let i = 0; i < manifest[key].sockets.length; i++) {
                    if (manifest[key].sockets[i] == socket) {
                        console.log("Interface Disconnected");
                        manifest[key].sockets.splice(manifest[key].sockets.indexOf(manifest[key].sockets[i]), 1);
                        SendInterfaceConnectionsUpdate();
                    }
                }
            }
        }

        console.log("Connection Disposed");
    })

    sockets.push(socket);
    console.log('Connection Established...');
});

function GetOwnSocket(socket) {
    for (let i = 0; i < sockets.length; i++) {
        if(sockets[i].id == socket.id) {
            return sockets[i]
        }       
    }

    return null;
}

function NextInFileQueue(socket) {
    if (fileQueue[socket.id] !== null && fileQueue[socket.id].length > 0) {
        for (let i = 0; i < fileQueue[socket.id].length; i++) {
            
            const request = fileQueue[socket.id][i];
            console.log("Next In File Queue", request);

            ss.forceBase64 = true;
            let stream = ss.createStream();
            stream.forceBase64 = true;
            let filename = './files/' + request;
            let file = fs.statSync(filename);

            ss(socket).emit('client.receive', stream, { name: filename, size: file.size });
            fs.createReadStream(filename).pipe(stream);

            delete fileQueue[socket.id][i];
        }
    }
}

function SendInterfaceConnectionsUpdate() {
    if(controller == null) return;
    let data = {};
    for (let key in manifest) {
        if (manifest.hasOwnProperty(key)) {
            data[key] = manifest[key].sockets.length;
        }
    }

    controller.emit('updateinterfaceconnections', data);
}

function ReceivedAllFiles(requestMissing = true) {
    let allFiles = []; // All files we have in possesion on this server.
    let allRequiredFiles = [];
    let filesToDownload = [];
    for (let key in manifest) {
        if (manifest.hasOwnProperty(key)) {
            for (let i = 0; i < manifest[key].files.length; i++) {
                allRequiredFiles.push(manifest[key].files[i]);
            }
        }
    }

    fs.readdirSync('./files').forEach(file => {
        allFiles.push(file);
    })

    for (let i = 0; i < allRequiredFiles.length; i++) {
        if (allFiles.indexOf(allRequiredFiles[i]) == -1) {
            filesToDownload.push(allRequiredFiles[i]);
        }   
    }

    if(filesToDownload.length > 0 && requestMissing) {
        RequestFilesFromController(filesToDownload);
    }

    console.log("Received all files", (allFiles.length == allRequiredFiles.length));
    return (allFiles.length == allRequiredFiles.length);
}

function RequestAllFilesFromController() {
    if (controller == null) return;

    controller.emit('requestallfiles');
}

function RequestFilesFromController(files = []) {
    if (controller == null) return;

    controller.emit('requestfiles', files);
}

http.listen(3000, function () {
    console.log('listening on *:3000');
});