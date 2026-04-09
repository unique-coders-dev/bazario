declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    length?: number;
    issuer?: string;
    qrps?: string;
  }

  interface GenerateSecretResult {
    base32: string;
    otpauth_url: string;
    hex: string;
  }

  interface VerifyOptions {
    secret: string;
    encoding?: string;
    token: string;
    window?: number;
  }

  export function generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;
  export function verify(options: VerifyOptions): boolean;
}