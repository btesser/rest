basePath = '..';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/string-json-parser/string-json-parser.js',
  'components/lodash/dist/lodash.legacy.js',
  'components/jquery/jquery.js',
  'components/unstable-angular-complete/angular.js',
  'components/nucleus-angular-data-validation/data-validation.js',
  'components/unstable-angular-complete/angular-mocks.js',
  'tests/libraries/mocker.js',
  '*.js',
  'tests/*.js'
];

autoWatch = false;

reporters = ['dots'];

browsers = ['IE', 'Chrome', 'Firefox', 'Opera'];

singleRun = true;