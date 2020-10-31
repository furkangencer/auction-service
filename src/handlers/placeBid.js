import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// eslint-disable-next-line no-unused-vars
const placeBid = async (event, context) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  // Bid identity validation
  if (auction.seller === email) {
    throw new createHttpError.Forbidden('You cannot bid on your own auctions!');
  }

  // Avoid double bidding
  if (auction.highestBid.bidder === email) {
    throw new createHttpError.Forbidden('You are already the highest bidder!');
  }

  // Auction status validation
  if (auction.status !== 'OPEN') {
    throw new createHttpError.Forbidden('Your cannot bid on closed auctions!');
  }

  // Bid amount validation
  if (amount <= auction.highestBid.amount) {
    throw new createHttpError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
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
export const handler = commonMiddleware(placeBid)
  .use(validator({
    inputSchema: placeBidSchema,
  }));
