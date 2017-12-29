const qs = require('querystring');
const eventLoadSchedules = 'eb:event:loadSchedules';

module.exports = function(loader, modules) {

  // all schedules
  const ebSchedules = {};

  // load schedules
  loadSchedules();

  Object.keys(ebSchedules).forEach(key => {
    loader.app.schedules[key] = ebSchedules[key];
  });

  loader.app.messenger.once('egg-ready', () => {
    loader.app.messenger.sendToAgent(eventLoadSchedules, ebSchedules);
  });

  // for test purpose
  loader.app.meta.runSchedule = key => {
    const schedule = ebSchedules[key];
    if (!schedule) {
      throw new Error(`Cannot find schedule ${key}`);
    }

    // run with anonymous context
    const ctx = loader.app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${key}&${qs.stringify(schedule.schedule)}`,
    });

    return schedule.task(ctx);
  };

  function loadSchedules() {
    Object.keys(modules).forEach(key => {
      const module = modules[key];
      // module schedules
      if (module.main.schedules) {
        Object.keys(module.main.schedules).forEach(scheduleKey => {
          const fullKey = `${module.info.fullName}:${scheduleKey}`;
          const scheduleTask = module.main.schedules[scheduleKey];
          const scheduleConfig = loader.app.meta.configs[module.info.relativeName].schedules[scheduleKey];
          ebSchedules[fullKey] = {
            schedule: scheduleConfig,
            task: wrapTask(scheduleTask, fullKey, scheduleConfig, module.info),
            key: fullKey,
          };
        });
      }
    });
  }

  function wrapTask(task, key, schedule, info) {
    return function() {
      const ctx = loader.app.createAnonymousContext({
        method: 'SCHEDULE',
        url: `/api/${info.url}/__schedule?path=${key}&${qs.stringify(schedule)}`,
      });
      return task(ctx);
    };
  }

};
