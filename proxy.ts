import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";

const ARCJET_KEY = process.env.ARCJET_KEY;
if (!ARCJET_KEY) {
  throw new Error("ARCJET_KEY environment variable is required");
}

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

export default createMiddleware(aj);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
