import inquirer from "inquirer";
import fs from "node:fs";
import fse from "fs-extra";

async function run() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "extension name:",
      default: "my-extension",
    },
    {
      type: "input",
      name: "author",
      message: "author:",
      default: "Author Name",
    },
    {
      type: "input",
      name: "description",
      message: "description:",
      default: "A Fast and good extension",
    },
    {
      type: "input",
      name: "version",
      message: "version:",
      default: "1.0.0",
    },
    {
      type: "list",
      name: "manifestVersion",
      message: "manifest version:",
      choices: ["3", "2"],
      default: "3",
    },
    {
      type: "list",
      name: "browsers",
      message: "browser support:",
      choices: ["Chromium", "Mozilla"],
      default: ["Chromium"],
    },
    {
      type: "confirm",
      name: "includePopup",
      message: "include popup UI:",
      default: true,
    },
    {
      type: "checkbox",
      name: "permissions",
      message: "permissions:",
      choices: ["storage", "tabs", "activeTab", "notifications", "background"],
    },
  ]);

  function formatString(str) {
    return str.toLowerCase().replace(/\s+/g, "-");
  }

  const extension_folder_name = formatString(answers["name"]);
  if (fs.existsSync(extension_folder_name)) {
    console.error(`❌ Folder "${extension_folder_name}" already exists.`);
    return;
  }
  await fse.mkdirp(extension_folder_name);

  let manifest = ``;
  switch (answers["browsers"]) {
    case "Mozilla": 
      manifest = {
        manifest_version: 2,
        name: answers["name"],
        version: answers["version"],
        description: answers["description"],
        icons: {},
        permissions: answers["permissions"],
        background: {
          scripts: ["background.js"],
        },
        browser_action: {
          default_popup: "popup/popup.html",
          default_icon: {},
        },
        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["content.js"],
          },
        ],
        options_ui: {
          page: "options/options.html",
          open_in_tab: true,
        },
      };
      break;

    case "Chromium":
      manifest = {
        manifest_version: parseInt(answers["manifestVersion"]),
        name: answers["name"],
        version: answers["version"],
        description: answers["description"],
        permissions: answers["permissions"],
        background: {
          service_worker: "background.js",
        },
        content_scripts: [
          {
            matches: ["<all_urls>"],
            js: ["content.js"],
          },
        ],
        action: {
          default_popup: "popup/popup.html",
          default_icon: {},
        },
        options_page: "options/options.html",
        icons: {},
        host_permissions: ["<all_urls>"],
      };
      break;

    default:
      break;
  }

  const content = JSON.stringify(manifest, null, 2);
  await fse.outputFile(`${extension_folder_name}/manifest.json`, content);

  await fse.outputFile(`${extension_folder_name}/options/options.html`, "");
  await fse.outputFile(`${extension_folder_name}/options/options.js`, "");
  await fse.outputFile(`${extension_folder_name}/options/options.css`, "");
  await fse.outputFile(`${extension_folder_name}/popup/popup.html`, "");
  await fse.outputFile(`${extension_folder_name}/popup/popup.js`, "");
  await fse.outputFile(`${extension_folder_name}/popup/popup.css`, "");
  await fse.outputFile(`${extension_folder_name}/background.js`, "");
  await fse.outputFile(`${extension_folder_name}/content.js`, "");
}

run().catch((err) => {
  console.error("❌ Something went wrong:", err);
});
