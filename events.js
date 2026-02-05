global.Commands = [];

global.addCommand = (info, func) => {
  Commands.push({ ...info, func });
};
