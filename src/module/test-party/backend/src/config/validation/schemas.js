module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const schemas = {};
  // party
  schemas.party = {
    type: 'object',
    properties: {
      atomName: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Party Name',
        notEmpty: true,
      },
      personCount: {
        type: 'number',
        ebType: 'text',
        ebTitle: 'Person Count',
        minimum: 1,
        notEmpty: true,
      },
      partyTypeId: {
        type: 'number',
        ebType: 'select',
        ebTitle: 'Party Type',
        ebOptionsUrl: '/test/party/party/types',
        ebOptionTitleKey: 'name',
        ebOptionValueKey: 'id',
        ebOptionsBlankAuto: true,
        notEmpty: true,
      },
      atomLanguage: {
        type: 'string',
        ebType: 'language',
        ebTitle: 'Language',
      },
      atomCategoryId: {
        type: 'number',
        ebType: 'category',
        ebTitle: 'Category',
      },
      atomTags: {
        type: [ 'string', 'null' ],
        ebType: 'tag',
        ebTitle: 'Tags',
      },
    },
  };
  // party search
  schemas.partySearch = {
    type: 'object',
    properties: {
      partyTypeId: {
        type: 'number',
        ebType: 'select',
        ebTitle: 'Party Type',
        ebOptionsUrl: '/test/party/party/types',
        ebOptionTitleKey: 'name',
        ebOptionValueKey: 'id',
        ebOptionsBlankAuto: true,
      },
    },
  };

  // settings
  schemas.settingsUser = {
    type: 'object',
    properties: {
      groupInfo: {
        type: 'object',
        ebType: 'group',
        ebTitle: 'Info Group',
        properties: {
          username: {
            type: 'string',
            ebType: 'text',
            ebTitle: 'My Name',
            notEmpty: true,
          },
        },
      },
      groupExtra: {
        type: 'object',
        ebType: 'group',
        ebTitle: 'Extra Group',
        properties: {
          panelExtra: {
            ebType: 'panel',
            ebTitle: 'Extra',
            $ref: 'settingsUserExtra',
          },
        },
      },
    },
  };
  schemas.settingsUserExtra = {
    type: 'object',
    ebTitle: 'Extra',
    properties: {
      groupInfo: {
        type: 'object',
        ebType: 'group',
        ebTitle: 'Info Group',
        ebGroupWhole: true,
        properties: {
          mobile: {
            type: 'string',
            ebType: 'text',
            ebTitle: 'Mobile',
            notEmpty: true,
          },
          sex: {
            type: 'number',
            ebType: 'select',
            ebTitle: 'Sex',
            ebMultiple: false,
            ebOptions: [
              { title: 'Male', value: 1 },
              { title: 'Female', value: 2 },
            ],
            ebParams: {
              openIn: 'page',
              closeOnSelect: true,
            },
            notEmpty: true,
          },
          language: {
            type: 'string',
            ebType: 'select',
            ebTitle: 'Language',
            ebOptionsUrl: '/a/base/base/locales',
            ebOptionsUrlParams: null,
            'x-languages': true,
            notEmpty: true,
          },
        },
      },
    },
  };
  schemas.settingsInstance = {
    type: 'object',
    properties: {
      groupInfo: {
        type: 'object',
        ebType: 'group',
        ebTitle: 'Info Group',
        properties: {
          slogan: {
            type: 'string',
            ebType: 'text',
            ebTitle: 'Slogan',
            notEmpty: true,
          },
        },
      },
    },
  };
  schemas.formTest = {
    type: 'object',
    properties: {
      groupInfo: {
        type: 'null',
        ebType: 'group-flatten',
        ebTitle: 'Info Group',
      },
      userName: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Username',
        ebDescription: 'Your Name',
        ebHelp: 'Please type your name',
        notEmpty: true,
      },
      password: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Password',
        ebSecure: true,
        notEmpty: true,
        minLength: 6,
      },
      passwordAgain: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Password Again',
        ebSecure: true,
        notEmpty: true,
        const: { $data: '1/password' },
      },
      sex: {
        type: 'number',
        ebType: 'select',
        ebTitle: 'Sex',
        ebMultiple: false,
        ebOptions: [
          { title: 'Male', value: 1 },
          { title: 'Female', value: 2 },
        ],
        ebOptionsBlankAuto: true,
        ebParams: {
          openIn: 'sheet',
          closeOnSelect: true,
        },
        notEmpty: true,
      },
      rememberMe: {
        type: 'boolean',
        ebType: 'toggle',
        ebTitle: 'Remember Me',
      },
      groupExtra: {
        type: 'null',
        ebType: 'group-flatten',
        ebTitle: 'Extra Group',
      },
      birthday: {
        type: [ 'object', 'null' ],
        ebType: 'datepicker',
        ebTitle: 'Birthday',
        ebParams: {
          dateFormat: 'DD, MM dd, yyyy',
          header: false,
          toolbar: false,
          // backdrop: true,
        },
        // format: 'date-time',
        notEmpty: true,
        'x-date': true,
      },
      language: {
        type: 'string',
        ebType: 'select',
        ebTitle: 'Language',
        ebOptionsUrl: '/a/base/base/locales',
        ebOptionsUrlParams: null,
        ebOptionsBlankAuto: true,
        ebParams: {
          openIn: 'sheet',
          closeOnSelect: true,
        },
        'x-languages': true,
        // notEmpty: true,
      },
      avatar: {
        type: 'string',
        ebType: 'file',
        ebTitle: 'Avatar',
        ebParams: { mode: 1 },
        notEmpty: true,
      },
      motto: {
        type: 'string',
        ebType: 'component',
        ebRender: {
          module: moduleInfo.relativeName,
          name: 'renderMotto',
          options: {
            props: {
              height: '100px',
            },
          },
        },
        notEmpty: true,
      },
    },
  };
  schemas.formCaptchaTest = {
    type: 'object',
    properties: {
      userName: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Username',
        notEmpty: true,
      },
      password: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Password',
        ebSecure: true,
        notEmpty: true,
        minLength: 6,
      },
    },
  };
  schemas.formMobileVerifyTest = {
    type: 'object',
    properties: {
      mobile: {
        type: 'string',
        ebType: 'text',
        ebInputType: 'tel',
        ebTitle: 'Phone Number',
        notEmpty: true,
      },
    },
  };

  return schemas;
};
