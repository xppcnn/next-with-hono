import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";

type Env = {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
};

const authRoutes = new Hono<Env>();

authRoutes.use(
	"*",
	cors({
		origin: "*", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// Better Auth handler - handles all /auth/* routes
authRoutes.on(["POST", "GET"], "/*", (c) => {
	return auth.handler(c.req.raw);
});

export default authRoutes;