import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'

const app = new Hono()

// Swagger UI
app.get('/ui', swaggerUI({ url: '/api/docs/openapi.json' }))

// OpenAPI spec
app.get('/openapi.json', (c) => {
    return c.json({
        openapi: '3.0.0',
        info: {
            title: 'SamaSanté API',
            version: '1.0.0',
            description: 'API de gestion médicale pour hôpitaux',
            contact: {
                name: 'Support SamaSanté',
                email: 'support@samasante.com',
            },
        },
        servers: [
            {
                url: 'https://api.samasante.com',
                description: 'Production',
            },
            {
                url: 'http://localhost:3000',
                description: 'Development',
            },
        ],
        paths: {
            '/auth/login': {
                post: {
                    summary: 'Connexion utilisateur',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', minLength: 8 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Connexion réussie',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            user: { $ref: '#/components/schemas/User' },
                                            token: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Identifiants invalides',
                        },
                    },
                },
            },
            '/patients': {
                get: {
                    summary: 'Liste des patients',
                    tags: ['Patients'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'page',
                            in: 'query',
                            schema: { type: 'integer', default: 1 },
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            schema: { type: 'integer', default: 20 },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Liste des patients',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/Patient' },
                                            },
                                            pagination: { $ref: '#/components/schemas/Pagination' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'] },
                    },
                },
                Patient: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        dob: { type: 'string', format: 'date' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' },
                    },
                },
            },
        },
    })
})

export default app
