import { serveDir } from "jsr:@std/http/file-server";

console.log('REAL URL -----> http://0.0.0.0:8000/join-tool')

Deno.serve((req) => {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/join-tool")) {
    // Rewrite to strip /join-tool and serve from dist/
    const rewritten = new Request(
      req.url.replace("/join-tool", ""),
      req
    );
    return serveDir(rewritten, {
      fsRoot: "./dist",
      urlRoot: "",
    });
  }

  return new Response("Not Found", { status: 404 });
});