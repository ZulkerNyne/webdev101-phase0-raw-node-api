// Phase 0 - Lesson 0.12
// Goal: Production safety for JSON (415, 413, abort handling)




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

/**
 * Production-safe JSON Body reader
 * -415 if Content-Type isn't application/json
 * -413 if paylaod exceeds maxByte
 * -handles client abort
 */

/**
 * readJsonBody(req, res, { maxBytes })
 *
 * Reads the request body safely and returns a Promise with a result object.
 * Why Promise? Because body reading is async: it arrives in events ("data", "end").
 *
 * It may respond immediately (415/413) and return { handled: true }.
 * Otherwise it returns either:
 *  - { handled:false, ok:true, data:<parsed JSON> }
 *  - { handled:false, ok:false, status:<code>, obj:<error JSON> }
 */

function readJsonBody(req, res, {maxBytes}) {
    const contentType = String(req.headers["content-type"] || "").toLowerCase();

    if (!contentType.startsWith("application/json")){
        sendJson(res, 415, {
            error: "Unsupported Media Type",
            message: "Send Content-Type : application/json",
        });
        return {handled: true};
    }

    let body ="";
    let bytes =0; 
    let aborted =false; 
 // Return a Promise because we'll resolve later, after we get "end" or an error/abort
    return new Promise((resolve) =>{

        // If the client disconnects mid-request, stop work
        req.on("aborted",() =>{
            aborted = true; 
            resolve({handled: true});
        });
 // If a stream error happens, stop work
        req.on("error",() =>{
            aborted = true;
            resolve({handled: true});
        });

        req.on("data", (chunk) =>{
            if (aborted) return;

            bytes += chunk.length;

            if (bytes>maxBytes){
                sendJson(res, 413, {error: "Payload too large", maxBytes});
                aborted = true; 
                req.destroy();
                resolve({handled: true});
                return;
            }

            body += chunk;
        });

        req.on("end",() =>{
            if (aborted) return resolve({ handled: true});

            if (!body){
                return resolve({
                    handled: false,
                    ok: false, 
                    status : 400,
                    obj : {error: "Missing JSON body"},
                });
            }

            try {
                const data = JSON.parse(body);
                return resolve({handled: false, ok: true, data});
            } catch {
                return resolve({
                    handled: false, 
                    ok: false,
                    status: 400,
                    obj: {error: "Invalid JSON"},
                });
            }
        });
    });
}



const server = http.createServer(async(req,res)=>{
    
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
        const result = await readJsonBody(req, res, {maxBytes: 1024*1024});
        if (result.handled) return;

        if (!result.ok) return sendJson(res, result.status, result.obj);
        
        return sendJson(res, 200, {received: result.data});
        
        
    
    
    }
    
    //Consistent API-style 404(JSON)
    return sendJson(res, 404, {error: "Not Found", path: pathname});
});

server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});