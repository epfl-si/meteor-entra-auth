import Entra from './namespace.js';
import { Accounts } from 'meteor/accounts-base';


Entra.whitelistedFields = [
  //'@odata.context',  // this value needs some parsing before including.
                       // is 'https://graph.microsoft.com/v1.0/$metadata#users/$entity'
  'businessPhones',  // array
  'displayName',
  'givenName',
  'jobTitle',
  'mail',
  'mobilePhone',  // personally, null
  'officeLocation',
  'preferredLanguage',  // personally, null
  'surname',
  'userPrincipalName',  // personally, looks like the same value as 'mail'
  'id',  // GUID
];

const getServiceDataFromTokens = async (tokens) => {
  const { accessToken } = tokens;
  let scopes;
  let identity;

  try {
    scopes = await getScopes(accessToken);
  } catch (err) {
    throw {
      ...new Error(`Failed to fetch tokeninfo from Entra. ${err.message}`),
      response: err.response,
    };
  }


  try {
    identity = await getIdentity(accessToken);
  } catch (err) {
    throw {
      ...new Error(`Failed to fetch identity from Entra. ${err.message}`),
      response: err.response,
    };
  }

  const serviceData = {
    accessToken,
    scope: scopes,
    expiresAt: tokens?.expiresIn ? Date.now() + 1000 * parseInt(tokens.expiresIn, 10) : null,
    // Keep only whitelisted fields and values with a value
    ...Object.fromEntries(
      Object.entries(identity).filter( ( [ key, value ] ) => Entra.whitelistedFields.includes(key) && value )
    ),
    // only set the token in serviceData if it's there. this ensures
    // that we don't lose old ones (since we only get this on the first
    // log in attempt)
    ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
  };

  return { serviceData };
};

Accounts.registerLoginHandler(async (request) => {
  if (request.EntraSignIn !== true) {
    return;
  }

  const result = await OAuth.retrieveCredential(
    request.credentialToken,
    request.credentialSecret
  );

  if (!result) {
    return {
      type: "EntraSignIn",
      error: new Meteor.Error(
        Accounts.LoginCancelledError.numericError,
        "No matching login attempt found"
      ),
    };
  }

  if (result instanceof Error) {
    throw result;
  }

  return Accounts.updateOrCreateUserFromExternalService(
    'entra',
    result.serviceData,
    result.options,
  );
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
const getTokens = async (query) => {
  const config = await ServiceConfiguration.configurations.findOneAsync({
    service: 'entra',
  });

  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }

  const content = new URLSearchParams({
    code: query.code,
    client_id: config.clientId,
    client_secret: OAuth.openSecret(config.secret),
    redirect_uri: OAuth._redirectUri('entra', config),
    grant_type: 'authorization_code',
  });

  const request = await OAuth._fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, 'POST', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: content,
  });

  const response = await request.json();

  if (response.error) {
    throw new Meteor.Error(
      `Failed to complete OAuth handshake with Entra. ${response.error}`
    );
  }

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
  };
};

const refreshAccessToken = async (props) => {
  const { accessToken, refreshToken } = props;

  const config = await ServiceConfiguration.configurations.findOneAsync({
    service: 'entra',
  });

  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }

  const content = new URLSearchParams({
    client_id: config.clientId,
    client_secret: OAuth.openSecret(config.secret),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: 'https://graph.microsoft.com/.default'
  });
  const request = await OAuth._fetch(
    `https://login.microsoftonline.com/${ config.tenantId }/oauth2/v2.0/token`,
    'POST',
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: content,
    });

  const response = await request.json();

  if (response.error) {
    throw new Meteor.Error(
      `Failed to complete OAuth handshake with Entra. ${response.error}`
    );
  }

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
  };
}

const getIdentity = async (accessToken) => {
  let response;

  try {
    const request = await OAuth._fetch(
      'https://graph.microsoft.com/v1.0/me',
      'GET',
      {
        headers: {
          Accept: 'application/json',
          Authorization: accessToken
        },
      }
    );

    response = await request.json();
  } catch (e) {
    throw new Meteor.Error(e.reason);
  }

  return response;
};

const getScopes = async (accessToken) => {
  let json;

  try {
    json = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
  } catch (err) {
    throw new Meteor.Error(err.reason);
  }

  return json.scp.split(' ');
};

const getServiceData = async (query) => getServiceDataFromTokens(await getTokens(query));
OAuth.registerService('entra', 2, null, getServiceData);

Entra.retrieveCredential = (credentialToken, credentialSecret) =>
  OAuth.retrieveCredential(credentialToken, credentialSecret);

//Entra.refreshAccessToken = async (props) => getServiceDataFromTokens(await refreshAccessToken(props));
