var socket = io.connect(':8080');
socket.on('youtube', function (data) {
    console.log(data);
});
