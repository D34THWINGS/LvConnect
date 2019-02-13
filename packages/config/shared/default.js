const HR = 'hr';
const BOARD = 'board';
const TECH = 'tech';
const BUSINESS = 'business';
const COMMUNICATION = 'com';
const FINANCE = 'finance';
const PROJECT_MANAGER = 'projectManager';

module.exports = {
  roles: {
    BOARD,
    HR,
    TECH,
    BUSINESS,
    COMMUNICATION,
    FINANCE,
    PROJECT_MANAGER,
  },
  cities: [
    'Lyon',
    'Lille',
    'Paris',
  ],
  permissions: {
    addUser: [HR, BOARD],
    editUser: [HR, BOARD],
    deleteUser: [HR, BOARD],
    addApp: [TECH, BOARD],
    editApp: [TECH, BOARD],
    deleteApp: [TECH, BOARD],
    addHook: [TECH, BOARD],
    editHook: [TECH, BOARD],
    deleteHook: [TECH, BOARD],
  },
  jobs: ['front', 'back', 'fullStack', 'designer', 'data', 'devOps', 'projectManager', 'mobile', 'marketing'],
  oauth: {
    scopes: [
      'users:get',
      'users:create',
      'users:delete',
      'users:modify',
      'profile:get',
      'profile:modify',
    ],
    privateScopes: [
      'apps:get',
      'apps:create',
      'apps:delete',
      'apps:modify',
      'hooks:get',
      'hooks:create',
      'hooks:delete',
      'hooks:modify',
    ],
  },
  hooks: {
    events: {
      userCreated: 'user:created',
      userModified: 'user:modified',
      userDeleted: 'user:deleted',
    },
    statuses: {
      success: 'success',
      failure: 'failure',
    },
  },
};
