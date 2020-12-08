module.exports = app => {
  const routes = [
    // role
    { method: 'post', path: 'role/children', controller: 'role',
      meta: { right: { type: 'resource,atom', name: 'role', action: 25 } },
    },
    { method: 'post', path: 'role/item', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/save', controller: 'role', middlewares: 'validate',
      meta: { validate: { validator: 'role' }, right: { type: 'resource', name: 'role' } },
    },
    { method: 'post', path: 'role/add', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/move', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/delete', controller: 'role', middlewares: 'transaction', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/includes', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/addRoleInc', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/removeRoleInc', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/dirty', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    { method: 'post', path: 'role/build', controller: 'role', meta: { right: { type: 'resource', name: 'role' } } },
    // user
    { method: 'post', path: 'user/list', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/item', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/disable', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/delete', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/roles', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/addRole', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/removeRole', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    { method: 'post', path: 'user/atomRights', controller: 'user', meta: { right: { type: 'resource', name: 'user' } } },
    // atomRight
    { method: 'post', path: 'atomRight/rights', controller: 'atomRight', meta: { right: { type: 'resource', name: 'atomRight' } } },
    { method: 'post', path: 'atomRight/add', controller: 'atomRight', meta: { right: { type: 'resource', name: 'atomRight' } } },
    { method: 'post', path: 'atomRight/delete', controller: 'atomRight', meta: { right: { type: 'resource', name: 'atomRight' } } },
    { method: 'post', path: 'atomRight/spreads', controller: 'atomRight', meta: { right: { type: 'resource', name: 'atomRight' } } },
    // functionRight
    { method: 'post', path: 'functionRight/rights', controller: 'functionRight', meta: { right: { type: 'resource', name: 'functionRight' } } },
    { method: 'post', path: 'functionRight/add', controller: 'functionRight', meta: { right: { type: 'resource', name: 'functionRight' } } },
    { method: 'post', path: 'functionRight/delete', controller: 'functionRight', meta: { right: { type: 'resource', name: 'functionRight' } } },
    { method: 'post', path: 'functionRight/spreads', controller: 'functionRight', meta: { right: { type: 'resource', name: 'functionRight' } } },
    // auth
    { method: 'post', path: 'auth/list', controller: 'auth', meta: { right: { type: 'resource', name: 'auth' } } },
    { method: 'post', path: 'auth/disable', controller: 'auth', meta: { right: { type: 'resource', name: 'auth' } } },
    { method: 'post', path: 'auth/item', controller: 'auth', meta: { right: { type: 'resource', name: 'auth' } } },
    { method: 'post', path: 'auth/save', controller: 'auth', meta: { right: { type: 'resource', name: 'auth' } } },
  ];
  return routes;
};
