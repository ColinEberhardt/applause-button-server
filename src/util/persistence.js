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

const putItem = (url, claps, sourceIp) =>
  dynamoClient
    .put({
      TableName: TABLE,
      Item: {
        url,
        claps,
        sourceIp
      }
    })
    .promise();

const incrementClaps = (url, claps, sourceIp) =>
  dynamoClient
    .update({
      TableName: TABLE,
      Key: {
        url
      },
      UpdateExpression: "SET claps = claps + :inc, sourceIp = :ip",
      ExpressionAttributeValues: {
        ":inc": claps,
        ":ip": sourceIp
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
    .promise()
    .then(result => result.Responses.Applause);

module.exports = {
  getItem,
  getItems,
  incrementClaps,
  putItem
};
