const http = require('http');
const compose = require('koa-compose');
const onFinished = require('on-finished');
const statuses = require('statuses');
const isJSON = require('koa-is-json');
const Stream = require('stream');
const is = require('is-type-of');
const raw = require('raw-body');
const inflate = require('inflation');
const mparse = require('egg-born-mparse').default;

const MODULE = Symbol.for('Context#__module');
const DATABASE = Symbol.for('Context#__database');
const DATABASEMETA = Symbol.for('Context#__databasemeta');
const INNERACCESS = Symbol.for('Context#__inneraccess');
const SUBDOMAIN = Symbol.for('Context#__subdomain');
const CTXCALLER = Symbol.for('Context#__ctxcaller');
const TAILCALLBACKS = Symbol.for('Context#__tailcallbacks');

class DbTransaction {
  constructor(ctx) {
    this._ctx = ctx;
    this._transactionCounter = 0;
    this._connection = null;
  }
  get inTransaction() {
    return this._transactionCounter > 0;
  }
  get connection() {
    return this._connection;
  }
  set connection(value) {
    this._connection = value;
  }
  async begin(fn) {
    let res;
    const db = getDbOriginal(this._ctx);
    try {
      if (++this._transactionCounter === 1) {
        this._connection = await db.beginTransaction();
      }
    } catch (err) {
      this._transactionCounter--;
      throw err;
    }
    try {
      res = await fn();
    } catch (err) {
      if (--this._transactionCounter === 0) {
        await this._connection.rollback();
        this._connection = null;
      }
      throw err;
    }
    try {
      if (--this._transactionCounter === 0) {
        await this._connection.commit();
        this._connection = null;
      }
    } catch (err) {
      await this._connection.rollback();
      this._connection = null;
      throw err;
    }
    return res;
  }
}

module.exports = {
  get module() {
    if (this[MODULE] === undefined) {
      const info = mparse.parseInfo(mparse.parseName(this.req.mockUrl || this.req.url));
      this[MODULE] = info ? this.app.meta.modules[info.relativeName] : null;
    }
    return this[MODULE];
  },
  get db() {
    if (!this[DATABASE]) {
      this[DATABASE] = createDatabase(this);
    }
    return this[DATABASE];
  },
  set db(value) {
    this[DATABASE] = value;
  },
  get dbMeta() {
    if (!this[DATABASEMETA]) {
      this[DATABASEMETA] = {
        master: true,
        transaction: new DbTransaction(this),
      };
    }
    return this[DATABASEMETA];
  },
  set dbMeta(metaCaller) {
    // transaction
    if (metaCaller.transaction.inTransaction) {
      this.dbMeta.master = false; // false only on metaCaller.transaction=true
      this.dbMeta.transaction = metaCaller.transaction;
    }
  },
  get transaction() {
    return this.dbMeta.transaction;
  },
  get innerAccess() {
    return this[INNERACCESS];
  },
  set innerAccess(value) {
    this[INNERACCESS] = value;
  },
  get subdomain() {
    return typeof this[SUBDOMAIN] === 'undefined' ? this.subdomains.join('.') : this[SUBDOMAIN];
  },
  set subdomain(value) {
    this[SUBDOMAIN] = value;
  },
  get ctxCaller() {
    return this[CTXCALLER];
  },
  set ctxCaller(value) {
    // ctxCaller
    this[CTXCALLER] = value;
    // innerAccess
    this.innerAccess = true;
    // transaction
    this.dbMeta = value.dbMeta;
  },
  get cache() {
    return this.bean.cache;
  },
  tail(cb) {
    if (this.ctxCaller) {
      this.ctxCaller.tail(cb);
    } else {
      this.tailCallbacks.push(cb);
    }
  },
  async tailDone() {
    while (true) {
      const cb = this.tailCallbacks.shift();
      if (!cb) break;
      await cb();
    }
  },
  get tailCallbacks() {
    if (!this[TAILCALLBACKS]) {
      this[TAILCALLBACKS] = [];
    }
    return this[TAILCALLBACKS];
  },

  async executeBean({ locale, subdomain, beanModule, beanFullName, context, fn, transaction }) {
    return await this.app.meta.util.executeBean({
      locale: locale === undefined ? this.locale : locale,
      subdomain: subdomain === undefined ? this.subdomain : subdomain,
      context, beanModule, beanFullName, transaction, fn,
      ctxCaller: this,
    });
  },

  // * deprecated
  performActionInBackground(options) {
    // inherit subdomain, cookies such as locale
    const ctx = this;
    ctx.runInBackground(() => {
      // performAction
      return ctx.performAction(options);
    });
  },

  /**
   * perform action of this or that module
   * @param  {string} options.method method
   * @param  {string} options.url    url
   * @param  {json} options.data   data(optional)
   * @return {promise}                response.body.data or throw error
   */
  performAction({ innerAccess, subdomain, method, url, query, params, headers, body }) {
    return new Promise((resolve, reject) => {
      const handleRequest = appCallback.call(this.app);
      const request = createRequest({
        method,
        url: this.app.meta.util.combineFetchPath(this.module && this.module.info, url),
      }, this);
      const response = new http.ServerResponse(request);
      handleRequest(this, innerAccess, subdomain, request, response, resolve, reject, query, params, headers, body);
    });
  },

  getVal(name) {
    return (this.params && this.params[name]) || (this.query && this.query[name]) || (this.request.body && this.request.body[name]);
  },

  getInt(name) {
    return parseInt(this.getVal(name));
  },

  getFloat(name) {
    return parseFloat(this.getVal(name));
  },

  getStr(name) {
    const v = this.getVal(name);
    return (v && v.toString()) || '';
  },

  getSafeStr(name) {
    const v = this.getStr(name);
    return v.replace(/'/gi, "''");
  },

  successMore(list, index, size) {
    this.success({ list, index: index + list.length, finished: (size === -1 || size === 0) || list.length < size });
  },

  async getPayload(options) {
    return await raw(inflate(this.req), options);
  },

};

function appCallback() {
  const fn = compose(this.middleware);
  const self = this;

  if (!this.listeners('error').length) this.on('error', this.onerror);

  return function handleRequest(ctxCaller, innerAccess, subdomain, req, res, resolve, reject, query, params, headers, body) {
    res.statusCode = 404;
    const ctx = self.createContext(req, res);
    onFinished(res, ctx.onerror);

    // subdomain
    ctx.subdomain = typeof subdomain === 'undefined' ? ctxCaller.subdomain : subdomain;

    // query params body
    if (query) ctx.query = query;
    if (params) ctx.params = params;
    ctx.request.body = body || null; // not undefined

    // headers
    if (headers) Object.assign(ctx.headers, headers);

    // multipart
    ctx.multipart = function(options) {
      return ctxCaller.multipart(options);
    };

    // cookies
    delegateCookies(ctx, ctxCaller);

    // ctxCaller
    ctx.ctxCaller = ctxCaller;

    // innerAccess
    if (innerAccess !== undefined) ctx.innerAccess = innerAccess;

    // call
    fn(ctx).then(function handleResponse() {
      respond.call(ctx);
      if (ctx.status === 200 && ctx.body) {
        if (ctx.body.code === 0) {
          resolve(ctx.body.data);
        } else {
          const error = ctx.createError(ctx.body);
          reject(error);
        }
      } else {
        const error = ctx.createError({
          code: ctx.status, message: ctx.message || ctx.body,
        });
        reject(error);
      }
    }).catch(err => {
      const error = ctx.createError(err);
      ctx.onerror(error);
      reject(error);
    });
  };
}

function respond() {
  // allow bypassing koa
  if (this.respond === false) return;

  const res = this.res;
  if (res.headersSent || !this.writable) return;

  let body = this.body;
  const code = this.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    this.body = null;
    return res.end();
  }

  if (this.method === 'HEAD') {
    if (isJSON(body)) this.length = Buffer.byteLength(JSON.stringify(body));
    return res.end();
  }

  // status body
  if (body == null) {
    this.type = 'text';
    body = this.message || String(code);
    this.length = Buffer.byteLength(body);
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if (typeof body === 'string') return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  this.length = Buffer.byteLength(body);
  res.end(body);
}

function delegateCookies(ctx, ctxCaller) {
  Object.defineProperty(ctx, 'cookies', {
    get() {
      return ctxCaller.cookies;
    },
  });
}

function createRequest({ method, url }, ctxCaller) {
  // _req
  const _req = ctxCaller.request;
  // req
  const req = new http.IncomingMessage();
  req.headers = _req.headers;
  req.host = _req.host;
  req.hostname = _req.hostname;
  req.protocol = _req.protocol;
  req.secure = _req.secure;
  req.method = method.toUpperCase();
  req.url = url;
  // path,
  req.socket = {
    remoteAddress: _req.socket.remoteAddress,
    remotePort: _req.socket.remotePort,
  };
  return req;
}

function getDbOriginal(ctx) {
  return ctx.app.mysql.__ebdb_test || ctx.app.mysql.get('__ebdb');
}

function createDatabase(ctx) {
  const db = getDbOriginal(ctx);
  return new Proxy(db, {
    get(target, prop) {
      const value = target[prop];
      if (!is.function(value)) return value;
      if (value.name !== 'createPromise') return value;
      // check if use transaction
      if (!ctx.dbMeta.transaction.inTransaction) return value;
      return function(...args) {
        return ctx.dbMeta.transaction.connection[prop].apply(ctx.dbMeta.transaction.connection, args);
      };
    },
  });
}
