const TableName = "OpenService";
const AWS = require("aws-sdk");

const dynamoClient = new AWS.DynamoDB.DocumentClient();
AWS.config.setPromisesDependency(Promise);

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
  attributeCosts
};
