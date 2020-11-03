import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import cors from '@middy/http-cors';
import createHttpError from 'http-errors';
import { getAuctionById } from './getAuction';
import uploadPictureToS3 from '../lib/uploadPictureToS3';
import setAuctionPictureUrl from '../lib/setAuctionPictureUrl';
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema';

export const uploadAuctionPicture = async (event) => {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // Validate auction ownership
  if (auction.seller !== email) {
    throw new createHttpError.Forbidden('You are not the seller of this auction!');
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  let updatedAuction;
  try {
    const pictureUrl = await uploadPictureToS3(`${auction.id}.jpg`, buffer);
    console.log(pictureUrl);
    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
  } catch (err) {
    console.error(err);
    throw new createHttpError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(validator({
    inputSchema: uploadAuctionPictureSchema,
  }))
  .use(cors());
