const is = require("is_js");
const lambda = require("./util/lambda");
const { getItem, incrementClaps, putItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert, clamp } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  const sourceUrl = getSourceUrl(event);
  const claps = Number(String(event.body).split(",")[0]);

  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);
  assert(is.not.nan(claps), `Clap count was not a number`);

  const clapIncrement = clamp(claps, 1, 10);
  let totalClaps;

  console.log(`adding ${clapIncrement} claps to ${sourceUrl}`);

  const item = await getItem(sourceUrl);

  const sourceIp = event.requestContext.identity.sourceIp;

  if (item.Item) {
    const clapStats = item.Item;
    if (clapStats.sourceIp && clapStats.sourceIp === sourceIp) {
      totalClaps = clapStats.claps;
      console.log(
        `multiple claps from the same sourceIp prohibited ${clapStats.sourceIp}`
      );
    } else {
      totalClaps = clapStats.claps + clapIncrement;
      await incrementClaps(sourceUrl, clapIncrement, sourceIp);
    }
  } else {
    totalClaps = clapIncrement;
    await putItem(sourceUrl, clapIncrement, sourceIp);
  }

  success(totalClaps);
});
