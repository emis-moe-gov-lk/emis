const https = require('https');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config');

const clientOptions = {
  jwksUri: config.wso2.jwksUri,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: config.wso2.jwksCacheTtl * 1000,
};

// Skip TLS verification in development — dev IdP cert doesn't cover the subdomain
if (!config.isProduction) {
  clientOptions.requestAgent = new https.Agent({ rejectUnauthorized: false });
}

const client = jwksClient(clientOptions);

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

module.exports = function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authorization header is missing or invalid.' },
    });
  }

  const token = authHeader.slice(7);

  const verifyOptions = {
    issuer: config.wso2.issuer,
    algorithms: ['RS256'],
  };
  if (config.wso2.audience) {
    verifyOptions.audience = config.wso2.audience;
  }

  jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token validation failed.' },
      });
    }
    req.jwtPayload = decoded;
    req.bearerToken = token;
    next();
  });
};
