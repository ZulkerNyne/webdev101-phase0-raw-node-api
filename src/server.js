const http =require("http");

const PORT = process.env.PORT? Number(process.env.PORT) : 3000;
const server = http.createServer((req,res)=>{
    res.statusCode =200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Hello from a Node HTTP server!\n");

});

server.listen(3000,()=>{
    console.log("Server is running at http://localhost:3000");
});