## Use
See https://github.com/epfl-si/meteor-account-entra

## Things to better know

- Entra only allows http as Redirect URIs URL. Better put a way to redirect https to http in front of your Meteor app.

## References
- https://atmospherejs.com/telnowedge/microsoft-entra-oauth
- https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
- https://my-token.epfl.ch/home
- https://login.microsoftonline.com/ + TenantId + /v2.0/.well-known/openid-configuration
