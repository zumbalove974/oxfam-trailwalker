const request = require('supertest');
const app = require('../app/Back/index');

describe('Test the root path', () => {
    test('It should respond with JSON', () => {
        return request(app)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200);
    });
});