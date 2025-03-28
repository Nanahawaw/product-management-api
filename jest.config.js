module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testTimeout: 3000,
    moduleNameMapper: {
        '^../models/Admin$': '<rootDir>/src/__mocks__/Admin.ts',
    },
};
