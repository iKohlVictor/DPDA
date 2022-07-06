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

  let array = [];
  lines.forEach((l) => {
    array.push(l.replace(",", "").replace("\r", ""));
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

  let { states, initialState, endState } = await getStates(dpdaJson);
  let cont = 0;
  for (const word of words) {
    cont++;
    const letters = word.toString().split("");
    let state = initialState;
    let isTrapState = false;
    let stack = [];
    for (const letter of letters) {
      const process = await processValidate(state, letter, dpdaJson);
      if (process !== null) {
        state = process.actualState;
        const [newStack, status] = await constructStack(
          stack,
          process.executeCharacter,
          process.isPop,
          process.isPush
        );
        stack = [...newStack];

        if (status === false || status === null) {
          isTrapState = true;
          break;
        }
      }
    }
    if (isTrapState) {
      console.log("[" + cont + "] " + word + " => REJECT");
    }

    if (stack.length > 0 || !endState.includes(state)) {
      console.log("[" + cont + "] " + word + " => REJECT");
    }

    if (stack.length == 0 && endState.includes(state) && !isTrapState) {
      console.log("[" + cont + "] " + word + " => ACCEPT");
    }
  }
};

const getStates = async (dpdaJson) => {
  let objStates = {
    states: [],
    initialState: "",
    endState: [],
  };

  objStates.states = dpdaJson["Q"];

  objStates.initialState = dpdaJson["S"];

  objStates.endState = dpdaJson["F"];

  return objStates;
};

const constructStack = async (stack, value, isPop, isPush) => {
  const currentStack = [...stack];
  if (isPush) {
    if (value === "") {
      return [currentStack, null];
    }
    currentStack.push(value);
  }

  if (isPop) {
    if (value === "") {
      return [currentStack, null];
    }

    if (currentStack.length === 0) {
      return [currentStack, false];
    }

    if (currentStack[currentStack.length - 1] !== value) {
      return [currentStack, false];
    }
    currentStack.pop();
  }

  return [currentStack, true];
};

const processValidate = async (actualState, value, dpda) => {
  let isPop = false;
  let isPush = false;
  let executeCharacter = "";

  let terminal = dpda["delta"][actualState][value];

  if (terminal) {
    for (let i = 0; i < terminal.length; i++) {
      if (terminal[i] !== "") {
        if (i === 0) {
          executeCharacter = terminal[i];
          isPop = true;
        } else if (i === 1) {
          executeCharacter = terminal[i];
          isPush = true;
        }
      }
    }

    actualState = terminal[terminal.length - 1];
    return { actualState, isPop, isPush, executeCharacter };
  }

  return null;
};

main();
