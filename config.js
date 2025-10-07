/**
 * Get the current app config saved in DB or fail trying
 */
export const getConfig = async () => {
  const config = await ServiceConfiguration.configurations.findOneAsync({
    service: 'entra',
  });

  if (!config) {
    throw new ServiceConfiguration.ConfigError("No 'entra' service configured in your ServiceConfiguration table.");
  }

  if (!(
    config.clientId &&
    config.secret &&
    config.tenantId
  )) {
    throw new ServiceConfiguration.ConfigError(
      `The 'entra' service configured in your ServiceConfiguration table missed mandatory informations.}`
    );
  }

  return config;
}
