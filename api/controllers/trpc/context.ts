import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export async function createContextInner() {
    return {};
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
    const server = req.server;

    return {
        fastify: server,
        req,
        res,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export type InnerContext = Awaited<ReturnType<typeof createContextInner>>;
