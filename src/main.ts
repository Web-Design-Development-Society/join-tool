import "./styles.css";

const SERVER_URL = import.meta.env.VITE_API_URL;
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const scopes = "read:user user:email";

if (!CLIENT_ID) throw new Error("Missing VITE_GITHUB_CLIENT_ID");
if (!SERVER_URL) throw new Error("Missing VITE_API_URL");

const btn = document.getElementById("githubLoginBtn") as HTMLButtonElement;
btn.addEventListener("click", login);

function login() {
  const prevUrl = globalThis.location.href.split("?")[0];
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scopes,
  )}&redirect_uri=${encodeURIComponent(prevUrl)}`;
  globalThis.location.href = redirectUrl;
}

const url = new URL(location.href);
const code = url.searchParams.get("code");

(async function handleCode() {
  if (!code) {
    return;
  }

  const tokenRes = await fetch(`${SERVER_URL}/api/authenticate?code=${code}`);
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

  type EmailData = {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
  };

  const hasBYUIEmail = emails.some(
    ({ email, verified }: EmailData) => email.endsWith("@byui.edu") && verified,
  );

  if (!hasBYUIEmail) {
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
      "There was an error: " + responseData.message || "Unknown error",
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
        "_blank",
      );
  }
})();
