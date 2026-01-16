// Phase 0 - Lesson 0.7



const http =require("http");
const {URL} = require("url");
const PORT = process.env.PORT? Number(process.env.PORT) : 3000;

function sendText(res, statusCode, text){
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(text);
}

function sendJson(res, statusCode, obj){
    res.statusCode = statusCode;
    res.setHeader("Content-Type","application/json; charset=utf-8");
    res.end(JSON.stringify(obj));

}




const server = http.createServer((req,res)=>{
    // Parse URL safely (pathname excludes query string)
    const fullUrl = new URL(req.url, `http://${req.headers.host || "localhost" }`);
    const pathname = fullUrl.pathname;
    
    console.log("METHOD:", req.method, "PATH:", pathname, fullUrl.search);

    if (pathname ==="/"){
        return sendText(res, 200, "Try: /hello?name=ZulkerNyne\n");
    }

    if (pathname ==="/health"){
        //Real APIs often return JSON health checks
        return sendJson(res, 200, {ok: true});


    }
    // NEW: /hello?name=...
    if (pathname ==="/hello"){
        const name = fullUrl.searchParams.get("name");

        if (!name){
            return sendJson(res,400,{error: "Missing ?name= in query string"});
        }
        return sendJson(res, 200, {message: `Hello ${name}!` ,});
    }
    //Consistent API-style 404(JSON)
    return sendJson(res, 404, {error: "Not Found", path: pathname});
});

server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});