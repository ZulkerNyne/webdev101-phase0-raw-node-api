const http =require("http");

const PORT = process.env.PORT? Number(process.env.PORT) : 3000;
const server = http.createServer((req,res)=>{
    console.log("METHOD:", req.method, "URL:", req.url);

    if (req.url ==="/"){
        res.statusCode=200;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Home page\n");
        return;
    }

    if (req.url ==="/health"){
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({status: "Ok" }));
        return;


    }
    res.statusCode =404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("NOT FOUND\n");
});

server.listen(3000,()=>{
    console.log("Server is running at http://localhost:3000");
});