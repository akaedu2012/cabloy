const require3 = require('require3');
const uuid = require3('uuid');

module.exports = ctx => {
  class Validation extends ctx.app.meta.BeanModuleBase {

    constructor(moduleName) {
      super(ctx, 'validation');
      this.moduleName = moduleName || ctx.module.info.relativeName;
    }

    getSchema({ module, validator, schema }) {
      module = module || this.moduleName;
      const meta = ctx.app.meta.modules[module].main.meta;
      if (!schema) {
        const schemas = this._adjustSchemas(meta.validation.validators[validator].schemas);
        schema = schemas[0];
      }
      return {
        module, validator,
        schema: meta.validation.schemas[schema],
      };
    }

    async validate({ module, validator, schema, data }) {
      const _validator = this._checkValidator({ module, validator });
      return await _validator.ajv.v({ ctx, schema, data });
    }

    async ajvFromSchemaAndValidate({ module, schema, options, data }) {
      const ajv = this.ajvFromSchema({ module, schema, options });
      return await this.ajvValidate({ ajv, schema: null, data });
    }

    async ajvValidate({ ajv, schema, data }) {
      return await ajv.v({ ctx, schema, data });
    }

    ajvFromSchema({ module, schema, options }) {
      // params
      const params = {
        options,
      };
      // keywords
      if (module) {
        module = module || this.moduleName;
        const meta = ctx.app.meta.modules[module].main.meta;
        params.keywords = meta.validation.keywords;
      }
      // schemas
      params.schemaRoot = uuid.v4();
      params.schemas = {
        [params.schemaRoot]: { ... schema, $async: true },
      };
      // create
      return ctx.app.meta.ajv.create(params);
    }

    _checkValidator({ module, validator }) {
      module = module || this.moduleName;
      const meta = ctx.app.meta.modules[module].main.meta;
      const _validator = meta.validation.validators[validator];
      if (_validator.ajv) return _validator;
      // create ajv
      const _schemas = this._adjustSchemas(_validator.schemas);
      const schemas = {};
      for (const _schema of _schemas) {
        schemas[_schema] = meta.validation.schemas[_schema];
        schemas[_schema].$async = true;
      }
      _validator.ajv = ctx.app.meta.ajv.create({ options: _validator.options, keywords: meta.validation.keywords, schemas, schemaRoot: _schemas[0] });
      return _validator;
    }

    _adjustSchemas(schemas) {
      if (typeof schemas === 'string') return schemas.split(',');
      return schemas;
    }

  }

  return Validation;
};
