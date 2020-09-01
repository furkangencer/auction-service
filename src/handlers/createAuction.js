// eslint-disable-next-line no-unused-vars
const createAuction = async (event, context) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Hello World!',
    },
  ),
});
// eslint-disable-next-line import/prefer-default-export
export const handler = createAuction;
