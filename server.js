const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const fetch = require("node-fetch")

app.use('/style', express.static(__dirname + '/style'))
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

io.on('connection', (socket) => {
    socket.name = 'Anonymous'
    socket.on('message', (msg, emotional_matrix) => {
        data = {
            'sender_id': socket.name,
            'message': msg,
            'emotional_matrix': emotional_matrix
        }
        io.emit('message', { 'name': socket.name, 'message': msg });
        try {
            fetch('http://localhost:5005/webhooks/rest/webhook', 
            {
                method: 'POST',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if (res.length > 0) {
                    response = res[0]['text'];
                }
                else {
                    response = 'Sorry, I didn\'t understand that. Can you try rephrasing?';
                }
                io.emit('message', { 'name': 'RasaBot', 'message': response});
            })
        }
        catch (error) {
            console.error(error)
            io.emit('message', {'name': 'RasaBot', 'message': 'Sorry, Rasa is unavailable right now. Please try again later.'})
        }
    })
    socket.on('join', (name) => {
        if (name != null && name != '') {
            socket.name = name
        }
    })
})

http.listen(3000, () => console.log('Listening on port 3000!'))
