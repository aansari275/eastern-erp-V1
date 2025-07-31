import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  try {
    const email = profile.emails?.[0]?.value;
    const username = profile.displayName || email;
    
    console.log("Upserting user with profile:", { id: profile.id, email, username });
    
    await storage.upsertUser({
      id: profile.id.toString(), // Ensure ID is string
      email: email,
      username: username,
      firstName: profile.name?.givenName || null,
      lastName: profile.name?.familyName || null,
    });
    
    console.log("User upserted successfully");
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error; // Re-throw to handle in auth callback
  }
}

export async function setupAuth(app: Express) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error("Google OAuth credentials not found. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables. Skipping authentication setup.");
    return;
  }

  console.log("Setting up Google OAuth authentication...");

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Always use production callback URL to avoid localhost 403 errors
  const callbackURL = "https://rug-craft-tracker-abdul-rahimra19.replit.app/api/auth/google/callback";

  console.log("Using Google OAuth callback URL:", callbackURL);

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google OAuth profile received:", {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        displayName: profile.displayName
      });
      
      await upsertUser(profile);
      
      // Get the stored user from database
      const storedUser = await storage.getUser(profile.id.toString());
      if (!storedUser) {
        console.error("Failed to retrieve stored user after upsert");
        return done(new Error("User creation failed"), null);
      }
      
      console.log("Google OAuth successful for user:", storedUser.email);
      return done(null, storedUser);
    } catch (error) {
      console.error("Google OAuth strategy error:", error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Auth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { 
      scope: ["profile", "email"] 
    })
  );

  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log("Google callback received with query:", req.query);
    console.log("Request headers:", req.headers);
    
    passport.authenticate("google", (err, user, info) => {
      console.log("Google auth result:", { err, user, info });
      if (err) {
        console.error("Google auth error:", err);
        return res.status(400).send(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Error: ${err.message}</p>
              <a href="/">Return to Home</a>
            </body>
          </html>
        `);
      }
      if (!user) {
        console.log("No user returned from Google auth");
        return res.status(400).send(`
          <html>
            <body>
              <h1>Authentication Failed</h1>
              <p>No user information received from Google</p>
              <a href="/">Return to Home</a>
            </body>
          </html>
        `);
      }
      
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).send(`
            <html>
              <body>
                <h1>Login Error</h1>
                <p>Error: ${err.message}</p>
                <a href="/">Return to Home</a>
              </body>
            </html>
          `);
        }
        console.log("Google OAuth callback successful, user:", user);
        return res.send(`
          <html>
            <body>
              <h1>Login Successful!</h1>
              <p>Welcome ${user.email || user.username}!</p>
              <script>
                setTimeout(() => {
                  window.location.href = '/';
                }, 2000);
              </script>
              <p>Redirecting in 2 seconds... <a href="/">Click here if not redirected</a></p>
            </body>
          </html>
        `);
      });
    })(req, res, next);
  });

  app.get("/api/auth/google/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};