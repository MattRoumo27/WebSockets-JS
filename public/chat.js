// Make connection
var socket = io.connect('http://192.168.1.39:4000');

// Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

// Emit Events

// Send a chat when the send button is clicked
btn.addEventListener('click', function() {
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    });
    message.value = '';
});

// Send the updated nickname for this client to the server
handle.addEventListener('keyup', function() {
    socket.emit('registerName', handle.value);
});

// The server will be alerted when a user is typing so it can tell the other clients
message.addEventListener('keypress', function() {
    socket.emit('typing', handle.value);
});

// Listen for events

socket.on('chat', function(data) {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': <strong>' + data.message + '</p>';
});

// Receive a typing alert from the user and display it on the chat window
socket.on('typing', function(data) {
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});