import { sign, verify } from 'jsonwebtoken';

export function generateToken(payload) { return sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' }); }
export function verifyToken(token) { return verify(token, process.env.JWT_SECRET || 'secret'); }
