import { Octokit } from "https://esm.sh/@octokit/core";

const CLIENT_ID = "Ov23liunYSrQhokkKLKT";
const scopes = "read:user user:email";

const btn = document.getElementById("githubLoginBtn") as HTMLButtonElement;
btn.addEventListener("click", login);

function login() {
  // Redirect to your GitHub OAuth endpoint
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scopes
  )}`;
  globalThis.location.href = redirectUrl;
}

const url = new URL(location.href);
const code = url.searchParams.get("code");

if (code) {
  const res = await fetch(
    `http://localhost:8000/api/authenticate?code=${code}`
  );
  const { token } = await res.json();

  const octokit = new Octokit({ auth: token });
  const { data: user } = await octokit.request("GET /user");
  const { data: emails } = await octokit.request("GET /user/emails");

  if (emails.every(({ email }) => !email.endsWith("@byui.edu"))) {
    globalThis.alert("You need to have a BYUI email to use this tool!");
  } else {
    const res = await fetch("http://localhost:8000/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, username: user.login }),
    });

    const responseData = await res.json(); // Parse the response as JSON

    if (!res.ok) {
      // Handle any HTTP errors, like 500, 400, etc.
      globalThis.alert(
        "There was an error: " + responseData.message || "Unknown error"
      );
    } else {
      // Handle success or specific statuses
      if (responseData.status === "already_member") {
        globalThis.alert(`${user.name || user.login} is already a member!`);
      } else if (responseData.status === "invited") {
        (document.querySelector("h1") as HTMLHeadingElement).innerText =
          "You've been Invited!";
        btn.removeEventListener("click", login);
        btn.innerText = "Open Invite URL";
        btn.onclick = () =>
          globalThis.open(
            "https://github.com/orgs/Web-Design-Development-Society/invitation",
            "_blank"
          );
      }
    }
  }
}
