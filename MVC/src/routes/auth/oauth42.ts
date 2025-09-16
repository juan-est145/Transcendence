import { FastifyInstance } from "fastify";
import axios from "axios";

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
    const tokenRes = await axios.post("https://api.intra.42.fr/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        client_id: OAUTH42_CLIENT_ID,
        client_secret: OAUTH42_CLIENT_SECRET,
        code,
        redirect_uri: OAUTH42_REDIRECT_URI,
      },
    });
    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.intra.42.fr/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = userRes.data;

    return res.send({
      accessToken,
      id: user.id,
      username: user.login,
      email: user.email
    });
    } catch (err) {
      return res.status(500).send("OAuth2 error");
    }
  });
}
