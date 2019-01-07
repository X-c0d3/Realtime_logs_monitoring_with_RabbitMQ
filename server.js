require('dotenv').config();

var amqp = require('amqp'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path'),
    moment = require('moment');

rabbitMq = amqp.createConnection({
    host: process.env.RMQ_HOST,
    port: process.env.RMQ_PORT,
    login: process.env.RMQ_USER,
    password: process.env.RMQ_PASS,
    connectionTimeout: Number(process.env.RMQ_TIMEOUT),
    authMechanism: 'AMQPLAIN',
    vhost: process.env.RMQ_VHOST,
    noDelay: true,
    ssl: {
        enabled: false
    }
}, {
    defaultExchangeName: "Topic_Exchange"
});
app.use('/assets', require('express').static(path.join(__dirname, "assets")));
//app.use('/', express.static('public'), serveIndex('public', {'icons': true}))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.set('port', process.env.PORT);

var q = 'ACIDLOGS';
var routingKey = 'acid.Logs';
var channel = 'REALTIME_LOGS';

rabbitMq.on('error', (e) => {
    console.log('EROR: ' + e)
});

rabbitMq.on('close', () => {
    console.log('Connection Closed');
});

rabbitMq.on('ready', () => {
    console.log('Connected to RabbitMQ');
    rabbitMq.queue(q, {
        autoDelete: false,
        durable: true,
        exclusive: false
    }, (q) => {
        q.bind('#'); // Catch all messages   
        //q.bind('Topic_Exchange', 'payment.cardpayment');
        q.subscribe(function (message) {
            console.log('[+] ********************************************************')
            console.log('[+] Name : ' + q.name + ', EventsCount: ' + q.currentMessage.queue._eventsCount);
            console.log('[+] Exchange : ' + q.currentMessage.exchange + ', RoutingKey : ' + q.currentMessage.routingKey);
            console.log('[+] Timestamp : ' + q.currentMessage.headers.Timestamp);

            obj = JSON.parse(message.data.toString());

            //socket.broadcast.to(obj.id).emit('channel', obj);
            //io.sockets.in(obj.id).emit('message', obj);

            //let msgJson = JSON.stringify(obj, undefined, 2);
            if (q.currentMessage.routingKey === routingKey) {

                // Send Message to Client
                //io.emit(channel, msgJson);
                obj.time = moment(q.currentMessage.headers.Timestamp).format('DD/MMM/YYYY HH:mm:ss'); //HH:mm
                obj.routingKey = q.currentMessage.headers.Timestamp;
                io.sockets.emit(channel, obj);
                console.log('<<< ' + message.data.toString() + ' >>>');
            }
        });
    });
});

http.listen(process.env.PORT, () => {
    console.log('Server start on http://127.0.0.1:' + process.env.PORT);
});