import { browser, start_browser } from "./lib/browser";
import getHtml from "./lib/getHtml";
const fs = require("fs");
const arg = require("arg");

const args = arg({
  "--url": String,
  "--category": String,
  "--outputDir": String,
  "--container": String,
  "--replace-prefix": String,
  "--is-absolute": Boolean,
  "--help": Boolean,
  "--wait": Number,
  "--cache": Boolean,
  "--repair-broken": Boolean,

  "-u": "--url",
  "-c": "--category",
  "-o": "--outputDir",
  "-h": "--help",
  "-C": "--container",
  "-r": "--replace-prefix",
  "-a": "--is-absolute",
  "-w": "--wait",
  "-Ca": "--cache",
  "-rb": "--repair-broken",
});

if (args["--help"]) {
  console.log(`
  bun index.ts -u URL -c CATEGORY -o OUTPUTDIR -C CSS_SELECTOR [-r URL] [-a]
  --url, -u: URL to scrape
  --category, -c: Category name - will export all files to this subfolder
  --outputDir, -o: Output directory
  --container, -C: Container where the <a>'s are located. Supports CSS selectors
  --replace-prefix, -r: Replace prefix of URL. Useful when files are stored in a different server
  --is-absolute, -a: If the URLs of the files are absolute - if not, it will append the base URL to the file URL
  --wait, -w: Wait time between requests
  --cache, -Ca: (not implemented) Download the files in the home directory first, then move them to the output directory.
  --replace-if-incomplete, -ri: (not implemented) Downloads each file in the home directory first, and checks if there exists a file with the same name in the output directory.
  If there is, it will replace the file in the output directory with the file in the home directory. Useful if the download was interrupted.
  `);
  process.exit(0);
}

(async () => {
  const baseUrl = args["--url"];
  const category = args["--category"];
  const outputDir = args["--outputDir"];

  await start_browser();
  console.log(browser);

  const { html, $ } = await getHtml(baseUrl);

  const hrefs: string[] = [];

  $(args["--container"])
    .find("a")
    .each((i, el) => {
      const href = $(el).attr("href") as string;
      if (href === ".." || href === "../" || href === ".") return;
      hrefs.push(href);
    });

  let s = "";

  for (let i = 0; i < hrefs.length; i++) {
    let url;
    if (args["--is-absolute"]) {
      url = hrefs[i];
    } else {
      url = baseUrl + '/' + hrefs[i];
    }

    if (args["--replace-prefix"]) {
      const filename = url.split("/")[url.split("/").length - 1];
      url = args["--replace-prefix"] + "/" + filename;
    }

    s += `${url}\n`;
  }

  fs.writeFileSync(`${category}.txt`, s);
  fs.writeFileSync(
    `${category}.sh`,
    `
  #!/bin/bash
  wget -i ${category}.txt -P ${
      !args["--cache"] ? outputDir + '/' : `/home/$USER/.`
    }${category}/ --wait ${
      args["--wait"] ?? 1
    } --random-wait --no-check-certificate --no-clobber; ${
      args["--cache"]
        ? `mv -v /home/$USER/.${category} ${outputDir}/${category}`
        : ""
    }  
    `
  );
  await browser.close();
})();
