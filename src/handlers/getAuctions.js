import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import getAuctionsSchema from '../lib/schemas/getAuctionSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// eslint-disable-next-line no-unused-vars
const getAuctions = async (event, context) => {
  const { status } = event.queryStringParameters;
  let auctions;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (err) {
    console.error(err);
    throw new createHttpError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};
// eslint-disable-next-line import/prefer-default-export
export const handler = commonMiddleware(getAuctions)
  .use(validator({
    inputSchema: getAuctionsSchema,
    useDefaults: true,
  }));
