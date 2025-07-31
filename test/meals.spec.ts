import { afterAll, beforeAll, describe, it, beforeEach, expect  } from 'vitest'
import { execSync } from "child_process"
import { app } from '../src/app'
import request from 'supertest'
import dayjs from 'dayjs'


describe('Meals Routes' ,() => {
    beforeAll(async () => {
        app.ready()
    })

    afterAll(async () => {
        app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    describe('POST /meals', () => {
        it("should be able to create a meal", async () => {
            const userResponse = await request(app.server)
             .post("/users")
            .send({
                name: 'test',
                email: 'test@email.com'
            })
            .expect(201)

            const response = await request(app.server)
                .post("/meals")
                .set('Cookie', userResponse.get("Set-Cookie") as any)
                .send({
                    name: 'new meal',
                    description: 'meal description',
                    date: dayjs().format('YYYY-MM-DD'),
                    hour: '10:30',
                    isOnDiet: true
                })
                .expect(201)

            console.log('response',response)
    
        })
    })

     describe('GET /meals', () => {
        it("should be able to list all user meals", async () => {
            const userResponse = await request(app.server)
             .post("/users")
            .send({
                name: 'test',
                email: 'test@email.com'
            })
            .expect(201)

            const response = await request(app.server)
                .get("/meals")
                .set('Cookie', userResponse.get("Set-Cookie") as any)
                .expect(200)

            // expect(response.body.meals).toEqual([
            //     expect.objectContaining({
            //         title: "New Transaction",
            //         amount: 5000,
            //     })

            // ])

            console.log('response',response)
    
        })
    })
})