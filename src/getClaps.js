const is = require("is_js");
const lambda = require("./util/lambda");
const { getItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  // robots do not include Referer, so fail fast
  if (!event.headers.Referer) {
    success("no referer set");
    return;
  }

  const sourceUrl = getSourceUrl(event);
  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);

  const item = await getItem(sourceUrl);
  if (item.Item) {
    success(item.Item.claps);
  } else {
    success(0);
  }
});
