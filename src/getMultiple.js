const is = require("is_js");
const lambda = require("./util/lambda");
const { getItems } = require("./util/persistence");
const { isurl, assert, unique } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  const urls = JSON.parse(event.body);

  assert(is.array(urls), "getMultiple requires an array");
  assert(urls.every(isurl), "getMultiple requires an array of URLs");

  // limit the query to 100 URLs
  const items = await getItems(unique(urls.slice(0, 100)));
  success(items);
});