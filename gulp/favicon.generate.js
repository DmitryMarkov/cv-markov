module.exports = () => {
  $.gulp.task('favicon:generate', done => {
    $.plugins.realFavicon.generateFavicon(
      {
        masterPicture: 'materials/icon-transparent.png',
        dest: 'build',
        iconsPath: '/',
        design: {
          ios: {
            pictureAspect: 'backgroundAndMargin',
            backgroundColor: '#ffffff',
            margin: '14%',
            assets: {
              ios6AndPriorIcons: false,
              ios7AndLaterIcons: false,
              precomposedIcons: false,
              declareOnlyDefaultIcon: true,
            },
            appName: 'Dmitry Markov',
          },
          desktopBrowser: {},
          windows: {
            pictureAspect: 'noChange',
            backgroundColor: '#2b5797',
            onConflict: 'override',
            assets: {
              windows80Ie10Tile: false,
              windows10Ie11EdgeTiles: {
                small: false,
                medium: true,
                big: false,
                rectangle: false,
              },
            },
            appName: 'Dmitry Markov',
          },
          androidChrome: {
            pictureAspect: 'noChange',
            themeColor: '#ffffff',
            manifest: {
              name: 'Dmitry Markov',
              display: 'standalone',
              orientation: 'notSet',
              onConflict: 'override',
              declared: true,
            },
            assets: {
              legacyIcon: false,
              lowResolutionIcons: false,
            },
          },
          safariPinnedTab: {
            pictureAspect: 'blackAndWhite',
            threshold: 50,
            themeColor: '#5bbad5',
          },
        },
        settings: {
          compression: 2,
          scalingAlgorithm: 'Lanczos',
          errorOnImageTooSmall: false,
          readmeFile: true,
          htmlCodeFile: true,
          usePathAsIs: false,
        },
        versioning: {
          paramName: 'v',
          paramValue: $.package.version,
        },
        markupFile: $.config.faviconFile,
      },
      function() {
        done()
      }
    )
  })
}
