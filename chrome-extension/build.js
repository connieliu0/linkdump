import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/background.js', 'src/popup.js'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'chrome110',
  minify: !isWatch,
  sourcemap: isWatch,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete!');
}

