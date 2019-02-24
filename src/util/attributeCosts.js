const TableName = "OpenService";
const AWS = require("aws-sdk");

const dynamoClient = new AWS.DynamoDB.DocumentClient();
AWS.config.setPromisesDependency(Promise);

const getCostAttribution = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date =
    yesterday.getFullYear() +
    "-" +
    yesterday.getMonth() +
    "-" +
    yesterday.getDate();

  return dynamoClient
    .scan({
      TableName,
      FilterExpression: "#yesterday = :yesterday",
      ExpressionAttributeValues: {
        ":yesterday": date
      },
      ExpressionAttributeNames: {
        "#yesterday": "date"
      }
    })
    .promise();
};

const attributeCosts = async (consumer, cost) => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();

  const currentRecord = await dynamoClient
    .get({
      TableName,
      Key: {
        date,
        consumer
      }
    })
    .promise();

  if (currentRecord.Item) {
    await dynamoClient
      .update({
        TableName,
        Key: {
          date,
          consumer
        },
        UpdateExpression: "SET cost = cost + :inc",
        ExpressionAttributeValues: {
          ":inc": cost
        }
      })
      .promise();
  } else {
    await dynamoClient
      .put({
        TableName,
        Item: {
          date,
          consumer,
          cost
        }
      })
      .promise();
  }
};

module.exports = {
  attributeCosts,
  getCostAttribution
};
