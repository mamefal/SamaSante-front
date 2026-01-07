import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { hash, compare, signJwt } from '../lib/auth.js'
import { rateLimiter } from 'hono-rate-limiter'

export const auth = new Hono()

// ... (RegisterSchema omitted for brevity if not changing)

// ... (Register route omitted)

// --- Login ---
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
}).strict()

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ message: 'Email et mot de passe requis' }, 400);
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ [LOGIN] User not found: ${email}`);
      return c.json({ message: 'Identifiants invalides' }, 401);
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ [LOGIN] Invalid password for: ${email}`);
      return c.json({ message: 'Identifiants invalides' }, 401);
    }

    // Generate JWT token
    const token = await signJwt({
      sub: user.id,
      role: user.role,
      doctorId: user.doctor?.id || null,
      patientId: user.patientId || null,
    }, '7d'); // Token valid for 7 days

    // Set secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';

    // In development, we need to set Domain to share cookie between ports
    const cookieParts = [
      `token=${token}`,
      'Path=/',
      'Max-Age=604800', // 7 days in seconds
      'SameSite=Lax',
      'HttpOnly', // Prevent JavaScript access
    ];

    // Add Secure flag only in production
    if (isProduction) {
      cookieParts.push('Secure');
    }

    const cookieOptions = cookieParts.join('; ');

    c.header('Set-Cookie', cookieOptions);

    console.log(`✅ [LOGIN] User authenticated: ${email}, Role: ${user.role}`);

    // Return user info (without password)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      doctor: user.doctor,
      patientId: user.patientId,
    };

    return c.json({ user: userData });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error);
    return c.json({ message: 'Erreur lors de la connexion' }, 500);
  }
});

// --- Logout ---
auth.post('/logout', async (c) => {
  try {
    // Clear the token cookie
    const cookieOptions = [
      'token=',
      'Path=/',
      'Max-Age=0', // Expire immediately
      'SameSite=Lax',
      'HttpOnly',
    ].join('; ');

    c.header('Set-Cookie', cookieOptions);

    console.log('✅ [LOGOUT] User logged out');
    return c.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('❌ [LOGOUT] Error:', error);
    return c.json({ message: 'Erreur lors de la déconnexion' }, 500);
  }
});
