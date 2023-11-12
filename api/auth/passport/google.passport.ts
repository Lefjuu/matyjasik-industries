import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Request } from "express";
import { loginByGoogle } from "../../models/hooks/user.hooks";
import { SocialProfileI } from "../../models/interfaces/google.interface";
import { createdUserI } from "../../models/interfaces/local.interface";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK || "",
            passReqToCallback: true,
            scope: ["profile", "email"],
        },
        async (
            req: Request,
            accessToken: string,
            refreshToken: string,
            profile: SocialProfileI,
            done: (error?: Error, user?: createdUserI) => void,
        ) => {
            try {
                const socialProfile: SocialProfileI = {
                    id: profile.id,
                    provider: "google",
                    email: profile.email,
                    socialId: profile.id,
                };

                const user = await loginByGoogle(socialProfile);

                done(undefined, user);
            } catch (error) {
                console.error(error);
                done(error instanceof Error ? error : undefined);
            }
        },
    ),
);
