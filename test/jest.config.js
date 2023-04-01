module.exports = {
    rootDir: '../',
    // Set up Jest to run tests in a Node.js environment
    testEnvironment: 'node',
    // Configure Jest to look for tests in the `tests` directory
    roots: [
        '<rootDir>/test'
    ],
    moduleFileExtensions: ['vue', 'js', 'json'],
    // Configuration options for testing the front-end with Vue
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/Front/src/$1'
    },
    coverageReporters: ["lcov"],
    testMatch: [
        '<rootDir>/test/**/(*.)spec.{j,t}s?(x)',
        '<rootDir>/test/**/*.(spec|test).{j,t}s?(x)'
    ],
    // Set up Jest to transform files with Babel, so that ES6+ code can be used in tests
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.js$': 'babel-jest',
        '^.+\\.ts$': 'ts-jest',
    },
    coverageDirectory: '<rootDir>/test/coverage',
    collectCoverageFrom: ['**/*.{js,jsx,vue}', '!**/node_modules/**', '!**/vendor/**'],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
    //setupFilesAfterEnv: ['<rootDir>/test/setup.js']

};