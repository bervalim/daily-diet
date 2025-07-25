import { FastifyInstance } from "fastify";
import { request } from "http";
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
}