import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// eslint-disable-next-line no-unused-vars
const createAuction = async (event, context) => {
  const { title } = JSON.parse(event.body);
  const auction = {
    id: uuidv4(),
    title,
    status: 'OPEN',
    createdAt: (new Date()).toISOString(),
  };

  await dynamodb.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};
// eslint-disable-next-line import/prefer-default-export
export const handler = createAuction;
