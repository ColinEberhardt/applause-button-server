const is = require("is_js");

// see: https://github.com/arasatasaygin/is.js/issues/154
const isurl = url => url.match(/^http:\/\/localhost:\d*\/?$/) || is.url(url);

const clamp = (value, lower, upper) => Math.max(lower, Math.min(value, upper));

const unique = items => Array.from(new Set(items));

const assert = (truth, message) => {
  if (!truth) {
    throw new Error(`assertion failure: ${message}`);
  }
};

const getSourceUrl = event => {
  const sourceUrl = event.headers && event.headers.Referer;
  if (!sourceUrl) {
    throw new Error("no referer specified");
  }
  return normalizeUrl(sourceUrl);
};

const normalizeUrl = url => {
  url = url.replace(/^https?:\/\//, "");
  const components = url.split("?");
  if (components.length > 1) {
    url = components[0];
  }
  return url;
};

module.exports = {
  isurl,
  clamp,
  assert,
  getSourceUrl,
  normalizeUrl,
  unique
};
