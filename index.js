const fs = require("fs");
const path = require("path");
const filePath = [process.argv[2], process.argv[3]];

const readFile = async (filePath) => {
  const ext = path.extname(filePath);
  try {
    const data = fs.readFileSync(filePath, "utf8");
    if (ext == ".json") {
      return JSON.parse(data);
    }
    if (ext == ".txt") {
      return formatTxtArray(data);
    }
  } catch (err) {
    console.error(err);
  }
};

const formatTxtArray = async (txtArray) => {
  let data = [];
  let lines = txtArray.split("\n");
  lines = lines.split("\r");
  let array = [];
  lines.forEach((l) => {
    array.push(l.replace(",", ""));
  });

  data = array;
  return data;
};

const main = async () => {
  let dpdaJson;
  let words;

  if (filePath) {
    dpdaJson = await readFile(filePath[0]);
    words = await readFile(filePath[1]);
  } else {
    return "Dont have path";
  }

  console.log("dpda =>", dpdaJson);
  console.log("word =>", words);
};

main();
