
import { FastifyRequest, FastifyReply } from "fastify";
import AppError from "../errors/App.error";
import { ZodError } from "zod";

export function handleErrors (
error: unknown,
request: FastifyRequest, 
reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ message: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({ message: error.flatten().fieldErrors });
  }

  
  return reply.status(500).send({ message: "Internal Server Error !" });
};