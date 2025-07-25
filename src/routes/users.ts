import { FastifyInstance } from "fastify";
import { z } from "zod"
import { knex } from "../database";
import crypto from "node:crypto";
import AppError from "../errors/App.error";
import { validateWithZod } from "../utils/validateWithZod";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply)=> {
        const createUserBodySchema = z.object({
          name: z.string(),
          email: z.email(),
        });

        const {name, email} = validateWithZod(createUserBodySchema, request.body)

        const emailExists = await knex("Users")
            .where({ email })
            .first()

        if(emailExists) {
           throw new AppError('Email Already exists',409)
        } 
       
        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = crypto.randomUUID()
            reply.cookie('sessionId',sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        const [user] = await knex("Users").insert({
            id: crypto.randomUUID(),
            name,
            email,
            sessionId
        }).returning('*')

        return reply.status(201).send(user)
    })

    app.get(
      "/:id",
      { preHandler: [checkSessionIdExists] },
      async (request, reply) => {
        const getUserRouteSchema = z.object({
          id: z.string(),
        });

        const { id } = validateWithZod(getUserRouteSchema, request.params);

        const { sessionId } = request.cookies;

        const user = await knex("Users").where({ sessionId, id }).first();

        if (!user) throw new AppError("User not Found", 404);

        return { user };
      }
    );
}