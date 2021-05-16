const parseBool = (str) => {
  if (str.length == null) return (str === 1) ? true : (str === true);
  return (str === '1') ? true : (str === 'true');
};

module.exports = { parseBool };
