import { OAuthApp } from "https://esm.sh/@octokit/oauth-app";

export async function handleOAuth(
  req: Request,
  headers: Headers
): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing code" }), {
      status: 400,
      headers,
    });
  }

  const CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID")!;
  const CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET")!;

  try {
    const app = new OAuthApp({
      clientType: "oauth-app",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    const { authentication } = await app.createToken({
      code,
    });

    return new Response(JSON.stringify({ token: authentication.token }), {
      headers,
    });
  } catch (err) {
    console.error("OAuth exchange error:", err);
    return new Response(JSON.stringify({ error: "OAuth exchange failed" }), {
      status: 500,
      headers,
    });
  }
}
