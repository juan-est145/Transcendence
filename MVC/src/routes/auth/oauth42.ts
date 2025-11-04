import { FastifyInstance } from "fastify";
import axios from "axios";
import { createSession } from "./auth.service";

const OAUTH42_CLIENT_ID = process.env.OAUTH42_CLIENT_ID!;
const OAUTH42_CLIENT_SECRET = process.env.OAUTH42_CLIENT_SECRET!;
const OAUTH42_REDIRECT_URI = process.env.OAUTH42_REDIRECT_URI!;

export async function oauth42(fastify: FastifyInstance) {
  fastify.get("/auth/42/login", async (req, res) => {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${OAUTH42_CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH42_REDIRECT_URI)}&response_type=code`;
    return res.redirect(url);
  });

fastify.get<{ Querystring: { code?: string } }>("/auth/42/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: OAUTH42_CLIENT_ID,
      client_secret: OAUTH42_CLIENT_SECRET,
      code,
      redirect_uri: OAUTH42_REDIRECT_URI,
    });

    const tokenRes = await axios.post("https://api.intra.42.fr/oauth/token", params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.intra.42.fr/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = userRes.data;

    // Call your API's oauth42 endpoint to create/find user and get JWT
    const response = await fastify.apiClient.POST("/v1/auth/oauth42", {
      body: {
        id42: user.id.toString(),
        email: user.email,
        username: user.login,
      } as any,
    });

    if (response.error || !response.data) {
      console.error("API oauth42 error:", response.error);
      return res.status(500).view("/log-in.ejs", { 
        errors: ["Failed to authenticate with 42. Please try again."] 
      });
    }

    const authData = response.data as any;
    // Create session with JWT tokens
    fastify.jwt.verify(authData.jwt);
    createSession(req.session, { jwt: authData.jwt, refreshJwt: authData.refreshJwt });

    // Redirect to account page after successful login
    return res.redirect("/account");
    } catch (err) {
      console.error("OAuth 42 error:", err);
      if (axios.isAxiosError(err)) {
        console.error("Response data:", err.response?.data);
        console.error("Response status:", err.response?.status);
      }
      return res.view("/log-in.ejs", { 
        errors: ["OAuth authentication failed. Please try again."] 
      });
    }
  });
}
