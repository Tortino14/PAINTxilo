const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;

/* =======================
   STATIC FILES (FIX CANONICO)
======================= */
app.use(express.static(path.join(__dirname, "public")));

/* FIX: homepage esplicita */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =======================
   SOCKET.IO MULTIPLAYER
======================= */
io.on("connection", (socket) => {

    socket.on("joinRoom", ({ room, username }) => {
        socket.join(room);
        socket.room = room;
        socket.username = username;

        socket.to(room).emit("chat", {
            message: `System: ${username} joined`
        });
    });

    socket.on("draw", (data) => {
        socket.to(data.room).emit("draw", data);
    });

    socket.on("shape", (data) => {
        socket.to(data.room).emit("shape", data);
    });

    socket.on("chat", (data) => {
        io.to(data.room).emit("chat", data);
    });

    socket.on("clear", (room) => {
        io.to(room).emit("clear");
    });

    socket.on("disconnect", () => {
        if (socket.room && socket.username) {
            socket.to(socket.room).emit("chat", {
                message: `System: ${socket.username} left`
            });
        }
    });

});

/* =======================
   START SERVER (RENDER FIX)
======================= */
http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});