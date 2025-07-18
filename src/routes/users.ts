import { FastifyInstance } from "fastify";
import { z } from "zod"
import { knex } from "../database";
import crypto from "node:crypto";

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply)=> {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.email()
        })

        const parsedBodyRequest = createUserBodySchema.safeParse(request.body)

        if(!parsedBodyRequest.success){
            throw new Error(JSON.stringify(parsedBodyRequest.error.flatten().fieldErrors))
        }

        const {name, email} = parsedBodyRequest.data

        const emailExists = await knex("Users")
            .where({ email })
            .first()

        if(emailExists) {
            return reply.status(409).send({
                error: 'Email already exists'
            })
        } 
        // console.log('validatedEmail', validatedEmail);

        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = crypto.randomUUID()
            reply.cookie('sessionId',sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex("Users").insert({
            id: crypto.randomUUID(),
            name,
            email,
            sessionId
        })

        return reply.status(201).send()
    })
}