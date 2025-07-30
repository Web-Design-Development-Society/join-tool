import { cors } from "./cors.ts";
import { handleInvite } from "./invite.ts";
import { handleOAuth } from "./oauth.ts";

Deno.serve(async (req) => {
  const headers = cors();
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content
      headers,
    });
  }

  const url = new URL(req.url);

  if (url.pathname === "/api/invite" && req.method === "POST") {
    return await handleInvite(req, headers);
  }

  if (url.pathname === "/api/authenticate" && req.method === "GET") {
    return await handleOAuth(req, headers);
  }

  return new Response("Not Found", { status: 404 });
});
