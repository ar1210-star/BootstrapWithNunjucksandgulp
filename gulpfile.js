const { src, dest, series, parallel, watch } = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const plumber = require("gulp-plumber");
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");

const paths = {
  templates: "src/templates/**/*.njk",
  pages: "src/templates/*.njk",
  assets: "src/assets/**/*",
  dist: "dist"
};

// del@7 is ESM — use dynamic import and deleteAsync
function clean() {
  return import('del').then(({ deleteAsync }) => deleteAsync([paths.dist]));
}

function templates() {
  return src(paths.pages)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(nunjucksRender({ path: ["src/templates"] }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.dist))
    .pipe(browserSync.stream());
}

function assets() {
  return src(paths.assets, { encoding: false })
    .pipe(dest(`${paths.dist}/assets`))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({ server: { baseDir: paths.dist }, port: 5173, open: false });
  watch(paths.templates, templates);
  watch("src/assets/**/*", assets);
}

const build = series(clean, parallel(templates, assets));
exports.clean = clean;
exports.build = build;
exports.default = series(build, serve);
