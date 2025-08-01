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

             await request(app.server)
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

            const cookies = userResponse.get("Set-Cookie") as any

           await request(app.server)
                .post("/meals")
                .set('Cookie', cookies)
                .send({
                    name: 'new meal',
                    description: 'meal description',
                    date: dayjs().format('YYYY-MM-DD'),
                    hour: '10:30',
                    isOnDiet: true
                })
                .expect(201)

            const listMealsResponse = await request(app.server)
                .get("/meals")
                .set('Cookie', cookies)
                .expect(200)

            expect(listMealsResponse).toBeDefined()
            expect(listMealsResponse.body.meals[0].name).toEqual('new meal')
            expect(listMealsResponse.body.meals[0].hour).toEqual('10:30')

        })
    })

     describe('GET /meals/:id', () => {
        it("should be able to list a meal by id", async () => {
            const userResponse = await request(app.server)
              .post("/users")
              .send({
                name: "test",
                email: "test@email.com",
              })
              .expect(201);

            const cookies = userResponse.get("Set-Cookie") as any;

            await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date: dayjs().format("YYYY-MM-DD"),
                hour: "10:30",
                isOnDiet: true,
              })
              .expect(201);

            const listMealsResponse = await request(app.server)
              .get("/meals")
              .set("Cookie", cookies)
              .expect(200);

            const mealId = listMealsResponse.body.meals[0].id;

            const listMealResponse = await request(app.server)
              .get(`/meals/${mealId}`)
              .set("Cookie", cookies)
              .expect(200);

            expect(listMealResponse).toBeDefined();
            expect(listMealResponse.body.meal.name).toEqual("new meal");
            expect(listMealResponse.body.meal.hour).toEqual("10:30");
        })
    })

     describe('DELETE /meals/:id', () => {
        it("should be able to delete a meal by id", async () => {
            const userResponse = await request(app.server)
              .post("/users")
              .send({
                name: "test",
                email: "test@email.com",
              })
              .expect(201);

            const cookies = userResponse.get("Set-Cookie") as any;

            const createMealResponse = await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date: dayjs().format("YYYY-MM-DD"),
                hour: "10:30",
                isOnDiet: true,
              })
              .expect(201);

            const mealId = createMealResponse.body.id;

            const deletionResponse = await request(app.server)
              .delete(`/meals/${mealId}`)
              .set("Cookie", cookies)
              .expect(204);
            console.log('deletionResponse',deletionResponse)

            expect(deletionResponse.body).toEqual({})
        })
    })

     describe('PUT /meals/:id', () => {
        it("should be able to update a meal by id", async () => {
            const userResponse = await request(app.server)
              .post("/users")
              .send({
                name: "test",
                email: "test@email.com",
              })
              .expect(201);

            const cookies = userResponse.get("Set-Cookie") as any;

            const createMealResponse = await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date: dayjs().format("YYYY-MM-DD"),
                hour: "10:30",
                isOnDiet: true,
              })
              .expect(201);

            const mealId = createMealResponse.body.id;

            const updatedMealResponse = await request(app.server)
              .put(`/meals/${mealId}`)
              .set("Cookie", cookies)
              .send({
                name: "updated Meal",
                description: "meal description updated",
                date: dayjs().format("YYYY-MM-DD"),
                hour: "10:30",
                isOnDiet: true,
              })
              .expect(204);

            expect(updatedMealResponse.body).toEqual({})
        })
    })

      describe('GET /meals/metrics', () => {
        it("should be able to list user meals metrics", async () => {
            const userResponse = await request(app.server)
              .post("/users")
              .send({
                name: "test",
                email: "test@email.com",
              })
              .expect(201);

            const cookies = userResponse.get("Set-Cookie") as any;

            await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date:  dayjs("2025-08-01").format("YYYY-MM-DD"),
                hour: "10:30",
                isOnDiet: true,
              })
              .expect(201);

            await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date:  dayjs("2025-08-01").format("YYYY-MM-DD"),
                hour: "10:50",
                isOnDiet: true,
              })
              .expect(201);

            
            await request(app.server)
              .post("/meals")
              .set("Cookie", cookies)
              .send({
                name: "new meal",
                description: "meal description",
                date:  dayjs("2025-08-01").format("YYYY-MM-DD"),
                hour: "11:00",
                isOnDiet: false,
              })
              .expect(201);


            const mealsMetricsResponse = await request(app.server)
                .get("/meals/metrics")
                .set('Cookie', cookies)
                .expect(200)
            
            expect(mealsMetricsResponse.body).toEqual(
              expect.objectContaining({
                totalMeals: 3,
                onDietMeals: 2,
                outOfDietMeals: 1,
                bestSequence: 2,
                percentageOfMealsOnDiet: 66.67,
              })
            );

            
        })
    })
})