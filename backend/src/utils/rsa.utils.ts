// import crypto from 'crypto';
// import jwt from 'jsonwebtoken';

// /**
//  * RSA Utility functions for enhanced authentication security
//  */
// export class RSAUtils {
  
//   /**
//    * Validate RSA key format and strength
//    */
//   static validateRSAKey(key: string, type: 'public' | 'private'): { isValid: boolean; keySize?: number; error?: string } {
//     try {
//       if (type === 'private') {
//         const keyObject = crypto.createPrivateKey(key);
//         const keyDetails = keyObject.asymmetricKeyDetails;
        
//         return {
//           isValid: true,
//           keySize: keyDetails?.modulusLength || 2048
//         };
//       } else {
//         const keyObject = crypto.createPublicKey(key);
//         const keyDetails = keyObject.asymmetricKeyDetails;
        
//         return {
//           isValid: true,
//           keySize: keyDetails?.modulusLength || 2048
//         };
//       }
//     } catch (error) {
//       return {
//         isValid: false,
//         error: error.message
//       };
//     }
//   }

//   /**
//    * Analyze JWT token structure and security
//    */
//   static analyzeToken(token: string): {
//     header: any;
//     payload: any;
//     signature: string;
//     algorithm: string;
//     isExpired: boolean;
//     timeToExpiry?: number;
//     securityLevel: 'low' | 'medium' | 'high';
//   } {
//     const parts = token.split('.');
    
//     if (parts.length !== 3) {
//       throw new Error('Invalid JWT token format');
//     }

//     const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
//     const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
//     const signature = parts[2];

//     const currentTime = Math.floor(Date.now() / 1000);
//     const isExpired = payload.exp ? payload.exp < currentTime : false;
//     const timeToExpiry = payload.exp ? (payload.exp - currentTime) * 1000 : undefined;

//     // Determine security level based on algorithm
//     let securityLevel: 'low' | 'medium' | 'high' = 'low';
//     if (header.alg === 'RS256' || header.alg === 'RS384' || header.alg === 'RS512') {
//       securityLevel = 'high';
//     } else if (header.alg === 'HS256' || header.alg === 'HS384' || header.alg === 'HS512') {
//       securityLevel = 'medium';
//     }

//     return {
//       header,
//       payload,
//       signature,
//       algorithm: header.alg,
//       isExpired,
//       timeToExpiry,
//       securityLevel
//     };
//   }

//   /**
//    * Generate secure random salt for additional token entropy
//    */
//   static generateSecureSalt(length: number = 32): string {
//     return crypto.randomBytes(length).toString('hex');
//   }

//   /**
//    * Create token fingerprint for tracking
//    */
//   static createTokenFingerprint(token: string, additionalData?: string): string {
//     const data = additionalData ? `${token}:${additionalData}` : token;
//     return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
//   }

//   /**
//    * Verify token signature independently
//    */
//   static verifyTokenSignature(token: string, publicKey: string): boolean {
//     try {
//       const parts = token.split('.');
//       const header = parts[0];
//       const payload = parts[1];
//       const signature = parts[2];

//       const signatureBuffer = Buffer.from(signature, 'base64url');
//       const dataToVerify = `${header}.${payload}`;

//       const verifier = crypto.createVerify('SHA256');
//       verifier.update(dataToVerify);
      
//       return verifier.verify(publicKey, signatureBuffer);
//     } catch (error) {
//       return false;
//     }
//   }

//   /**
//    * Generate key usage statistics
//    */
//   static getKeyStats(publicKey: string): {
//     algorithm: string;
//     keySize: number;
//     format: string;
//     fingerprint: string;
//     creationEstimate?: Date;
//   } {
//     try {
//       const keyObject = crypto.createPublicKey(publicKey);
//       const keyDetails = keyObject.asymmetricKeyDetails;
      
//       // Generate fingerprint from public key
//       const fingerprint = crypto
//         .createHash('sha256')
//         .update(publicKey)
//         .digest('hex')
//         .substring(0, 16);

//       return {
//         algorithm: keyObject.asymmetricKeyType || 'rsa',
//         keySize: keyDetails?.modulusLength || 2048,
//         format: 'PEM',
//         fingerprint
//       };
//     } catch (error) {
//       throw new Error(`Key analysis failed: ${error.message}`);
//     }
//   }

//   /**
//    * Security recommendations based on token analysis
//    */
//   static getSecurityRecommendations(tokenAnalysis: ReturnType<typeof RSAUtils.analyzeToken>): string[] {
//     const recommendations: string[] = [];

//     if (tokenAnalysis.securityLevel === 'low') {
//       recommendations.push('⚠️ Consider upgrading to RSA-based tokens (RS256/RS384/RS512)');
//     }

//     if (tokenAnalysis.timeToExpiry && tokenAnalysis.timeToExpiry > 24 * 60 * 60 * 1000) {
//       recommendations.push('⚠️ Token expiry time is too long, consider shorter sessions');
//     }

//     if (!tokenAnalysis.payload.iss) {
//       recommendations.push('💡 Add issuer (iss) claim for better token validation');
//     }

//     if (!tokenAnalysis.payload.aud) {
//       recommendations.push('💡 Add audience (aud) claim for better token validation');
//     }

//     if (tokenAnalysis.algorithm === 'none') {
//       recommendations.push('🚨 CRITICAL: "none" algorithm is extremely insecure');
//     }

//     if (recommendations.length === 0) {
//       recommendations.push('✅ Token security configuration looks good');
//     }

//     return recommendations;
//   }

//   /**
//    * Generate security report for authentication system
//    */
//   static generateSecurityReport(publicKey: string, sampleToken?: string): {
//     keyAnalysis: ReturnType<typeof RSAUtils.getKeyStats>;
//     keyValidation: ReturnType<typeof RSAUtils.validateRSAKey>;
//     tokenAnalysis?: ReturnType<typeof RSAUtils.analyzeToken>;
//     recommendations: string[];
//     overallScore: number;
//   } {
//     const keyValidation = RSAUtils.validateRSAKey(publicKey, 'public');
//     const keyAnalysis = RSAUtils.getKeyStats(publicKey);
    
//     let tokenAnalysis;
//     let recommendations: string[] = [];
//     let overallScore = 0;

//     if (sampleToken) {
//       try {
//         tokenAnalysis = RSAUtils.analyzeToken(sampleToken);
//         recommendations = RSAUtils.getSecurityRecommendations(tokenAnalysis);
//       } catch (error) {
//         recommendations.push(`❌ Token analysis failed: ${error.message}`);
//       }
//     }

//     // Calculate overall security score (0-100)
//     if (keyValidation.isValid && keyValidation.keySize >= 2048) overallScore += 40;
//     if (tokenAnalysis?.securityLevel === 'high') overallScore += 30;
//     if (tokenAnalysis?.payload.iss && tokenAnalysis?.payload.aud) overallScore += 20;
//     if (tokenAnalysis && !tokenAnalysis.isExpired) overallScore += 10;

//     return {
//       keyAnalysis,
//       keyValidation,
//       tokenAnalysis,
//       recommendations,
//       overallScore
//     };
//   }
// }

// export default RSAUtils; 