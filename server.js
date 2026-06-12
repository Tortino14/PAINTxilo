const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

/* 🔥 HTML DIRETTO */
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Paint Multiplayer</title>
<script src="/socket.io/socket.io.js"></script>
</head>
<body>

<h2>Paint Multiplayer</h2>

<input id="username" placeholder="username">
<input id="room" placeholder="room">
<button onclick="join()">Join</button>

<canvas id="c" width="800" height="500" style="border:1px solid black"></canvas>

<div id="chat"></div>
<input id="msg">
<button onclick="send()">Send</button>

<script>
const socket = io();
let room="", username="";

function join(){
  username=document.getElementById("username").value;
  room=document.getElementById("room").value;
  socket.emit("joinRoom",{room,username});
}

function send(){
  socket.emit("chat",{room,message:username+": "+document.getElementById("msg").value});
}

socket.on("chat",(d)=>{
  const div=document.createElement("div");
  div.textContent=d.message;
  document.getElementById("chat").appendChild(div);
});

const c=document.getElementById("c");
const ctx=c.getContext("2d");
let drawing=false;

c.onmousedown=()=>drawing=true;
c.onmouseup=()=>drawing=false;

c.onmousemove=(e)=>{
  if(!drawing) return;
  const r=c.getBoundingClientRect();
  const x=e.clientX-r.left;
  const y=e.clientY-r.top;

  ctx.fillRect(x,y,3,3);
  socket.emit("draw",{room,x,y});
};

socket.on("draw",(d)=>{
  ctx.fillRect(d.x,d.y,3,3);
});
</script>

</body>
</html>
    `);
});

/* SOCKET */
io.on("connection",(socket)=>{

  socket.on("joinRoom",({room,username})=>{
    socket.join(room);
    socket.room=room;
  });

  socket.on("chat",(d)=>{
    io.to(d.room).emit("chat",d);
  });

  socket.on("draw",(d)=>{
    socket.to(d.room).emit("draw",d);
  });

});

http.listen(PORT,()=>{
  console.log("Server running on "+PORT);
});
