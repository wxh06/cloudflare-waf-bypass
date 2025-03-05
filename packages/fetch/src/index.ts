import { work } from "@cloudflare-waf-bypass/pow";
import { connect } from "puppeteer-real-browser";
import type { Page } from "rebrowser-puppeteer-core";
import {
  fetch,
  getSetCookies,
  Request,
  type RequestInfo,
  type RequestInit,
  type Response,
} from "undici";
import { matchDomain } from "./cookies";

const clearanceCookie = "cf_clearance";

export function newWaf(wafUrl: string): Promise<{
  challenge: (url?: string) => Promise<void>;
  fetch: typeof fetch;
}>;
export function newWaf(wafUrl?: string): Promise<{
  challenge: (url: string) => Promise<void>;
  fetch: typeof fetch;
}>;
export async function newWaf(wafUrl?: string) {
  const clearances: Record<string, string> = {};
  async function getClearance(page: Page, url: string): Promise<void> {
    let response = await page.goto(url);
    while (!response || response.headers()["cf-mitigated"] === "challenge")
      response = await page.waitForNavigation();
    Object.assign(
      clearances,
      Object.fromEntries(
        (await page.browserContext().cookies())
          .filter(({ name }) => name === clearanceCookie)
          .map(({ domain, value }) => [domain, value]),
      ),
    );
  }

  const { page, browser } = await connect({
    headless: false,
    turnstile: true,
  });
  if (wafUrl) await getClearance(page, wafUrl);
  await page.close();

  return {
    async challenge(url?: string) {
      const page = await browser.newPage();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await getClearance(page, (url ?? wafUrl)!);
      await page.close();
    },

    async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
      const request = new Request(input, init);
      request.headers.append("user-agent", await browser.userAgent());
      const url = new URL(request.url);
      const clearance = Object.entries(clearances).find(([domain]) =>
        matchDomain(url.hostname, domain),
      );
      if (clearance)
        request.headers.append("cookie", `${clearanceCookie}=${clearance[1]}`);
      const response = await fetch(request);

      const pow = getSetCookies(response.headers).find(
        ({ name }) => name === "pow",
      );
      if (pow) {
        const setCookies = getSetCookies(response.headers);
        setCookies
          .filter(({ domain }) => !domain || matchDomain(url.hostname, domain))
          .forEach((cookie) => {
            if (cookie.name === "pow") cookie.value = work(pow.value);
            request.headers.append("cookie", `${cookie.name}=${cookie.value}`);
          });
        console.log(request.headers);
        return fetch(request);
      }

      return response;
    },
  };
}
