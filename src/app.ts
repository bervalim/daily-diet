import fastify from "fastify";
import { userRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";
import cookie from "@fastify/cookie";
import { handleErrors } from "./middlewares/handleErrors";

export const app = fastify()

app.register(cookie)

app.register(userRoutes, {
    prefix: 'users'
})

app.register(mealsRoutes, {
    prefix: 'meals'
})

app.setErrorHandler(handleErrors);

