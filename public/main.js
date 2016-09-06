var socket = io();
var userNumber = 0;
var userName = '';
var userCount = $('#users');
var drawer = false;
var seenDrawer = false;

var DrawPosition = function(offsetX, offsetY, color) {
	this.offsetX = offsetX,
	this.offsetY = offsetY,
	this.color = color;
};


var pictionary = function() {
    
    var canvas, context;
    var drawing = false;
    var lastEvent;
    var color = "black";
    
    var guessbox;
    var chatText;
    
    
    var draw = function(position) {
        context.beginPath();
        context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
        context.lineTo(position.offsetX, position.offsetY);
        context.strokeStyle = position.color;
        context.stroke();
        lastEvent.offsetX = position.offsetX;
        lastEvent.offsetY = position.offsetY;
        lastEvent.color = position.color;
    };
    
    var onKeyDown = function(event) {
        if (event.keyCode != 13) {
            return;
        }
        
        var enteredGuess = guessBox.val();
        socket.emit('guess', enteredGuess, userName);
        guessBox.val('');
    };
    
    var onChatKeyDown = function(event) {
        if (event.keyCode != 13) {
            return;
        }
        
        var enteredChat = chatText.val();
        socket.emit('chat', enteredChat, userName);
        chatText.val('');
        setTimeout(function() {
            $('#words').selectRange(0, 0);
        }, 1);
    };
    
    $.fn.selectRange = function(start, end) {
        if(end === undefined) {
            end = start;
        }
        return this.each(function() {
            if('selectionStart' in this) {
                this.selectionStart = start;
                this.selectionEnd = end;
            } else if(this.setSelectionRange) {
                this.setSelectionRange(start, end);
            } else if(this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
    
    guessBox = $('#theGuess');
    guessBox.on('keydown', onKeyDown);
    
    chatText = $('#words');
    chatText.on('keydown', onChatKeyDown);
    
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    
    canvas.on('mousedown', function(event) {
        if(drawer) {
            lastEvent = new DrawPosition(event.offsetX, event.offsetY, color);
            socket.emit("startDrawing", lastEvent);
            drawing = true;
        }
    }).on('mousemove', function(event) {
        if(drawing) {
            var position = new DrawPosition(event.offsetX, event.offsetY, color);
            socket.emit('draw', position, color);
            draw(position);
        }
    }).on('mouseup', function(event) {
        drawing = false;
    });

    
    socket.on('drawLine', function(position, userColor) {
        color = userColor;
        console.log(position);
        draw(position);
    });

    
    socket.on('guessMade', function(enteredGuess, user) {
        $('#chat-log').append('<li> <span class="bold"> ' + user + '</span> guesses <span class="answer-style">' + enteredGuess + '</span> </li>');
    });
    
    $('#accept').on('click', function() {
        userName = $('#nickname').val();
        $('#nickname').val('');
        socket.emit('username', userName);
        $('#user-name').hide();
        $('#the-user').html('Logged in as <span id="user-name-style">' + userName + '</span>');
        $('#the-user').show();
    });
    
    $('#black').on('click', function() {
        color="black";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });
    
    $('#blue').on('click', function() {
        color="blue";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });
    
    $('#green').on('click', function() {
        color="green";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    
    $('#red').on('click', function() {
        color="red";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    
    $('#orange').on('click', function() {
        color="orange";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    
    $('#yellow').on('click', function() {
        color="yellow";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    
    $('#purple').on('click', function() {
        color="purple";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    })
    
    $('#pink').on('click', function() {
        color="pink";
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });
    
    $('#clear-canvas').on('click', function() {
        socket.emit('clearCanvas');
    });
    
    socket.on('addUserList', addUserList);
    socket.on('initialUserList', initialUserList);
    socket.on('drawer', makeDrawer);
    socket.on('guesser', makeGuesser);
    socket.on('userNumber', getUserNumber);
    socket.on('getDrawer', tellIfDrawer);
    socket.on('theDrawer', denoteDrawer);
    socket.on('startDrawing', startDrawing);
    socket.on('removeUser', removeUser);
    socket.on('chatEvent', addMessage);
    socket.on('needNewDrawer', getDrawer);
    socket.on('theWord', updateWord);
    socket.on('correctGuess', correctGuess);
    socket.on('incorrectGuess', incorrectGuess);
    socket.on('clearCanvas', clearCanvas);
    
    function startDrawing(event){
        lastEvent = new DrawPosition(event.offsetX, event.offsetY, color);
    }
    

};

var addUserList = function(userName) {
    $('#usersList').append('<li class="' + userName + '">' + userName + '</li>');
};

var initialUserList = function(userList) {
    // usersList.append(userList);
    userList.forEach(function(user) {
        addUserList(user);
    });
};

var makeDrawer = function() {
    drawer = true;
    $('#guesses').hide();
    $('#color-choices').css('display', 'flex');
    $('#word-box').css('display', 'flex');
};

var makeGuesser = function () {
    drawer = false;
    $('#color-choices').hide();
    $('#guesses').show();
    $('#word-box').hide();
};

var getUserNumber = function(usersConnected) {
    userNumber = usersConnected;
    console.log(userNumber);
};

var tellIfDrawer = function() {
    if (drawer == true) {
        socket.emit('iAmDrawing', userName);
        console.log(drawer);
    }
};

var denoteDrawer = function(user) {
    var userClass = $('.' + user);
    userClass.addClass('star');
    if(!seenDrawer) {
        $('#chat-log').append('<li><span class="bold"> ' + user + '</span> is now drawing </li>');
    }
    seenDrawer = true;
};

var removeUser = function(user, number) {
    var tempUser = '.' + user;
    console.log(tempUser);
    $(tempUser).remove();
    if(userNumber > number) {
        userNumber--;
        console.log(userNumber);
    }
};

var addMessage = function(message, user) {
    $('#chat-log').append('<li> <span class="bold"> ' + user + '</span>: ' + message + '</li>');
};

var getDrawer = function(number, name) {
    if(number == userNumber) {
        socket.emit('iAmDrawing', userName);
        drawer = true;
        $('#guesses').hide();
        $('#color-choices').css('display', 'flex');
        $('#word-box').css('display', 'flex');
        var userClass = $('.' + userName);
        userClass.addClass('star');    
        var userClass2 = $('.' + name);
        userClass2.removeClass('star');
    }
    else {
        drawer = false;
        $('#color-choices').hide();
        $('#guesses').show();
        $('#word-box').hide();
        $('#usersList').children().removeClass('star');   
    }
};

var updateWord = function(theWord) {
    $('#word-to-draw').html(theWord);
}

var correctGuess = function(name) {
    $('#chat-log').append('<li><span class="bold"> ' + name + '</span> has correctly guessed the word! </li>');
    seenDrawer = false;
    clearCanvas();
};

var incorrectGuess = function() {
    $('#chat-log').append('<li> Incorrect guess! </li>');
};

var clearCanvas = function() {
    var newCanvas = $('canvas');
    var newContext = newCanvas[0].getContext('2d');
    newContext.clearRect(0, 0, newCanvas[0].width, newCanvas[0].height);
};

$(document).ready(function() {
    pictionary();
    $('#user-name').show();
    
    $(window).unload(function() {
        socket.emit('userLeave', userName, userNumber, drawer);
    });
    
});

