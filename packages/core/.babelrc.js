module.exports = function(api) {
   const env = api.env();
   api.cache(true);
   return {
      presets: [
         env === 'production' && 'minify',
         [
            '@babel/preset-env',
            {
               loose: true,
               modules: false,
               ...(env === 'library'
                  ? {
                       targets: {
                          esmodules: true,
                       },
                    }
                  : {useBuiltIns: 'usage', corejs: 3}),
            },
         ],
         '@babel/preset-typescript',
      ].filter(Boolean),
      plugins: [
         '@babel/plugin-proposal-class-properties',
         [
            '@babel/plugin-transform-runtime',
            {
               useESModules: true,
            },
         ],
      ],
      ignore: ['**/*.d.ts'],
   };
};
