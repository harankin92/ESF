import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'esf-secret-key-change-in-production';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            console.log(`Debug Authorization Failed: User Role [${req.user.role}], Required [${allowedRoles.join(', ')}]`);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Check if user can modify estimate
export const canModifyEstimate = (req, res, next) => {
    const { role, id: userId } = req.user;

    // Admin can modify any
    if (role === 'Admin') {
        return next();
    }

    // PM cannot modify
    if (role === 'PM') {
        return res.status(403).json({ error: 'PM role is read-only' });
    }

    // PreSale and TechLead can only modify their own
    // This will be checked in the route handler with estimate.created_by
    next();
};

export { JWT_SECRET };
