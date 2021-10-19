const authentication = require('./authentication');
const createOrganizationCreate = require('./creates/create_organization.js');
const updateOrganizationCreate = require('./creates/update_organization.js');
const createUpdateExternalOrganizationCreate = require('./creates/create_update_external_organization.js');
const createUpdateExternalTenantCreate = require('./creates/create_update_external_tenant.js');
const findExternalOrganizationSearch = require('./searches/find_external_organization.js');
const findExternalTenantSearch = require('./searches/find_external_tenant.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  creates: {
    [createOrganizationCreate.key]: createOrganizationCreate,
    [updateOrganizationCreate.key]: updateOrganizationCreate,
    [createUpdateExternalOrganizationCreate.key]:
      createUpdateExternalOrganizationCreate,
    [createUpdateExternalTenantCreate.key]: createUpdateExternalTenantCreate,
  },
  searches: {
    [findExternalOrganizationSearch.key]: findExternalOrganizationSearch,
    [findExternalTenantSearch.key]: findExternalTenantSearch,
  },
  searchOrCreates: {
    find_external_organization: {
      key: 'find_external_organization',
      display: {
        label: 'Find or Create External Organization',
        description: 'Retrieves an Organization by External ID',
      },
      search: 'find_external_organization',
      create: 'create_organization',
    },
    find_external_tenant: {
      key: 'find_external_tenant',
      display: {
        label: 'Find or Create External Tenant',
        description: 'Retrieves a Tenant by External ID',
      },
      search: 'find_external_tenant',
      create: 'create_update_external_tenant',
    },
  },
};
