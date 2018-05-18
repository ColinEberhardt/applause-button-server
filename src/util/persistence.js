const TABLE = "Applause";
const AWS = require("aws-sdk");

const dynamoClient = new AWS.DynamoDB.DocumentClient();
AWS.config.setPromisesDependency(Promise);

const getItem = url =>
  dynamoClient
    .get({
      TableName: TABLE,
      Key: {
        url
      }
    })
    .promise();

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

const incrementClaps = (url, claps) =>
  dynamoClient
    .update({
      TableName: TABLE,
      Key: {
        url
      },
      UpdateExpression: "SET claps = claps + :inc",
      ExpressionAttributeValues: {
        ":inc": claps
      }
    })
    .promise();

const getItems = urls =>
  dynamoClient
    .batchGet({
      RequestItems: {
        [TABLE]: {
          Keys: urls.map(url => ({
            url
          }))
        }
      }
    })
    .promise();

module.exports = {
  getItem,
  getItems,
  incrementClaps,
  putItem
};
