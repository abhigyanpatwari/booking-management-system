import { Request, Response, NextFunction } from "npm:express@4.19.2";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  };
};
