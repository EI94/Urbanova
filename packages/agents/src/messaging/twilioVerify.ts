import * as crypto from 'crypto';

export interface TwilioSignatureVerification {
  isValid: boolean;
  error?: string;
}

/**
 * Verify Twilio webhook signature
 * @param authToken - Twilio auth token from environment
 * @param signature - X-Twilio-Signature header value
 * @param url - Full webhook URL
 * @param params - Request body parameters
 * @returns Verification result
 */
export function verifyTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): TwilioSignatureVerification {
  try {
    if (!authToken) {
      return {
        isValid: false,
        error: 'Missing Twilio auth token',
      };
    }

    if (!signature) {
      return {
        isValid: false,
        error: 'Missing Twilio signature header',
      };
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          if (params[key]) {
            acc[key] = params[key]!;
          }
          return acc;
        },
        {} as Record<string, string>
      );

    // Create the string to sign
    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}${value}`)
      .join('');

    const stringToSign = url + paramString;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha1', authToken)
      .update(Buffer.from(stringToSign, 'utf-8'))
      .digest('base64');

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );

    return {
      isValid,
      ...(isValid ? {} : { error: 'Signature mismatch' }),
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify Twilio webhook signature from request
 * @param authToken - Twilio auth token
 * @param signature - X-Twilio-Signature header
 * @param url - Full webhook URL
 * @param body - Request body as string
 * @returns Verification result
 */
export function verifyTwilioWebhook(
  authToken: string,
  signature: string,
  url: string,
  body: string
): TwilioSignatureVerification {
  try {
    // Parse body parameters
    const params = new URLSearchParams(body);
    const paramsObj: Record<string, string> = {};

    for (const [key, value] of Array.from(params.entries())) {
      paramsObj[key] = value;
    }

    return verifyTwilioSignature(authToken, signature, url, paramsObj);
  } catch (error) {
    return {
      isValid: false,
      error: `Body parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if webhook verification should be bypassed (for development)
 * @returns True if verification should be bypassed
 */
export function shouldBypassVerification(): boolean {
  return process.env.ALLOW_UNVERIFIED_WEBHOOKS === 'true';
}

/**
 * Get Twilio auth token from environment
 * @returns Auth token or undefined
 */
export function getTwilioAuthToken(): string | undefined {
  return process.env.TWILIO_AUTH_TOKEN;
}
