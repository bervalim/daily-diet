import { FastifyInstance } from "fastify";
import z from "zod";
import { validateWithZod } from "../utils/validateWithZod";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";
import { knex } from "../database";
import AppError from "../errors/App.error";
import crypto from "node:crypto";

export async function mealsRoutes(app: FastifyInstance){
    app.post(
      "/",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {

        const createMealBodySchema = z.object({
          name: z.string(),
          description: z.string(),
          date: z.string().refine(
            (val) => {
              return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));
            },
            {
              message: "Date must be in YYYY-MM-DD format",
            }
          ),
          hour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
            message: "Hour must be in format HH:mm",
          }),
          isOnDiet: z.boolean(),
        });

        const { name, description, date, hour, isOnDiet } = validateWithZod(
          createMealBodySchema,
          request.body
        );

        const { sessionId } = request.cookies;

        const user = await knex("Users").where({ sessionId }).first()

        if (!user) throw new AppError("User not Found", 404);

        const [meal] = await knex("Meals").insert({
            id: crypto.randomUUID(),
            name,
            description,
            date,
            hour,
            userId: user.id,
            isOnDiet
        }).returning('*');

        return reply.status(201).send(meal);

      }
    );

    app.get(
      "/",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        const { sessionId } = request.cookies;

        const user = await knex("Users").where({ sessionId }).first()

        if (!user) throw new AppError("User not Found", 404);

        const meals = await knex("Meals").where({userId: user.id}).orderBy("date", "desc");

        return { meals }
      }
    );

    app.get(
      "/:id",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        const getMealsRouteSchema = z.object({
          id: z.string()
        })

        const { id } = validateWithZod(getMealsRouteSchema, request.params)

        const { sessionId } = request.cookies;

        const meal = await knex("Meals").where({ id }).first()

        if(!meal) throw new AppError("Meal Not Found", 404)

        const user = await knex("Users").where({ sessionId }).first();

        if (!user) throw new AppError("User not Found", 404);

        if (user.id !== meal.userId) {
          throw new AppError("The user does not own the meal", 403);
        }

        return { meal }
      }
    );

    app.delete(
      "/:id",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        const getMealsRouteSchema = z.object({
          id: z.string()
        })

        const { id } = validateWithZod(getMealsRouteSchema, request.params)

        const { sessionId } = request.cookies;

        const meal = await knex("Meals").where({ id }).first()

        if(!meal) throw new AppError("Meal Not Found", 404)

        const user = await knex("Users").where({ sessionId }).first()

        if (!user) throw new AppError("User not Found", 404);

        if(user.id !== meal.userId) {
          throw new AppError("The user does not own the meal", 403)
        }

        await knex("Meals").where({ id }).update({ deleted_at: knex.fn.now() })

        return reply.status(204).send()
      }
    );

    app.put(
      "/:id",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        const getMealsRouteSchema = z.object({
          id: z.string()
        })

        const { id } = validateWithZod(getMealsRouteSchema, request.params);

        const meal = await knex("Meals").where({ id }).first();

        if(!meal) throw new AppError("Meal Not Found", 404);

        const { sessionId } = request.cookies;

        const user = await knex("Users").where({ sessionId }).first()

        if (!user) throw new AppError("User not Found", 404);

        if(user.id !== meal.userId) {
          throw new AppError("The user does not own the meal", 403)
        }

        const updateMealBodySchema = z.object({
          name: z.string(),
          description: z.string(),
          date: z.string().refine(
            (val) => {
              return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));
            },
            {
              message: "Date must be in YYYY-MM-DD format",
            }
          ),
          hour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
            message: "Hour must be in format HH:mm",
          }),
          isOnDiet: z.boolean(),
        });

          const { name, description, date, hour, isOnDiet } = validateWithZod(
            updateMealBodySchema,
            request.body
          );

          await knex("Meals")
            .where({ id })
            .update({ name, description, date, hour, isOnDiet, updated_at: knex.fn.now() });

          return reply.status(204).send()
      }
    );

    app.get(
      "/metrics",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        
          const { sessionId } = request.cookies;

          const user = await knex("Users").where({ sessionId }).first()

          if (!user) throw new AppError("User not Found", 404);

          const totalMealsQuery = await knex("Meals")
            .where({ userId: user.id })
            .whereNull("deleted_at")
            .count("id",{as: 'totalMeals'})
            .first()

          const onDietMealsQuery = await knex("Meals")
            .where({userId: user.id})
            .whereNull("deleted_at")
            .where({ isOnDiet: true })
            .count("id", {as: 'onDietMeals'})
            .first()

          const outOfDietMealsQuery = await knex("Meals")
            .where({userId: user.id})
            .whereNull("deleted_at")
            .where({ isOnDiet: false })
            .count("id", {as: 'outOfDietMeals'})
            .first()

          const mealsQuery = await knex("Meals")
            .where({userId: user.id})
            .whereNull("deleted_at")
            .orderBy([{ column: 'date', order: 'asc'}, {column: 'hour', order: 'asc'}])
            .select("isOnDiet")

          let bestSequence = 0
          let currentSequence = 0

          for (const meal of mealsQuery){
            if(meal.isOnDiet){
              currentSequence++
              
            if(currentSequence > bestSequence){
              bestSequence = currentSequence
            }

            }else{
              currentSequence = 0
            }
          }
        
        const totalMeals = Number(totalMealsQuery?.totalMeals || 0)
        const onDietMeals = Number(onDietMealsQuery?.onDietMeals || 0)

        return reply.send({
          totalMeals,
          onDietMeals,
          outOfDietMeals: Number(outOfDietMealsQuery?.outOfDietMeals || 0),
          bestSequence,
          percentageOfMealsOnDiet: totalMeals === 0 ? 0 :(onDietMeals / totalMeals) * 100
        })
      }
    );




    
}