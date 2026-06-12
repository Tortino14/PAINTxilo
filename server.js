const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "public")));

/* 🔥 FIX PRINCIPALE */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {

    socket.on("joinRoom", ({ room, username }) => {
        socket.join(room);
        socket.room = room;
        socket.username = username;

        socket.to(room).emit("chat", {
            message: `System: ${username} joined`
        });
    });

    socket.on("chat", (data) => {
        io.to(data.room).emit("chat", data);
    });

    socket.on("draw", (data) => {
        socket.to(data.room).emit("draw", data);
    });

});

http.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
