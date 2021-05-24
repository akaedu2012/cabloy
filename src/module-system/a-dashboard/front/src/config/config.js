// eslint-disable-next-line
export default function(Vue) {
  return {
    dashboard: {
      presets: {
        anonymous: {
          default: 'a-dashboard:dashboardDefault',
          home: 'a-dashboard:dashboardHome',
        },
        authenticated: {
          default: 'a-dashboard:dashboardDefault',
          home: 'a-dashboard:dashboardHome',
        },
      },
    },
    profile: {
      meta: {
        widget: {
          properties: {
            title: { type: 1, value: '' },
            widthSmall: { type: 1, value: 100 },
            widthMedium: { type: 1, value: 50 },
            widthLarge: { type: 1, value: 25 },
            height: { type: 1, value: 'auto' },
          },
        },
        group: {
          properties: {
            title: { type: 1, value: '' },
            widthSmall: { type: 1, value: 100 },
            widthMedium: { type: 1, value: 100 },
            widthLarge: { type: 1, value: 100 },
            height: { type: 1, value: 'auto' },
          },
        },
      },
    },
  };
}
