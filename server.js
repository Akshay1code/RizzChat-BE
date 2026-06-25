require("dotenv").config();

let express = require("express");
let cors = require("cors");
let http = require("http");
let { Server } = require("socket.io");
let { ObjectId } = require("mongodb");

let { messageCollec, photoCollec } = require("./config/db");
let { upload, cloudinary } = require("./config/cloudinary");

let app = express();
app.use(express.json());
app.use(cors());

let httpServer = http.createServer(app);

app.post('/upload',upload.single('file'),async(req,res)=>{
  try{
    let data={
    username:req.body.username,
    caption:req.body.caption,
    file_url:req.file.path,
    file_name:req.file.filename,
    time:Date.now()
  }
  let result = await photoCollec.insertOne(data)
    res.send(result)
  }
  catch(err){
    res.send(err)
  }
})

app.get('/files',async(req,res)=>{
  let result = await photoCollec.find().toArray()
  res.send(result)
})

app.delete('/delete/:id',async(req,res)=>{
  let id = req.params.id;
  try{
    let result=await photoCollec.findOne({_id:new ObjectId(id)})
    await cloudinary.uploader.destroy(result.file_name)
    await photoCollec.deleteOne({_id:result._id})
    res.send()
  }
  catch(err){
    console.log(err.stack)
    res.send(err)
  }
})
let io = new Server(httpServer, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);
  socket.on('getHistory',async()=>{
    let data = await messageCollec.find().toArray()
    socket.emit('history',data)
  })
  socket.on("message", async(data) => {
    data.time=Date.now()
    await messageCollec.insertOne(data)
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => console.log("Server is alive at 3000"));