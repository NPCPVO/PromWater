var isRelease = false;
let project_folder = "dist";
let source_folder = "src";

let fs = require('fs');


const cleanConfig = {
    level: {
        2: {
            mergeAdjacentRules: true, // controls adjacent rules merging; defaults to true
            mergeIntoShorthands: true, // controls merging properties into shorthands; defaults to true
            mergeMedia: true, // controls `@media` merging; defaults to true
            mergeNonAdjacentRules: true, // controls non-adjacent rule merging; defaults to true
            mergeSemantically: false, // controls semantic merging; defaults to false
            overrideProperties: true, // controls property overriding based on understandability; defaults to true
            removeEmpty: true, // controls removing empty rules and nested blocks; defaults to `true`
            reduceNonAdjacentRules: true, // controls non-adjacent rule reducing; defaults to true
            removeDuplicateFontRules: true, // controls duplicate `@font-face` removing; defaults to true
            removeDuplicateMediaBlocks: true, // controls duplicate `@media` removing; defaults to true
            removeDuplicateRules: true, // controls duplicate rules removing; defaults to true
            removeUnusedAtRules: false, // controls unused at rule removing; defaults to false (available since 4.1.0)
            restructureRules: false, // controls rule restructuring; defaults to false
            selectorsSortingMethod: 'natural',
            skipProperties: [] // controls which properties won't be optimized, defaults to `[]` which means all will be optimized (since 4.1.0)
        }
    }
};

let entries = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        cssLibs: project_folder + "/css/libs",
        js: project_folder + "/js/",
        images: project_folder + "/images/",
        fonts: project_folder + "/fonts/",
        data: project_folder + "/ajax/",
        files: project_folder + "/files/",
    },
    src: {
        html: [source_folder + "/*.+(html|phtml)", "!" + source_folder + "/_*.+(html|phtml)"],
        css: [source_folder + "/scss/style.scss", source_folder + "/scss/media/media_**.scss"],
        cssLibs: source_folder + "/scss/libs/*.(css|scss)",
        js: [source_folder + "/js/common.js"],
        // порядок подключения 1. Библиотеки 2. common.js тут инициализирются общие перменные, 3. отсальные файлы в js папке 
        images: source_folder + "/images/**/*.+(png|jpg|gif|ico|webp)",
        video: source_folder + "/images/**/*.+(mp4|wav|ogv|webm)",
        fonts: source_folder + "/fonts/*.+(ttf|TTF|woff|woff2)",
        data: source_folder + "/ajax/*.json",
        files: source_folder + "/files/**/*",
        sprites: source_folder + "/images/**/*.+(svg)",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        images: source_folder + "/images/**/*.+(png|jpg|gif|ico|webp)",
        sprites: source_folder + "/images/**/*.+(svg)",
        data: source_folder + "/ajax/*.json",
        files: source_folder + "/files/**/*",
        // fonts: source_folder + "/fonts/*.{ttf|TTF}",
    },
    clean: "./" + project_folder + "/"
}

let {
    src,
    dest
} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-dart-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    // gcmq = require('gulp-group-css-media-queries'),
    CleanCSS = require('clean-css'),
    rename = require("gulp-rename"),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    gulpif = require('gulp-if'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require("browserify"),
    path = require('path'),
    source = require('vinyl-source-stream'),
    util = require("gulp-util"),
    glob = require('glob'),
    concatCss = require('gulp-concat-css');

svgSprite = require('gulp-svg-sprite');
fonter = require('gulp-fonter');
concat = require('gulp-concat');


function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false,
    })
}

function html() {
    return src(entries.src.html)
        .pipe(fileinclude())
        .pipe(dest(entries.build.html))
        .pipe(browsersync.stream())
}

function cssLibs() {
    return buildSass(entries.src.cssLibs, entries.build.cssLibs);
}

function css() {
    return buildSass(entries.src.css, entries.build.css);
}

function buildSass(entries, buildPath) {
    let stream = src(entries);

    if (!isRelease) stream = stream.pipe(sourcemaps.init());

    stream = stream.pipe(
        scss({
            includePaths: ['node_modules/'],
            outputStyle: 'compressed',
        })
    );

    stream = stream.pipe(
        autoprefixer({
            overrideBrowserslist: [">0.2%"],
            cascade: true,
        })
    );

    stream = stream.on('data', function (file) {
        const bufferFile = new CleanCSS(cleanConfig).minify(file.contents)
        return file.contents = Buffer.from(bufferFile.styles)
    });

    if (!isRelease) stream = stream.pipe(sourcemaps.write("."));

    stream = stream.pipe(dest(buildPath));

    if (!isRelease) stream = stream.pipe(browsersync.stream());

    return stream;
}

var through = require('through');

var defaultOptions = {
    extensions: ['.scss']
};


function js(done) {
    var bra = require('browserify-require-async');
    var config = [bra, {
        looseParseMode: true,
        sourceType: 'module',
        outputDir: entries.build.js,
        url: isRelease ? "compiled/js/" : "js/",

        setup: function () {
            var b = browserify({ debug: !isRelease, sourceType: 'module', transform: ['scssify', 'browserify-css', config, ['babelify', { 'presets': [["@babel/preset-env"]] }]] });
            return b;
        },
        bundle: function (bundle, opts) {
            bundle.bundle()
                .pipe(source(path.basename(opts.outputFile)))
                .pipe(buffer())
                .pipe(gulpif(!isRelease, sourcemaps.init({ loadMaps: true })))
                .pipe(uglify())
                .pipe(gulpif(!isRelease, sourcemaps.write('./')))
                .pipe(gulp.dest(opts.outputDir));
        },
    }];

    entries.src.js.forEach(file => {
        glob.sync(file).forEach(file => {
            const b = browserify({
                entries: file,
                sourceType: 'module',
                debug: !isRelease,
                transform: ['scssify', 'browserify-css', config, ['babelify', { 'presets': ["@babel/preset-env"] }]]
            });

            b.bundle()
                .pipe(source(path.basename(file)))
                .pipe(rename(path => {
                    path.basename += ".min";
                    path.extname = ".js";
                }))
                .pipe(buffer())
                .pipe(gulpif(!isRelease, sourcemaps.init({ loadMaps: true })))
                .pipe(uglify())
                .pipe(gulpif(!isRelease, sourcemaps.write('./')))
                .pipe(gulp.dest(entries.build.js));

            done();
        })
    });

    // let stream = src(path.src.js);
    // if (!isRelease) stream = stream.pipe(sourcemaps.init());
    // stream = stream.pipe(fileinclude())
    // stream = stream.pipe(uglify())
    // stream = stream.pipe(concat('main.bundle.js'))
    // if (!isRelease) stream = stream.pipe(sourcemaps.write("."))
    // stream = stream.pipe(dest(path.build.js))
    // if (!isRelease) stream = stream.pipe(browsersync.stream());

    // return stream;
}

function images() {
    return src(entries.src.images)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{
                    removeViewBox: false
                }],
                interlaced: true,
                optimizationLevel: 1 // 0 to 7
            })
        )
        .pipe(dest(entries.build.images))
        .pipe(browsersync.stream())
}

function video() {
    return src(entries.src.video)
        .pipe(dest(entries.build.images))
        .pipe(browsersync.stream())
}

function data() {
    return src(entries.src.data)
        .pipe(dest(entries.build.data))
        .pipe(browsersync.stream())
}

function files() {
    return src(entries.src.files)
        .pipe(dest(entries.build.files))
        .pipe(browsersync.stream())
}

function fonts() {
    // src(path.src.fonts)
    //     .pipe(ttf2woff())
    //     .pipe(dest(path.build.fonts))

    return src(entries.src.fonts)
        .pipe(ttf2woff2())
        .pipe(ttf2woff())
        .pipe(dest(entries.build.fonts))
}

function sprites() {
    let config = {
        mode: {
            stack: {
                sprite: "../sprite.svg" //sprite file name
            }
        },
    };

    return src(entries.src.sprites)
        .pipe(svgSprite(config))
        .pipe(dest(entries.build.images))
        .pipe(browsersync.stream());

}

// gulp.task('fontsCopy', function() {
//     return gulp.src([source_folder + '/fonts/*.otf'])
//         .pipe(ttf2woff2())
//         .pipe(gulp.dest(path.build.fonts))
// });

gulp.task('otf2ttf', function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(
            fonter({
                formats: ['ttf']
            })
        )
        .pipe(dest(source_folder + '/fonts/'))
})

function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(entries.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }

    return new Promise(function (resolve, reject) {
        console.log("Fonts not requered.");
        resolve();
    });
}

function cb() { }

function watchFiles(params) {
    gulp.watch([entries.watch.html], html);
    gulp.watch([entries.watch.css], css);
    gulp.watch([entries.watch.js], js);
    gulp.watch([entries.watch.images], images);
    gulp.watch([entries.watch.sprites], sprites);
    gulp.watch([entries.watch.files], files);
    gulp.watch([entries.watch.data], data);

}

function clean(params) {
    return del(entries.clean);
}

gulp.task('critical', async () => {
    const critical = (await import('critical'));
    let contentString = "";
    const files = glob.sync('dist/*.html'); // .sort((a, b) => a.includes('index.html') ? -1 : 0)

    const contentTagName = "main";
    for (const file of files) {
        if (file.includes("__merged__.html")) continue;

        const fileContent = fs.readFileSync(file).toString();
        if (contentString == "") {
            contentString = fileContent;
        } else {
            contentString = contentString.replace(`</${contentTagName}>`, (new RegExp(`<${contentTagName}([\\S\\s]*?)>([\\S\\s]*?)</${contentTagName}>`, 'gsm')).exec(fileContent)[2] + `</${contentTagName}>`);
        }
    }

    fs.writeFileSync("dist/__merged__.html", contentString);
    const responsible = {
        xs: {
            width: 320,

            css: [
                'css/style.css',
                "css/media_xxl.css",
                "css/media_xl.css",
                "css/media_lg.css",
                "css/media_md.css",
                "css/media_sm.css",
                "css/media_xs.css",
            ]
        },
        sm: {
            width: 575,

            css: [
                'css/style.css',
                "css/media_xxl.css",
                "css/media_xl.css",
                "css/media_lg.css",
                "css/media_md.css",
                "css/media_sm.css",
            ]
        },
        md: {
            width: 768,

            css: [
                'css/style.css',
                "css/media_xxl.css",
                "css/media_xl.css",
                "css/media_lg.css",
                "css/media_md.css",
            ]
        },
        lg: {
            width: 992,

            css: [
                'css/style.css',
                "css/media_xxl.css",
                "css/media_xl.css",
                "css/media_lg.css",
            ]
        },
        xl: {
            width: 1200,

            css: [
                'css/style.css',
                "css/media_xxl.css",
                "css/media_xl.css",
            ]
        },
        xxl: {
            width: 1400,

            css: [
                'css/style.css',
                "css/media_xxl.css",
            ]
        },
        // {
        //     height: 1200,
        //     width: 1920,
        //     css: [
        //         'css/style.css',
        //         "css/media_fhd.css",
        //     ]
        // },
        "3xl": {
            width: 2048,

            css: [
                'css/style.css',
                "css/media_3xl.css",
            ]
        },
    };


    return new Promise(async (resolve) => {
        // for (const [fileKey, file] of files.entries()) {
        // const basename = path.basename(file).split('.').slice(0, -1).join('.');
        const basename = "dist/__merged__";

        util.log(`Critical: ${basename}.html parsing paths`);
        const tasks = [];
        for (const [num, [key, value]] of Object.entries(responsible).entries()) {
            // util.log(`Critical: ${key} [${Number((fileKey + 1) / files.length * 100 - 1 * num / Object.values(responsible).length / files.length * 100).toFixed(0)}]%`);

            tasks.push(
                critical.generate({
                    base: 'dist/',
                    inline: false,
                    target: {
                        css: `css/critical-${key}.css`,
                        uncritical: `css/uncritical-${key}.css`,
                    },
                    assetPaths: ['dist/', "images/", "dist/images/"],
                    src: `__merged__.html`,
                    penthouse: {
                        renderWaitTime: 10000,
                        timeout: 3000000,
                        // forceInclude: [/\.four-slide__slider/],
                        // screenshots: {
                        //     basePath: 'tmp', // absolute or relative; excluding file extension
                        //     type: 'jpeg', // jpeg or png, png default
                        //     quality: 20 // only applies for jpeg type
                        // },
                    },
                    strict: true,
                    rebase: (asset) => `${asset.originUrl}`,//`${String(asset.absolutePath).slice('/'.length)}`,
                    height: 200000,
                    ...value
                })
            );
        }

        await Promise.all(tasks);
        // util.log(`Critical: ${basename}.html parsing paths done [${Number((fileKey + 1) / files.length * 100).toFixed(0)}]%`);
        // };

        util.log(`Critical: done; Start bundling...`);

        // const tasks = [];
        // let completedTasksCounter = 0;

        // for (const [key, value] of Object.entries(responsible)) {
        //     tasks.push(
        //         new Promise(resolve => {
        //             gulp.src(`dist/css/critical/critical-*-${key}.css`)
        //                 .pipe(concatCss(`dist/css/critical-${key}.css`))
        //                 .on('data', function (file) {
        //                     const bufferFile = new CleanCSS(cleanConfig).minify(file.contents)
        //                     return file.contents = Buffer.from(bufferFile.styles)
        //                 })
        //                 .pipe(gulp.dest('./')).on('finish', () => {
        //                     completedTasksCounter++;
        //                     util.log(`Critical bundling critical.css [${Number(completedTasksCounter / tasks.length * 100).toFixed(0)}]%`);
        //                     resolve();
        //                 })
        //         })
        //     );

        //     tasks.push(
        //         new Promise(resolve => {
        //             gulp.src(`dist/css/critical/uncritical-*-${key}.css`)
        //                 .pipe(concatCss(`dist/css/uncritical-${key}.css`))
        //                 .on('data', function (file) {
        //                     const bufferFile = new CleanCSS(cleanConfig).minify(file.contents)
        //                     return file.contents = Buffer.from(bufferFile.styles)
        //                 })
        //                 .pipe(gulp.dest('./')).on('finish', () => {
        //                     completedTasksCounter++;
        //                     util.log(`Critical bundling uncritical.css [${Number(completedTasksCounter / tasks.length * 100).toFixed(0)}]%`);
        //                     resolve();
        //                 })
        //         })
        //     );
        // }

        // await Promise.all(tasks);

        // await del('dist/css/critical')

        util.log(`Critical: done`);

        resolve();
    })

})

let build = gulp.series(clean, gulp.parallel(css, cssLibs, js, html, images, video, sprites, data, files, fonts), fontsStyle);
let serve = gulp.parallel(watchFiles, browserSync);
let watch = gulp.series(build, serve);

function buildProject() {
    return new Promise(function (resolve, reject) {
        isRelease = true;
        console.log("=== Project release ===");
        let build = gulp.series(clean, gulp.parallel(js, css, cssLibs, html, images, sprites, video, data, files, fonts), 'critical');
        build();
        resolve();
    });
}

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = buildProject;
exports.critical = gulp.series('critical');
exports.serve = serve;
exports.prebuild = gulp.series(build, 'critical', serve);
exports.watch = watch;
exports.default = watch;