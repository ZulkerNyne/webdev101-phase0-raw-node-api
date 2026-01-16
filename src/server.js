// Phase 0 - Lesson 0.6
// Goal: cleaner routing + correct headers + consistent responses (helpers)


const http =require("http");
const {URL} = require("url");
const PORT = process.env.PORT? Number(process.env.PORT) : 3000;

function sendText(res, statusCode, text){
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(text);
}

funtion sendJson(res, statusCode, obj){
    res.statusCode = statusCode;
    res.setHeader("Content-Type","application/json; charset=utf-8");
    res.end(JSON.stringify(obj));

}




const server = http.createServer((req,res)=>{
    // Parse URL safely (pathname excludes query string)
    const fullUrl = new URL(req.url, `http://${req.headers.host || "localhost" }`);
    const pathname = fullUrl.pathname;
    
    console.log("METHOD:", req.method, "URL:", req.url);

    if (pathname ==="/"){
        return sendText(res, 200, "Homepage\n");
    }

    if (pathname ==="/health"){
        //Real APIs often return JSON health checks
        return sendJson(res, 200, {ok: true});


    }
    //Consistent API-style 404(JSON)
    return sendJson(res, 404, {error: "Not Found", path: pathname});
});

server.listen(3000,()=>{
    console.log("Server is running at http://localhost:3000");
});