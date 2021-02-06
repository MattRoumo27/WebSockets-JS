var express = require('express');
var socket = require('socket.io');

var userList = {};

// App setup
var app = express();
var server = app.listen(4000, function() {
    console.log('Listening to requests on port 4000');
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

// Make initial connection with socket
io.on('connection', function(socket) {
    console.log('Made socket connection', socket.id);

    // Add the client's nickname to the dictionary of users
    socket.on('registerName', function(clientNickname) {
        userList[socket.id] = clientNickname;
        console.log(userList);

        // Send updated list of clients to all the users connected
        console.log('Sending username list to clients');
        io.sockets.emit('participantList', userList);
    });

    // When the server receives a chat, it will send it to all the clients
    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    });

    // Send information about the user typing, broadcast so the user typing does
    // not get the message
    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });

    // Listen for an individual message that is sent by one user to another
    socket.on('privateChat', function(data) {
        var msg = data.message;
        var userSending = data.handle;
        var userReceiving = data.user;
        console.log(msg, userSending, userReceiving);
        for (var key in userList) {
            if (userList[key] == userReceiving) {
                // Send private chat to receiving user
                io.to(key).emit('privateChat', { 
                    message: msg,
                    sending: userSending,
                    receiving: userReceiving
                });

                // Send chat back to the sending user as well
                socket.emit('privateChat', {
                    message: msg,
                    sending: userSending,
                    receiving: userReceiving
                });
            }
        }
    });
});