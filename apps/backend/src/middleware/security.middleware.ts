import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

/**
 * Security middleware using Helmet
 * Applies comprehensive security headers including CSP
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      // Scripts: Monaco Editor + Vite needs inline scripts and eval
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Monaco Editor + Vite HMR (dev mode)
        "'unsafe-eval'",   // Monaco Editor requires eval for syntax highlighting
        "https://cdn.jsdelivr.net", // Pyodide CDN
      ],

      // Web Workers: same-origin + blob for Monaco
      workerSrc: ["'self'", "blob:"],

      // Styles: Tailwind uses inline styles
      styleSrc: ["'self'", "'unsafe-inline'"],

      // Fonts: Monaco Editor fonts
      fontSrc: ["'self'", "data:"],

      // Images
      imgSrc: ["'self'", "data:", "blob:"],

      // WebSockets: Socket.io connection + Pyodide WASM
      connectSrc: [
        "'self'",
        "ws://localhost:*",      // Dev mode WebSocket
        "wss://*",               // Production mode WebSocket
        "https://cdn.jsdelivr.net", // Pyodide WASM files
      ],

      // Object/embed: None needed
      objectSrc: ["'none'"],

      // Frame: Prevent clickjacking
      frameAncestors: ["'none'"],
    },
  },

  // X-Frame-Options: Deny (prevent iframe embedding)
  frameguard: { action: 'deny' },

  // X-Content-Type-Options: nosniff (prevent MIME sniffing)
  noSniff: true,

  // X-XSS-Protection: Disable (CSP is more effective)
  xssFilter: false,

  // Referrer-Policy: no-referrer (privacy)
  referrerPolicy: { policy: 'no-referrer' },

  // Hide X-Powered-By header
  hidePoweredBy: true,
});

/**
 * Conditional security middleware
 * Applies full security headers in production, minimal headers in development
 */
export const conditionalSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === 'production') {
    return securityMiddleware(req, res, next);
  }

  // In development, only apply basic headers (CSP can break HMR)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};
