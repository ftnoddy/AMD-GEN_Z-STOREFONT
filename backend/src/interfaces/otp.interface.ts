// src/interfaces/otp.interface.ts

export interface IOtp {
    email: string;
    otp: string;
    expiresAt: Date;
    createdAt?: Date;
}
  