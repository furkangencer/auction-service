import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getAuctionById = async (id) => {
  let auction;

  try {
    const result = await dynamodb.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
    }).promise();

    auction = result.Item;
  } catch (err) {
    console.error(err);
    throw new createHttpError.InternalServerError(err);
  }

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id}" not found!`);
  }

  return auction;
};

// eslint-disable-next-line no-unused-vars
const getAuction = async (event, context) => {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(getAuction);
