
$(() => {
    var socket = io();
    let channel = 'REALTIME_LOGS';
    socket.on(channel, (msg) => {
        logSocketReceive(msg);
    });


    function logSocketReceive(data) {
        if (!$("#fpause").is(':checked')) {
            var show = true;
            //filter by keyword
            var keyword = $('#fkeyword').val();
            if (keyword != '') {
                if (data.detail.indexOf(keyword) == -1) {
                    show = false;
                }
            }
            if (show) {
                var html = logParsing(data);
                $('#logs ul').prepend(html);
            }
        }
    }

    function logParsing(data) {
        return '<li><span class="white">' + data.time + '</span> \
                <span class="orange logtype-' + data.type.toLowerCase() + '">' + data.type + '</span> \
                <span>[' + data.ipAddress + '] ' + data.message + '</span></li>';
    }

});