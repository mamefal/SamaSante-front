import { getCookie } from 'hono/cookie'
import { verifyJwt } from '../lib/auth.js'
import { prisma } from '../lib/prisma.js'

export const requireAuth = (_roles?: any) => async (c: any, next: any) => {
  try {
    // 1. Get token from cookie
    const token = getCookie(c, 'token')

    if (!token) {
      console.log('❌ [AUTH] No token found in cookie');
      return c.json({ message: 'Non authentifié' }, 401);
    }

    // 2. Verify JWT token
    let payload;
    try {
      payload = await verifyJwt(token);
    } catch (error) {
      console.log('❌ [AUTH] Invalid token:', error);
      return c.json({ message: 'Token invalide' }, 401);
    }

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        patientId: true,
      }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found:', payload.sub);
      return c.json({ message: 'Utilisateur non trouvé' }, 401);
    }

    // 4. Set user in context
    c.set('user', {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      doctorId: user.doctor?.id || null,
      patientId: user.patientId,
      permissions: []
    });

    console.log(`✅ [AUTH] User authenticated: ${user.email}, Role: ${user.role}`);

    await next();
  } catch (error) {
    console.error('❌ [AUTH] Error:', error);
    return c.json({ message: 'Erreur d\'authentification' }, 500);
  }
};

