var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = [];

function User(userName, id) {
    this.userName = userName;
    this.id = id;
}

var usersConnected = 0;
var currentDrawerNumber;
var currentDrawer;
var currentWord;

var words = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

io.on('connection', function (socket) {

    socket.emit('initialUserList', users);
    
    socket.on('draw', function(position, color) {
        socket.broadcast.emit('drawLine', position, color);
    });
    
    socket.on('guess', function(enteredGuess, userName) {
        io.emit('guessMade', enteredGuess, userName);
        
        var tempGuess = enteredGuess.toString().toLowerCase();
        console.log(currentWord);
        console.log(tempGuess);
        if(tempGuess == currentWord) {
            console.log(currentDrawerNumber);
            io.emit('correctGuess', userName);
            if(currentDrawerNumber != usersConnected || currentDrawerNumber > usersConnected) {
                currentDrawerNumber++;
            }
            else {
                currentDrawerNumber = 1;
            }
        }
        else {
            io.emit('incorrectGuess');
        }
        io.emit('needNewDrawer', currentDrawerNumber, currentDrawer);
    });
    
    socket.on('iAmDrawing', function(userName) {
        io.emit('theDrawer', userName);
        console.log(userName + " is drawing");
        var userId;
        for (var i=0; i<users.length; i++) {
            if(users[i].userName == userName) {
                userId = users[i].id;
            }
        }
        if(currentDrawer != userId) {
            var random = Math.floor(Math.random() * 100);
            currentWord = words[random].toString();
            socket.emit('theWord', currentWord);
            currentDrawer = userId;
        }
    });
    
    socket.on('startDrawing', function(event){
		socket.broadcast.emit('startDrawing', event);
	});
	
	socket.on('disconnect', function() {
	    for(var i = 0; i<users.length; i++) {
	        if(users[i].id == socket.id) {
	            io.emit('removeUser', users[i].userName, i+1);
	            users.splice(i, 1);
	            console.log(users);
	            break;
	        }
	    }
	    if(currentDrawer == socket.id) {
	        io.emit('needNewDrawer', i+1);
	        console.log(i+1);
	    }
	    usersConnected = users.length;
	    console.log(usersConnected);
	    
	});
	
	socket.on('chat', function(message, userName) {
	    io.emit('chatEvent', message, userName);
	});
    
    socket.on('username', function(userName) {
        console.log(userName);
        console.log(socket.id);
        
        var userId = socket.id;
        var newUser = new User(userName, userId);
        users.push(newUser);
        console.log(users);
        usersConnected++;
        io.emit('addUserList', userName);
        
        if(usersConnected == 1) {
            socket.emit('drawer');
            var random = Math.floor(Math.random() * 100);
            currentWord = words[random].toString();
            socket.emit('theWord', currentWord);
            currentDrawer = socket.id;
            currentDrawerNumber = 1;
        }
        else {
            socket.emit('guesser');
        }
        socket.emit('userNumber', usersConnected);
        io.emit('getDrawer');
        console.log(usersConnected);
        
    });
    
    socket.on('clearCanvas', function() {
        io.emit('clearCanvas');
    });

});

server.listen(process.env.PORT || 8080);