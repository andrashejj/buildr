import { publicProcedure, router } from "..";

export const healthRouter = router({
    server: publicProcedure.query(() => {
        return {
            status: true,
            response: {
                message: "This is a public route.",
                timestamp: new Date().toISOString(),
            },
        };
    }),
});
