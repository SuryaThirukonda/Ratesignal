import jwt from "jsonwebtoken";
import { prisma } from "./db.js";
import crypto from "crypto";

//rate limiting
import {rateLimit} from "express-rate-limit";

//post api token
export function requireSeedToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.RATESIGNAL_API_TOKEN;

    if (!authHeader || !authHeader.startsWith("Bearer ") || !expectedToken) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const providedToken = authHeader.slice(7);

    const provided = Buffer.from(providedToken);
    const expected = Buffer.from(expectedToken);

    if (
        provided.length != expected.length ||
        !crypto.timingSafeEqual(provided, expected)
    ) {
        return res.status(401).json({error: "Unauthorized"});
    }

    return next();
}

//require auth
export const requireAuth = async (req,res,next) => {
    try{
            const authHeader = req.headers.authorization;
    
            if (!authHeader || !authHeader.startsWith("Bearer ")){
                return res.status(401).json({error: "Unauthorized"});
            }
    
            const token = authHeader.split(" ")[1];
            let decoded;
            try{ 
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            }catch(err){
                return res.status(401).json({error: "unauthenticated"})
            }
            
    
            if (!decoded || !decoded.userId){
                return res.status(401).json({error: "unauthenticated"});
            } 
    
            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.userId
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                },
            });
    
            if (!user){
                return res.status(401).json({error: "Unauthorized"});
            }

            req.user = user;
            return next();
    
           
        }catch(err){
            next(err);
        }
};

//rate limit middleware
// *** add redis rate limiting later ***

export const authlimit = rateLimit({
    windowMs: 60*1000,
    limit: 20,
    statusCode: 429,
    message: {error: "too many auth requests"}
});

export const dataLimit = rateLimit({
    windowMs: 60*1000,
    limit: 100,
    statusCode: 429,
    message: {error: "too many data requests"}
});
