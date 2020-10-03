module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  transform: {
    '\\.ts': 'ts-jest',
  },
  testRegex: 'test/.*test.ts',
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '~/(.+)': '<rootDir>/src/$1',
    '@test/(.+)': '<rootDir>/test/$1',
  },
  testEnvironment: 'node',
}
