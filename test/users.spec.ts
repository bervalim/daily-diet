import { afterAll, beforeAll, describe, it, beforeEach, expect } from "vitest";
import { execSync } from "node:child_process";
import { app } from "../src/app";
import request from "supertest";

describe("User Routes", () => {
  beforeAll(async () => {
    app.ready();
  });

  afterAll(async () => {
    app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  describe("POST /users", () => {
    it("should be able to create a new user", async () => {
      const response = await request(app.server)
        .post("/users")
        .send({
          name: "test",
          email: "test@email.com",
        })
        .expect(201);

      const cookies = response.get("Set-Cookie");
      expect(cookies).toEqual(
        expect.arrayContaining([expect.stringContaining("sessionId")])
      );
    });
  });
});
