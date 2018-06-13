const is = require("is_js");
const lambda = require("./util/lambda");
const fetch = require("node-fetch");

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

module.exports.fn = lambda(async (event, success) => {
  console.log(`Received ${event.Records.length} records.`);

  await asyncForEach(event.Records, async record => {
    try {
      const clapUrl = record.dynamodb.Keys.url.S;
      const user = clapUrl.split("/")[0];

      const claps = record.dynamodb.OldImage
        ? Number(record.dynamodb.NewImage.claps.N) -
          Number(record.dynamodb.OldImage.claps.N)
        : Number(record.dynamodb.NewImage.claps.N);

      const body = {
        clapUrl,
        claps
      };

      const webhookUrls = JSON.parse(process.env.WEBHOOK_URLS).filter(
        hook => hook.user === user
      );

      await Promise.all(
        webhookUrls.map(webhook => {
          console.log(
            `sending payload ${JSON.stringify(body)} to ${webhook.url}`
          );
          return fetch(webhook.url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
          }).then(a =>
            console.log(
              `payload ${JSON.stringify(body)} sent to ${webhook.url}`
            )
          );
        })
      );
    } catch (e) {
      console.error(e.toString(), e.stack);
    }
  });

  success();
});
