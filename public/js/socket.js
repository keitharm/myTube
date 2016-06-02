var socket = io.connect('http://keitharm.me:8080');
socket.on('youtube', function (data) {
    console.log(data);
});
