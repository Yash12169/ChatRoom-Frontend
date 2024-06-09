const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const userSocketMap = new Map();
const socketUserMap = new Map();
app.use(cors());

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('user_connected' , (djangoUserId)=>{
        userSocketMap.set(djangoUserId,socket.id);
        socketUserMap.set(socket.id,djangoUserId);
        console.log(`User ${djangoUserId} connected with socket ${socket.id}`);
    })


    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });



    socket.on('send_message', (data) => {
        console.log(`${data.content} received from user ${data.sender} to room ${data.room}`);
        socket.to(data.room).emit('received_message', data);
    });

    socket.on('send_friend_request', (data) => {
        const {id,senderId,susername,profile_picture,receiverId} = data;
        console.log(`Friend request from ${senderId} to ${receiverId}`);
        const receiverSocketId = userSocketMap.get(parseInt(receiverId, 10));
        console.log("this is receiver socket id",receiverSocketId)
        console.log(id)
        if(receiverSocketId){
            io.to(receiverSocketId).emit('friend_request_received',{
                id,
                senderId,
                susername,
                profile_picture,
                message:`${susername} sent you a friend request`,
            });
        }


    })




    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });



});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
