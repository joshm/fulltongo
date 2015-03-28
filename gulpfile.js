var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('default', function() {
  return gulp.src('test/*.js')
  .pipe(mocha({ui: 'bdd', reporter: 'should'}));
});
