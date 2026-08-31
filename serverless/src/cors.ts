export function cors() {
  const headers = new Headers();
  headers.set(
    "Access-Control-Allow-Origin",
    Deno.env.get("MODE") === "dev"
      ? "http://localhost:5173"
      : "https://web-design-development-society.github.io"
  );

  // Allow the necessary HTTP methods and headers
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  headers.set("Content-Type", "application/json");

  return headers;
}
