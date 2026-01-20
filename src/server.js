// Phase 0 - Lesson 0.11
// Goal: Method-aware routing (405 + Allow headers) + consistent helpers
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

function methodNotAllowed(res, allowedMethods){
    res.statusCode = 405;
    res.setHeader("Allow", allowedMethods.join(", "));
    return sendJson(res, 405,{
        error: "Method Not Allowed",
        allow: allowedMethods,
    });
}




const server = http.createServer((req,res)=>{
    
    // req.url is a path like "/search?q=..."
   // URL() needs a full URL, so we provide a base like "http://localhost".
    const fullUrl = new URL(req.url, `http://${req.headers.host || "localhost" }`);
    
    // pathname is the route part only (no query string).
   // Example: "/search" even if req.url is "/search?q=capital..."
    const pathname = fullUrl.pathname;
    
    console.log("METHOD:", req.method, "PATH:", pathname);
    //GET /
    if (pathname ==="/"){
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        return sendText(res, 200, "Try: POST /echo GET /health\n");
    }

    //GET /health
    if (pathname ==="/health"){
        if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
        return sendJson(res, 200, {status: "ok"});
    }

    if (pathname=== "/echo"){
        if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

        let body = "";
        //Body arrives in chunk 
        req.on("data",(chunk) =>{
            body+=chunk;
        });
        

        // When all chunks are recieved
        req.on("end",() =>{
            //Missing body ->400
            if (!body){
                return sendJson(res, 400, {error: "Missing JSON body"});
            }

            try{
                //Parse JSON text into JS object
                const data = JSON.parse(body);
                return sendJson(res, 200, {received: data});
            }
            catch{
                //Invalid JSON ->400
                return sendJson(res, 400, {error: "Invalid JSON"});
            }
        });

        return; 
        
        
        
        
        
        
        
        

        
    
    
    }
    
    //Consistent API-style 404(JSON)
    return sendJson(res, 404, {error: "Not Found", path: pathname});
});

server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});