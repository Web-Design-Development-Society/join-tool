import { createAppAuth } from "https://esm.sh/@octokit/auth-app";
import { Octokit } from "https://esm.sh/@octokit/core";
import type { RequestError } from "https://esm.sh/@octokit/request-error";

export async function handleInvite(
  req: Request,
  headers: Headers
): Promise<Response> {
  const PRIVATE_KEY = Deno.env.get("GITHUB_APP_PRIVATE_KEY")!;
  const APP_ID = Number(Deno.env.get("GITHUB_APP_ID"));
  const INSTALLATION_ID = Number(Deno.env.get("GITHUB_INSTALLATION_ID"));
  const ORG = Deno.env.get("GITHUB_ORG")!;

  const auth = createAppAuth({
    appId: APP_ID,
    privateKey: PRIVATE_KEY,
    installationId: INSTALLATION_ID,
  });

  const installationAuthentication = await auth({ type: "installation" });
  const octokit = new Octokit({ auth: installationAuthentication.token });

  try {
    const { username, userId } = await req.json();

    try {
      await octokit.request("GET /orgs/{org}/members/{username}", {
        org: ORG,
        username,
      });

      return new Response(JSON.stringify({ status: "already_member" }), {
        headers,
      });
    } catch (err: unknown) {
      if ((err as RequestError).status !== 404) throw err;
    }

    const res = await octokit.request("POST /orgs/{org}/invitations", {
      org: ORG,
      invitee_id: userId,
      role: "direct_member",
    });

    return new Response(JSON.stringify({ status: "invited", acceptLink: res.data.invitation_teams_url }), {
      headers,
    });
  } catch (err) {
    console.error("Error inviting user:", err);
    return new Response(
      JSON.stringify({
        status: "error",
        message: (err as RequestError).message,
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}
