import { z } from "zod";
import { publicProcedure, router } from "..";

export const loggerRouter = router({
    createLog: publicProcedure
        .input(
            z.object({
                logMessage: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            console.log("Log message:", {
                message: input.logMessage,
            });
        }),
});
