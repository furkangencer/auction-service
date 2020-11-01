import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

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

  await dynamodb.update(params).promise();
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    return sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'No one was interested in your item!',
        recipient: seller,
        body: `Unfortunately no bid was placed on your item "${title}".`,
      }),
    }).promise();
  }

  const notifySeller = sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'Your item has been sold!',
      recipient: seller,
      body: `Congratulations! Your item "${title}" has been sold for $${amount}.`,
    }),
  }).promise();

  const notifyBidder = sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: 'You won an auction!',
      recipient: bidder,
      body: `Congratulations! Your bid was the highest throughout the auction and now "${title}" is yours for $${amount}.`,
    }),
  }).promise();

  return Promise.all([
    notifySeller,
    notifyBidder,
  ]);
};

export default closeAuction;
