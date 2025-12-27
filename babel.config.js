// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '18'
      },
      modules: 'auto'
    }]
  ]
};