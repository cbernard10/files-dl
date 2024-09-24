import fs from "fs";

export const nodesToText = ($: cheerio.Root, node: cheerio.Cheerio) =>
  // extracts text from a node whose children are <br> separated
  $(node)
    .html()
    ?.split("<br>")
    .map((effect) => effect.replace(/<[^>]*>?/gm, "").trim()) ?? [];

export const saveJson = (data: any, filename: string) => {
  if (!filename.endsWith(".json")) {
    throw new Error("Filename must end with .json");
  }
  fs.writeFileSync(`${filename}`, JSON.stringify(data, null, 2));
};

export const tdToNumber = (
  $: cheerio.Root,
  row: cheerio.Element,
  n: number
): number => {
  return parseInt($(row).find("td").eq(n).text().trim()) ?? 0;
};
