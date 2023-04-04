const { describe, expect, test } = require('@jest/globals');

const request = require('supertest');
const app = require('../../app/Back/app');

describe('Test the root path', () => {
    test('It should respond with JSON', () => {
        return request(app)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(400);
    },
        timeout = 100000);
});