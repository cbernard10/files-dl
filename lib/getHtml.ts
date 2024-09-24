import * as cheerio from "cheerio";
import { browser, page } from "./browser";
import "dotenv/config";

const getHtml = async (
  url: string
): Promise<{
  html: string;
  $: cheerio.Root;
}> => {
  let html = "";
  let $: cheerio.Root;
  if (!page) {
    throw new Error("page not initialized");
  }
  try {
    try {
      await page.goto(url, { timeout: 20000 });
    } catch (e) {
      throw new Error(`url unreachable ${url}: ${e}`);
    }

    html = await page.content();
    $ = cheerio.load(html);
  } catch (e) {
    throw new Error(`could not get html from ${url}: ${e}`);
  }

  return { html, $ };
};

export default getHtml;
