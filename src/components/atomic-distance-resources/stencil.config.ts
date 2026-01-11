import {Config} from '@stencil/core';
import html from 'rollup-plugin-html';
export const config: Config = {
  namespace: 'atomic-distance-resources',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    /*  To prevent automatic readme.md generation during npm run build */
    /*
    {
      type: 'docs-readme',
      dir: './',
    },
    */
    {
      type: 'docs-json',
      file: 'docs/stencil-docs.json',
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: './**/*.html',
      }),
    ],
  },
};
