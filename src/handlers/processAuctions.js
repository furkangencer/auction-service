import createHttpError from 'http-errors';
import getEndedAuctions from '../lib/getEndedAuctions';
import closeAuction from '../lib/closeAuction';

const processAuctions = async () => {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) => closeAuction(auction));
    await Promise.all(closePromises);
    return {
      closed: closePromises.length,
    };
  } catch (err) {
    console.error(err);
    throw new createHttpError.InternalServerError(err);
  }
};
// eslint-disable-next-line import/prefer-default-export
export const handler = processAuctions;
