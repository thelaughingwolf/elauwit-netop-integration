const perform = async (z, bundle) => {
  const baseUrl =
    bundle.authData.env === 'production' ? 'netopcld.net' : 'net-bot.com';

  const getRecord = (id, debug = false) => {
    const options = {
      url: `https://${baseUrl}/1.0/ext/tenants/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', // Required, incorrectly
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.id_token}`,
      },
    };

    if (debug) {
      return new Promise((resolve, reject) => {
        resolve(options);
      });
    }

    return z
      .request(options)
      .then((response) => {
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
      })
      .then((response) => {
        if (response) {
          // Any post-processing here
        }

        return response;
      });
  };

  const getRecordWithAction = (id, action, actionResponse) => {
    if (action === 'PUT') {
      action = 'update';
    } else if (action === 'POST') {
      action = 'create';
    }

    if (action !== 'update' && action !== 'create') {
      throw new Error(`Unrecognized action '${action}'`);
    }

    return getRecord(id).then((record) => {
      const result = {
        record,
        action,
      };

      if (actionResponse) {
        result.actionResponse = actionResponse;
      }

      return result;
    });
  };

  const actionOptions = {
    url: `https://${baseUrl}/1.0/ext/tenants/`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.id_token}`,
    },
    body: {
      sourceSystem: bundle.inputData.sourceSystem,
      externalSystemId: bundle.inputData.externalSystemId,
      name: bundle.inputData.name,
      orgId: bundle.inputData.orgId,
      additionalProperties: bundle.inputData.additionalProperties,
      priority: bundle.inputData.priority,
    },
  };

  if (!actionOptions.body.additional_properties) {
    actionOptions.body.additional_properties = {};
  }

  return getRecord(bundle.inputData.externalSystemId)
    .then((existingRecord) => {
      // The NetOp API returns a 403 if the record doesn't exist
      if (existingRecord) {
        actionOptions.method = 'PUT';

        for (let key in existingRecord) {
          if (actionOptions.body[key] === '' && existingRecord[key] !== '') {
            actionOptions.body[key] = existingRecord[key];
          } else if (actionOptions.body[key] === ' ') {
            actionOptions.body[key] = '';
          }
        }
      } else {
        actionOptions.method = 'POST';
      }

      // return actionOptions;

      // You can do any parsing you need for results here before returning them

      return z.request(actionOptions);
    })
    .then((actionResponse) => {
      //return actionResponse;

      actionResponse.throwForStatus();

      //return actionResponse.json;

      // The response from GET is different from the response to PUT or POST
      return getRecordWithAction(
        actionResponse.json.externalSystemId,
        actionOptions.method
      );
      // return getRecordWithAction(actionResponse.json.externalSystemId, actionOptions.method, actionResponse.json);
    });
};

module.exports = {
  operation: {
    perform: perform,
    inputFields: [
      {
        key: 'sourceSystem',
        label: 'External System',
        type: 'string',
        helpText:
          'Key to identify which external system this record comes from. Informational only, no programmatic or database key purpose.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'externalSystemId',
        label: 'External ID',
        type: 'string',
        helpText: 'Provide the ID used by the external system.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'orgId',
        label: 'External Organization ID',
        type: 'string',
        helpText: 'Provide the organization ID used by the external system.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        helpText: "Provide the external record's name.",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'lineOfBusiness',
        label: 'Line of Business',
        type: 'string',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'string',
        choices: ['Low', 'Medium', 'High'],
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'additionalProperties',
        label: 'Additional Properties',
        helpText: 'Provide any additional properties here.',
        dict: true,
        required: false,
        altersDynamicFields: false,
      },
    ],
    sample: {
      record: {
        id: 2,
        organization: 27,
        name: 'Example Tenant',
        externalId: 'test-tenant-1',
        lineOfBusiness: null,
        priority: 'Low',
        externalSystemId: 'test-tenant-1',
        sourceSystem: 'Zapier Testing',
        additionalProperties: null,
        createdAt: '2021-08-03T15:58:45.361Z',
      },
      action: 'update',
    },
    outputFields: [
      { key: 'record__id', label: 'NetOp ID', type: 'integer' },
      {
        key: 'record__organization',
        label: 'NetOp ID of Parent Organization',
        type: 'integer',
      },
      { key: 'record__name', label: 'Name' },
      { key: 'record__lineOfBusiness', label: 'Line of Business' },
      { key: 'record__priority', label: 'Priority' },
      { key: 'record__externalSystemId', label: 'ID in External System' },
      { key: 'record__sourceSystem', label: 'Name of External System' },
      {
        key: 'record__createdAt',
        type: 'datetime',
        label: 'Date & Time of Record Creation',
      },
      { key: 'action', label: 'Action Matched' },
    ],
  },
  key: 'create_update_external_tenant',
  noun: 'External Tenant',
  display: {
    label: 'Create or Update External Tenant',
    description:
      'Updates a tenant via external API, or creates it if not found',
    hidden: false,
    important: true,
  },
};
