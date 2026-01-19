// Phase 0 - Lesson 0.9
//Upgrade/search: normalization + partial matches + min length + max results 

const http =require("http");
const {URL} = require("url");
const PORT = process.env.PORT? Number(process.env.PORT) : 3000;


const KNOWLEDGE =[
    {question: "capital of bangladesh", answer: "Dhaka"},
    {question: "capital of canada", answer: "Ottawa"},
    {question: "capital of japan", answer: "Tokyo"},
    {question: "capital of egypt", answer: "Cairo"},
];


// Normalize user input so searching is more reliable.
// - convert to string (safe even if null)
// - trim spaces
// - lowercase for case-insensitive match
function normalize(s){
    return String(s ?? "").trim().toLowerCase();
}


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
    
    // req.url is a path like "/search?q=..."
   // URL() needs a full URL, so we provide a base like "http://localhost".
    const fullUrl = new URL(req.url, `http://${req.headers.host || "localhost" }`);
    
    // pathname is the route part only (no query string).
   // Example: "/search" even if req.url is "/search?q=capital..."
    const pathname = fullUrl.pathname;
    
    console.log("METHOD:", req.method, "PATH:", pathname, "Query:", fullUrl.search);

    if (pathname ==="/"){
        return sendText(res, 200, "Try: /search?q=capital or /search?q=bangladesh\n");
    }

    if (pathname=== "/search"){
        const q = normalize(fullUrl.searchParams.get("q"));

        if (!q) {
            return sendJson(res, 400, {error: "Missing ?q= in query string"});
        }

        // too short 
        if (q.length<3){
            return sendJson(res, 400, {error: "Query too short. Use at least 3 characters."});
        }
        //  Partial Matching + multiple results 
        const hits = KNOWLEDGE.filter((item) =>{
            const question = normalize(item.question);
            const answer = normalize(item.answer);
            return question.includes(q) || answer.includes(q);
        })

        //No results -> 200 with empty array (search is still valid )

        if (hits.length===0){
            return sendJson(res, 200, {query: q, count: 0, results: [] });
        }

        //Limit results 
        
        const MAX_RESULTS = 5;
        const limited = hits.slice(0, MAX_RESULTS);

        //Return GOOGLE style JSON 

        return sendJson(res, 200, {
            query: q, 
            count : limited.length, 
            results : limited.map((item) =>({
                title : item.answer,
                snippet : `Q: ${item.question}`,
            })),
        });
        

        
    
    
    }
    
    //Consistent API-style 404(JSON)
    return sendJson(res, 404, {error: "Not Found", path: pathname});
});

server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});