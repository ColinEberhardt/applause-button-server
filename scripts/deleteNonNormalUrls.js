/*
 Based on https://github.com/ColinEberhardt/applause-button-server/issues/2

 The URL format has been modified to remove http / https and any querystring parameters. This
 migration script removes all non normal URLs
*/
const TABLE = "Applause";
const AWS = require("aws-sdk");
const { normalizeUrl } = require("../src/util/util");

const dynamoClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
AWS.config.setPromisesDependency(Promise);

const getAllItems = () =>
  dynamoClient
    .scan({
      TableName: TABLE,
      FilterExpression: "contains(#url, :t)",
      ExpressionAttributeNames: {
        "#url": "url",
      },
      ExpressionAttributeValues: {
          ":t": "http"
      }
    })
    .promise()
    .then(result => result.Items);

const deleteItem = (url) =>
  dynamoClient
    .delete({
      TableName: TABLE,
      Key: {
        url
      }
    })
    .promise();

const run = async () => {
  const items = await getAllItems();
  console.log(items.length);
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    console.log(item);
    await deleteItem(item.url);
  }
};

run();
