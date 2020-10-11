import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getEndedAuctions = async () => {
  const now = new Date();
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    // Hashtag(#) is only needed when we have reserved words in our query. 'status' is one of them.
    // We can't just type 'status' in our query. Upon runtime of this query, '#status' will be replaced with 'status'.
    // See ExpressionAttributeNames below.
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
};

export default getEndedAuctions;
