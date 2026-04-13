import { Router } from "express";
import { selectOne } from "../db/client";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const databaseCheck = await selectOne<{ value: number }>("SELECT 1 AS value");

    response.json({
      status: "ok",
      database: databaseCheck?.value === 1 ? "connected" : "unknown",
    });
  } catch (error) {
    next(error);
  }
});

export default router;