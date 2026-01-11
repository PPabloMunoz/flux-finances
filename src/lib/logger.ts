import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'amount',
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'accessToken',
      'refreshToken',
    ],
    censor: '[REDACTED]',
  },
})

export const createChildLogger = (context: Record<string, string>) => logger.child(context)
