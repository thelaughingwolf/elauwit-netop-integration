const perform = async (z, bundle) => {
  const baseUrl =
    bundle.authData.env === 'production' ? 'netopcld.net' : 'net-bot.com';

  const getRecord = (id) => {
    const options = {
      url: `https://${baseUrl}/1.0/ext/tenants/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', // Required, incorrectly
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.id_token}`,
      },
    };

    return z.request(options).then((response) => {
      if (response.status === 403) {
        // No record exists - return null
        return null;
      } else if (response.status === 200) {
        // Record exists - return it
        return response.json;
      } else {
        // Other error - throw for calling code;
        response.throwForStatus();
        throw new Error(`Unrecognized response ${response.status}`);
      }
    });
  };

  return getRecord(bundle.inputData.externalSystemId).then((existingRecord) => {
    const results = [];

    if (existingRecord) {
      results.push(existingRecord);
    }

    return results;
  });
};

module.exports = {
  operation: {
    perform: perform,
    inputFields: [
      {
        key: 'externalSystemId',
        label: 'External ID',
        type: 'string',
        helpText: 'Provide the ID used by the external system.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
  },
  key: 'find_external_tenant',
  noun: 'External Tenant',
  display: {
    label: 'Find Tenant by External System ID',
    description: 'Retrieves a Tenant by External ID',
    hidden: false,
    important: true,
  },
};
