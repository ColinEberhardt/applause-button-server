const is = require("is_js");
const lambda = require("./util/lambda");
const { getItem, incrementClaps, putItem } = require("./util/persistence");
const { isurl, getSourceUrl, assert, clamp } = require("./util/util");

// the anticipated latency between someone clicking the button, and the 

// the wavelength of our clap function, 5 minutes
const WAVELENGTH = 60 * 5;

// the number of seconds past the minute
const seconds = () => (Date.now() / 1000) % 60;

// a function that maps seconds to a clap increment in the range (-10, 10)
const slope = a => Math.floor(10 * Math.sin((a / WAVELENGTH) * Math.PI * 2));

module.exports.fn = lambda(async (event, success) => {
  const sourceUrl = getSourceUrl(event);
  const claps = Number(event.body);

  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);
  assert(is.not.nan(claps), `Clap count was not a number`);

  const domain = sourceUrl.split("/")[0];

  const isWhiteListed = (process.env.WHITELIST_URLS || []).includes(domain);

  let clapIncrement = 0;
  if (isWhiteListed) {
    clapIncrement = clamp(claps, 1, 10);
  } else {
    // offset by 2 secs to allow for any latency
    clapIncrement = slope(claps + seconds() + 2);
  }

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
