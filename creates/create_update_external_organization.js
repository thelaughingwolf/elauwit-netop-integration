const perform = async (z, bundle) => {
  const baseUrl =
    bundle.authData.env === 'production' ? 'netopcld.net' : 'net-bot.com';

  const getRecord = (id) => {
    const options = {
      url: `https://${baseUrl}/1.0/ext/organizations/${id}`,
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

  const getRecordWithAction = (id, action) => {
    if (action === 'PUT') {
      action = 'update';
    } else if (action === 'POST') {
      action = 'create';
    }

    if (action !== 'update' && action !== 'create') {
      throw new Error(`Unrecognized action '${action}'`);
    }

    return getRecord(id).then((record) => {
      return {
        record,
        action,
      };
    });
  };

  const actionOptions = {
    url: `https://${baseUrl}/1.0/ext/organizations/${bundle.inputData.propertyType}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.id_token}`,
    },
    body: {
      parentId: bundle.inputData.parentId,
      address: bundle.inputData.address,
      name: bundle.inputData.name,
      sourceSystem: bundle.inputData.sourceSystem,
      externalSystemId: bundle.inputData.externalSystemId,
      additional_properties: bundle.inputData.additional_properties,
      type: bundle.inputData.propertyType,
      tags: bundle.inputData.tags,
    },
  };

  if (!actionOptions.body.additional_properties) {
    actionOptions.body.additional_properties = {};
  }
  actionOptions.body.additional_properties.property_type =
    bundle.inputData.propertyType;

  if (!actionOptions.body.address) {
    actionOptions.body.address = {};
  }

  if (!actionOptions.body.parentId) {
    actionOptions.body.parentId = -1;
  }

  return getRecord(bundle.inputData.externalSystemId)
    .then((existingRecord) => {
      // The NetOp API returns a 403 if the record doesn't exist
      if (existingRecord) {
        actionOptions.method = 'PUT';

        if (existingRecord.address) {
          for (let key in existingRecord.address) {
            if (!actionOptions.body.address[key]) {
              actionOptions.body.address[key] = existingRecord.address[key];
            } else if (actionOptions.body.address[key] === ' ') {
              actionOptions.body.address[key] = '';
            }
          }
        }

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

      //return actionOptions;

      // You can do any parsing you need for results here before returning them

      return z.request(actionOptions);
    })
    .then((actionResponse) => {
      //return actionResponse;

      actionResponse.throwForStatus();

      //return actionResponse.json;

      // The response from GET is different from the response to PUT or POST
      return getRecordWithAction(
        actionResponse.json.externalId,
        actionOptions.method
      );
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
        key: 'propertyType',
        label: 'Type',
        type: 'string',
        choices: ['PropertyOwner', 'PropertyLocation'],
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
        key: 'parentId',
        label: 'Parent ID',
        type: 'string',
        helpText:
          'Provide the external ID of the parent organization. If null, assign the parent ID based on user org authorities. If the user has more than one, take the first one.',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'string',
        helpText: 'Tags for informational use.',
        required: false,
        list: true,
        altersDynamicFields: false,
      },
      {
        key: 'additionalProperties',
        label: 'Additional Properties',
        type: 'string',
        helpText:
          'Provide any additional properties here. Note that whatever Property Type you provide will automatically be added to this list as "property_type".',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'address',
        children: [
          {
            key: 'addressLine1',
            label: 'Line 1',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'addressLine2',
            label: 'Line 2',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'city',
            label: 'City',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'state',
            label: 'State',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'zipcode',
            label: 'Zipcode',
            type: 'string',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'country',
            label: 'Country',
            type: 'string',
            helpText: 'Valid Alpha-2 country code',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'lat',
            label: 'Latitude',
            type: 'number',
            helpText: '-90 to 90, inclusive',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
          {
            key: 'lon',
            label: 'Longitude',
            type: 'number',
            helpText: '-180 to 180, inclusive',
            required: false,
            list: false,
            altersDynamicFields: false,
          },
        ],
        label: 'Address',
        required: false,
        altersDynamicFields: false,
      },
    ],
    sample: {
      record: {
        id: 2,
        name: 'Example Organization',
        parentOrg: 1,
        settings: null,
        address: {
          addressLine1: null,
          addressLine2: null,
          lat: null,
          lon: null,
          city: null,
          state: null,
          zipcode: null,
          country: null,
        },
        source_system: 'Zapier Testing',
        additional_properties: { property_type: 'PropertyLocation' },
        tags: null,
        hierarchy: '1,2',
        tenants: [],
        externalId: 'test-id-14',
      },
      action: 'create',
    },
    outputFields: [
      { key: 'record__id', label: 'NetOp ID', type: 'integer' },
      { key: 'record__name', label: 'Name' },
      {
        key: 'record__parentOrg',
        label: 'NetOp ID of Parent Organization',
        type: 'integer',
      },
      { key: 'record__address__addressLine1', label: 'Street Address' },
      { key: 'record__address__addressLine2', label: 'Suite/Unit' },
      { key: 'record__address__lat', label: 'Latitude', type: 'number' },
      { key: 'record__address__lon', label: 'Longitude', type: 'number' },
      { key: 'record__address__city', label: 'City' },
      { key: 'record__address__state', label: 'State' },
      { key: 'record__address__zipcode', label: 'Zip' },
      { key: 'record__address__country', label: 'Country Code' },
      { key: 'record__source_system', label: 'Name of External System' },
      {
        key: 'record__additional_properties__property_type',
        label: 'Property Type',
      },
      { key: 'record__tags', label: 'Tags List' },
      { key: 'record__hierarchy', label: 'Autogenerated NetOp Hierarchy' },
      { key: 'record__externalId', label: 'ID in External System' },
      { key: 'action', label: 'Action Matched' },
    ],
  },
  key: 'create_update_external_organization',
  noun: 'External Organization',
  display: {
    label: 'Create or Update External Organization',
    description:
      'Updates an organization via external API, or creates it if not found',
    hidden: false,
    important: true,
  },
};
