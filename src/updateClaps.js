const is = require("is_js");
const lambda = require("./util/lambda");
const { getItem, incrementClaps, putItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert, clamp } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  const sourceUrl = getSourceUrl(event);
  const claps = Number(event.body);

  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);
  assert(is.not.nan(claps), `Clap count was not a number`);

  const clapIncrement = clamp(claps, 1, 10);
  let totalClaps;

  console.log(`adding ${clapIncrement} claps to ${sourceUrl}`);

  const item = await getItem(sourceUrl);

  if (item.Item) {
    totalClaps = item.Item.claps + clapIncrement;
    await incrementClaps(sourceUrl, clapIncrement);
  } else {
    totalClaps = clapIncrement;
    await putItem(sourceUrl, clapIncrement);
  }

  success(totalClaps);
});