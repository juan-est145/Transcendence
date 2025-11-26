import { FastifyInstance } from "fastify";
import axios from "axios";
import { AuthService } from "./auth.service";

const OAUTH42_CLIENT_ID = process.env.OAUTH42_CLIENT_ID!;
const OAUTH42_CLIENT_SECRET = process.env.OAUTH42_CLIENT_SECRET!;
const OAUTH42_REDIRECT_URI = process.env.OAUTH42_REDIRECT_URI!;

export async function oauth42(fastify: FastifyInstance) {
  const authService = new AuthService(fastify);

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
    
    console.log("OAuth successful, creating session with JWT");
    
    // Create session with JWT tokens
    authService.createSession(req.session, { 
      jwt: authData.jwt, 
      refreshJwt: authData.refreshJwt,
      user: authData.user || { username: user.login, email: user.email }
    });
    
    console.log("Session before save:", { 
      hasJwt: !!req.session.jwt, 
      hasRefreshJwt: !!req.session.refreshJwt 
    });

    // Save session before redirect to ensure it's persisted
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Failed to save session:", err);
          reject(err);
        } else {
          console.log("Session saved successfully");
          resolve();
        }
      });
    });
    
    console.log("Session after save:", { 
      hasJwt: !!req.session.jwt, 
      hasRefreshJwt: !!req.session.refreshJwt,
      sessionId: req.session.sessionId
    });

    // Use HTML redirect to preserve session cookie (avoids cross-site redirect issue)
    console.log("Redirecting to /account");
    return res.type('text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/account">
        </head>
        <body>
          <p>Redirecting to account page...</p>
        </body>
      </html>
    `);
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
