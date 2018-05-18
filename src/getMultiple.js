const is = require("is_js");
const lambda = require("./util/lambda");
const { getItems } = require("./util/persistence");
const { isurl, assert } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  assert(is.array(event.body), "getMultiple requires an array");
  assert(event.body.every(isurl), "getMultiple requires an array of URLs");

  const items = await getItems(event.body);
  success(items.Responses.Applause);
});