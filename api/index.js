const lodash = require('lodash');
const { map } = lodash;
module.exports = (req, res) => {
  const arr = ['year', 'month', 'date'];
  const str = map(arr, item => `${item}==`).join('>');
  res.end(str);
};
