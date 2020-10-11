import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

const closeAuction = async (auction) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  return dynamodb.update(params).promise();
};

export default closeAuction;
