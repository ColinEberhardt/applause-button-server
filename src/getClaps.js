const lambda = require("./util/lambda");
const { getItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert } = require("./util/util");
const { attributeCosts } = require("./util/attributeCosts");

module.exports.fn = lambda(async (event, success) => {
  // robots do not include Referer, so fail fast
  if (!event.headers.Referer) {
    success("no referer set");
    return;
  }

  const sourceUrl = getSourceUrl(event);
  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);

  const item = await getItem(sourceUrl);

  const consumer = sourceUrl.split("/")[0];

  // cost metrics
  // 80k invocations per day, at a cost of $1.2
  const invocationsPerDay = 80000;
  const dailyRunningCost = 1.2;
  const percentOfRequestsToAttribute = 0.01;
  if (Math.random() < percentOfRequestsToAttribute) {
    attributeCosts(
      consumer,
      dailyRunningCost / (invocationsPerDay * percentOfRequestsToAttribute)
    );
  }

  if (item.Item) {
    success(item.Item.claps);
  } else {
    success(0);
  }
});
