/*
 Based on https://github.com/ColinEberhardt/applause-button-server/issues/2

 The URL format has been modified to remove http / https and any querystring parameters. This
 migration script selects all existing items and creates new ones with normalised URLs
*/
const TABLE = "Applause";
const AWS = require("aws-sdk");
const { normalizeUrl } = require("../src/util/util");

const dynamoClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
AWS.config.setPromisesDependency(Promise);

const getAllItems = () =>
  dynamoClient
    .scan({
      TableName: TABLE
    })
    .promise()
    .then(result => result.Items);

const putItem = (url, claps) =>
  dynamoClient
    .put({
      TableName: TABLE,
      Item: {
        url,
        claps
      }
    })
    .promise();

const run = async () => {
  const items = await getAllItems();
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const normalized = normalizeUrl(normalizeUrl(item.url));
    console.log(index, normalized, item.claps);
    await putItem(normalized, item.claps);
  }
};

run();
