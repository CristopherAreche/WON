export type AuditEventType = 
  | 'PasswordResetRequested'
  | 'PasswordResetVerified'
  | 'PasswordResetSucceeded'
  | 'PasswordResetFailed'
  | 'PasswordResetRateLimited'
  | 'PasswordResetLocked';

export interface AuditEvent {
  event: AuditEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  timestamp: Date;
}

export function logAuditEvent(event: Omit<AuditEvent, 'timestamp'>) {
  const auditEvent: AuditEvent = {
    ...event,
    timestamp: new Date(),
  };

  // In production, you would send this to a proper logging service
  // For now, we'll use structured console logging
  console.log('AUDIT_EVENT', JSON.stringify(auditEvent));

  // You could also save to database for compliance requirements
  // await prisma.auditLog.create({ data: auditEvent });
}

export function getClientInfo(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ip, userAgent };
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}