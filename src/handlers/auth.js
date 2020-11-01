import jwt from 'jsonwebtoken';

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, methodArn) => {
  const apiGatewayWildcard = `${methodArn.split('/', 2).join('/')}/*`;

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

// eslint-disable-next-line no-unused-vars,import/prefer-default-export
export async function handler(event, context) {
  if (!event.authorizationToken) {
    throw new Error('Unauthorized');
  }

  const token = event.authorizationToken.replace('Bearer ', '');

  try {
    const claims = await jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    const policy = await generatePolicy(claims.sub, event.methodArn);

    return {
      ...policy,
      context: claims,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Unauthorized');
  }
}
