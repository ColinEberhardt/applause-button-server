const is = require("is_js");
const lambda = require("./util/lambda");
const { getItem, incrementClaps, putItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert, clamp } = require("./util/util");

module.exports.fn = lambda(async (event, success) => {
  const sourceUrl = getSourceUrl(event);

  const body = JSON.parse(event.body);
  let claps =
    typeof body === "string" ? Number(body.split(",")[0]) : Number(body);

  // for the v2.0.0 behaviour, where the clap count was a termporal offset, always
  // treat this as a single clap
  if (is.not.integer(claps)) {
    claps = 1;
  }

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
