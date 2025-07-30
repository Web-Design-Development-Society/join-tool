const CLIENT_ID = "Ov23liunYSrQhokkKLKT";
const scopes = "read:user user:email";
const SERVER_URL = 'https://join-github-org-es70nk4w6cj1.deno.dev'

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

(async function handleCode() {
  if (!code) {
    return;
  }

  const tokenRes = await fetch(
    `${SERVER_URL}/api/authenticate?code=${code}`
  );
  const { token } = await tokenRes.json();

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers }),
    fetch("https://api.github.com/user/emails", { headers }),
  ]);

  const [user, emails] = await Promise.all([userRes.json(), emailsRes.json()]);

  if (emails.every(({ email }: { email: string}) => !email.endsWith("@byui.edu"))) {
    globalThis.alert("You need to have a BYUI email to use this tool!");
    return;
  }

  const res = await fetch(`${SERVER_URL}/api/invite`, {
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
    return;
  }

  // Handle success or specific statuses
  if (responseData.status === "already_member") {
    globalThis.alert(`${user.name || user.login} is already a member!`);
    return;
  }

  if (responseData.status === "invited") {
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
})();
