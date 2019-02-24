const lambda = require("./util/lambda");
const { getCostAttribution } = require("./util/attributeCosts");

module.exports.fn = lambda(async (_, success) => {
  const item = await getCostAttribution();
  let consumers = item.Items;
  // top 10 sorted by cost
  consumers.sort((i, j) => j.cost - i.cost);
  consumers = consumers.slice(0, 10);
  success(consumers);
});
