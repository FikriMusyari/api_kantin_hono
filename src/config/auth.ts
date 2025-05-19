import { jwtVerify, SignJWT } from "jose";


const JWT_SECRET = process.env.JWT_SECRET || "Neuroscience";


export const generateToken = async (userId: number, role: string) => {
  const jwt = new SignJWT({ userId, role })
    .setIssuedAt()
    .setExpirationTime('12h')
    .setProtectedHeader({ alg: 'HS256' });
  
  return await jwt.sign(new TextEncoder().encode(JWT_SECRET));
  
};


export const verifyToken = async (token: string) => {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return verified.payload as {userId: number, role: string};
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};