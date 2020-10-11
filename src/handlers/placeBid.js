import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// eslint-disable-next-line no-unused-vars
const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if (auction.status !== 'OPEN') {
    throw new createHttpError.Forbidden('Your cannot bid on closed auctions!');
  }

  if (amount <= auction.highestBid.amount) {
    throw new createHttpError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (err) {
    console.error(err);
    throw new createHttpError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};
// eslint-disable-next-line import/prefer-default-export
export const handler = commonMiddleware(placeBid);
