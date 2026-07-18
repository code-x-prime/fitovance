import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessAndRefreshTokens, setCookies } from "../helper/generateAccessAndRefreshTokens.js";
import { decrypt } from "../utils/encryption.js";
// Google OAuth - Redirect to Google
export const googleAuthRedirect = asyncHandler(async (req, res) => {
  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "google", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Google login is not enabled. Contact admin.");
  }
  const redirect = req.query.redirect || "/";
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/google/callback`;
  const scopes = "email profile openid";
  const state = Buffer.from(JSON.stringify({ redirect })).toString("base64url");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${setting.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${state}`;
  res.redirect(url);
});

// Facebook OAuth - Redirect to Facebook
export const facebookAuthRedirect = asyncHandler(async (req, res) => {
  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "facebook", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Facebook login is not enabled. Contact admin.");
  }
  const redirect = req.query.redirect || "/";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/facebook/callback`;
  const state = Buffer.from(JSON.stringify({ redirect })).toString("base64url");
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${setting.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=email,public_profile&state=${state}`;
  res.redirect(url);
});

// Facebook OAuth - Callback
export const facebookAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code) throw new ApiError(400, "Authorization code missing");

  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "facebook", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Facebook login is not configured");
  }

  let clientSecret = setting.clientSecret;
  if (clientSecret.startsWith("enc:")) {
    try { clientSecret = decrypt(clientSecret.replace("enc:", "")); }
    catch (e) { throw new ApiError(500, "OAuth secret decryption failed. Admin must re-save credentials."); }
  }

  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/facebook/callback`;
  const redirect = (state && (() => {
    try { return JSON.parse(Buffer.from(state, "base64url").toString()).redirect; }
    catch (_) { return "/"; }
  })()) || "/";

  const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${setting.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&client_secret=${clientSecret}&code=${code}`);
  if (!tokenRes.ok) throw new ApiError(400, "Facebook authentication failed");
  const tokens = await tokenRes.json();
  if (!tokens.access_token) throw new ApiError(400, "No access token from Facebook");

  const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokens.access_token}`);
  if (!userRes.ok) throw new ApiError(400, "Failed to fetch Facebook profile");
  const fbUser = await userRes.json();
  const { id: providerAccountId, email, name } = fbUser;
  if (!email) throw new ApiError(400, "Facebook did not provide email");

  let account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "facebook", providerAccountId } },
    include: { user: true },
  });

  let user = account?.user;
  if (!user) {
    user = await prisma.user.create({
      data: { email, signupSource: "facebook", name: name || email.split("@")[0], otpVerified: true, role: "CUSTOMER" },
    });
    await prisma.account.create({
      data: { userId: user.id, provider: "facebook", providerAccountId, accessToken: tokens.access_token },
    });
  }

  const { accessToken: jwtAccess, refreshToken: jwtRefresh } = await generateAccessAndRefreshTokens(user.id);
  setCookies(res, jwtAccess, jwtRefresh);
  res.redirect(`${baseUrl}${redirect.startsWith("/") ? redirect : "/" + redirect}`);
});

// Twitter OAuth - Redirect to Twitter
export const twitterAuthRedirect = asyncHandler(async (req, res) => {
  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "twitter", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Twitter login is not enabled. Contact admin.");
  }
  const redirect = req.query.redirect || "/";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/twitter/callback`;
  const state = Buffer.from(JSON.stringify({ redirect })).toString("base64url");
  const url = `https://twitter.com/i/oauth2/authorize?client_id=${setting.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=users.read%20tweet.read%20offline.access&response_type=code&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(url);
});

// Twitter OAuth - Callback
export const twitterAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code) throw new ApiError(400, "Authorization code missing");

  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "twitter", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Twitter login is not configured");
  }

  let clientSecret = setting.clientSecret;
  if (clientSecret.startsWith("enc:")) {
    try { clientSecret = decrypt(clientSecret.replace("enc:", "")); }
    catch (e) { throw new ApiError(500, "OAuth secret decryption failed. Admin must re-save credentials."); }
  }

  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/twitter/callback`;
  const redirect = (state && (() => {
    try { return JSON.parse(Buffer.from(state, "base64url").toString()).redirect; }
    catch (_) { return "/"; }
  })()) || "/";

  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${setting.clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
      code_verifier: "challenge",
    }),
  });
  if (!tokenRes.ok) throw new ApiError(400, "Twitter authentication failed");
  const tokens = await tokenRes.json();
  if (!tokens.access_token) throw new ApiError(400, "No access token from Twitter");

  const userRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) throw new ApiError(400, "Failed to fetch Twitter profile");
  const twitterData = await userRes.json();
  const { id: providerAccountId, name, username } = twitterData.data || {};
  if (!providerAccountId) throw new ApiError(400, "Twitter did not provide user data");

  const email = `${username}@twitter.local`;

  let account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "twitter", providerAccountId } },
    include: { user: true },
  });

  let user = account?.user;
  if (!user) {
    user = await prisma.user.create({
      data: { email, signupSource: "twitter", name: name || username, otpVerified: true, role: "CUSTOMER" },
    });
    await prisma.account.create({
      data: { userId: user.id, provider: "twitter", providerAccountId, accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    });
  }

  const { accessToken: jwtAccess, refreshToken: jwtRefresh } = await generateAccessAndRefreshTokens(user.id);
  setCookies(res, jwtAccess, jwtRefresh);
  res.redirect(`${baseUrl}${redirect.startsWith("/") ? redirect : "/" + redirect}`);
});

// Google OAuth - Callback - exchange code for tokens, create/find user, set cookies
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    throw new ApiError(400, "Authorization code missing");
  }
  const setting = await prisma.oAuthProviderSetting.findUnique({
    where: { provider: "google", isEnabled: true },
  });
  if (!setting?.clientId || !setting?.clientSecret) {
    throw new ApiError(400, "Google login is not configured");
  }
  let clientSecret = setting.clientSecret;
  if (clientSecret.startsWith("enc:")) {
    try {
      clientSecret = decrypt(clientSecret.replace("enc:", ""));
    } catch (e) {
      throw new ApiError(500, "OAuth secret decryption failed. Admin must re-save credentials.");
    }
  }
  const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const callbackUrl = `${process.env.API_URL || "http://localhost:4001/api"}/auth/google/callback`;
  const redirect = (state && (() => {
    try {
      return JSON.parse(Buffer.from(state, "base64url").toString()).redirect;
    } catch (_) {
      return "/";
    }
  })()) || "/";

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: setting.clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Google token exchange failed:", err);
    throw new ApiError(400, "Google authentication failed");
  }
  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token;
  if (!accessToken) throw new ApiError(400, "No access token from Google");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) throw new ApiError(400, "Failed to fetch Google profile");
  const googleUser = await userRes.json();
  const { id: providerAccountId, email, name, picture } = googleUser;
  if (!email) throw new ApiError(400, "Google did not provide email");

  // Find by Account only - same email + different provider = different user
  let account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: { provider: "google", providerAccountId },
    },
    include: { user: true },
  });

  let user = account?.user;
  if (!user) {
    // Create new user with signupSource=google (even if email exists with credentials)
    user = await prisma.user.create({
      data: {
        email,
        signupSource: "google",
        name: name || email.split("@")[0],
        otpVerified: true,
        role: "CUSTOMER",
      },
    });
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "google",
        providerAccountId,
        accessToken: tokens.access_token || undefined,
        refreshToken: tokens.refresh_token || undefined,
      },
    });
  }

  const { accessToken: jwtAccess, refreshToken: jwtRefresh } = await generateAccessAndRefreshTokens(user.id);
  setCookies(res, jwtAccess, jwtRefresh);

  res.redirect(`${baseUrl}${redirect.startsWith("/") ? redirect : "/" + redirect}`);
});
