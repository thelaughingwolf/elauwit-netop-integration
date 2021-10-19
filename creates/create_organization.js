const perform = async (z, bundle) => {
  const baseUrl =
    bundle.authData.env === 'production' ? 'netopcld.net' : 'net-bot.com';

  const options = {
    url: `https://${baseUrl}/1.0/ext/organizations/${bundle.inputData.propertyType}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.id_token}`,
    },
    params: {},
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

  if (!options.body.additional_properties) {
    options.body.additional_properties = {};
  }
  options.body.additional_properties.property_type =
    bundle.inputData.propertyType;

  if (!options.body.address) {
    options.body.address = {};
  }

  if (!options.body.parentId) {
    options.body.parentId = -1;
  }

  return z.request(options).then((response) => {
    response.throwForStatus();
    const results = response.json;

    // You can do any parsing you need for results here before returning them

    return results;
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
        helpText: 'External record name.',
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
        helpText: 'Tags for information use.',
        required: false,
        list: true,
        altersDynamicFields: false,
      },
      {
        key: 'additionalProperties',
        label: 'Additional Properties',
        dict: true,
        required: false,
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
    outputFields: [
      { key: 'id', label: 'Organization ID' },
      { key: 'name', label: 'Name' },
      { key: 'parentOrg', label: 'Parent Organization ID' },
      { key: 'settings', label: 'Settings Map' },
      { key: 'address__addressLine1', label: 'Street Line 1' },
      { key: 'address__addressLine2', label: 'Street Line 2' },
      { key: 'address__lat', label: 'Latitude', type: 'number' },
      { key: 'address__lon', label: 'Longitude', type: 'number' },
      { key: 'address__city', label: 'City' },
      { key: 'address__state', label: 'State' },
      { key: 'address__zipcode', label: 'Zipcode' },
      { key: 'address__country', label: 'Country Code' },
      { key: 'source_system', label: 'External System Name' },
      { key: 'additional_properties__property_type', label: 'Property Type' },
      { key: 'tags', label: 'Tags List' },
      { key: 'hierarchy', label: 'Autogenerated Hierarchy' },
      { key: 'externalId', label: 'External System Organization ID' },
    ],
  },
  key: 'create_organization',
  noun: 'External Organization',
  display: {
    label: 'Create External Organization',
    description: 'Creates a new organization via the external API',
    hidden: false,
    important: true,
  },
};
