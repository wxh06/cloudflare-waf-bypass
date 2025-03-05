import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Response } from "undici";
import index from "./index.js";

const { newWaf } = index;

const cloudflareUrl = "https://www.cloudflare.com/";

describe("codeforces", async () => {
  const codeforcesLogin = "https://codeforces.com/enter";

  const isLoginPage = (promise: Promise<Response>) =>
    promise
      .then((r) => r.text())
      .then((text) => text.includes("Login - Codeforces"));

  it("should be able fetch the login page", async (t) => {
    const { fetch, close } = await newWaf(codeforcesLogin);
    t.after(close);

    assert(await isLoginPage(fetch(codeforcesLogin)));
    assert(await isLoginPage(fetch(codeforcesLogin)));
  });

  it("should work after multiple challenges", async (t) => {
    const { challenge, fetch, close } = await newWaf(cloudflareUrl);
    t.after(close);
    await challenge(codeforcesLogin);
    await challenge(codeforcesLogin);
    await challenge(cloudflareUrl);

    assert(await isLoginPage(fetch(codeforcesLogin)));
    assert(await isLoginPage(fetch(codeforcesLogin)));
  });
});
