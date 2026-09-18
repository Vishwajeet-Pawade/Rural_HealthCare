/**
 * Official ABDM (Ayushman Bharat Digital Mission) Gateway & UIDAI Aadhaar API Service
 * Handles official OAuth2 session tokens, Aadhaar OTP authentication, and ABHA profile creation.
 */
export class ABDMGatewayService {
  private clientId = process.env.ABDM_CLIENT_ID || '';
  private clientSecret = process.env.ABDM_CLIENT_SECRET || '';
  private gatewayUrl = process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/gateway';
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Fetches an official ABDM Gateway OAuth2 Bearer Token using Client ID & Client Secret.
   * Endpoint: POST https://dev.abdm.gov.in/gateway/v0.5/sessions
   */
  async getGatewayToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'ABDM_CLIENT_ID and ABDM_CLIENT_SECRET are not configured in server/.env'
      );
    }

    const response = await fetch(`${this.gatewayUrl}/v0.5/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to authenticate with ABDM Gateway: ${errText}`);
    }

    const data: any = await response.json();
    this.accessToken = data.accessToken;
    this.tokenExpiresAt = Date.now() + (data.expiresIn || 1200) * 1000;
    return this.accessToken!;
  }

  /**
   * Initiates Aadhaar OTP verification for ABHA creation via ABDM Gateway.
   * Official ABDM Endpoint: POST /v0.5/users/auth/init
   */
  async initAadhaarAuth(aadhaarNumber: string): Promise<{ txnId: string; message: string }> {
    const token = await this.getGatewayToken();
    const cleanAadhaar = aadhaarNumber.replace(/[\s-]/g, '');

    const response = await fetch(`${this.gatewayUrl}/v0.5/users/auth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CM-ID': 'sbx',
      },
      body: JSON.stringify({
        authMethod: 'AADHAAR_OTP',
        healthid: cleanAadhaar,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ABDM Aadhaar Auth Init failed: ${errText}`);
    }

    const result: any = await response.json();
    return {
      txnId: result.txnId || `TXN-${Date.now()}`,
      message: result.message || 'OTP sent successfully to Aadhaar registered mobile number.',
    };
  }

  /**
   * Confirms Aadhaar OTP and receives official ABHA profile details.
   * Official ABDM Endpoint: POST /v0.5/users/auth/confirmWithAadhaarOtp
   */
  async confirmAadhaarOtp(txnId: string, otp: string): Promise<{ abhaAddress: string; abhaNumber: string; profile: any }> {
    const token = await this.getGatewayToken();

    const response = await fetch(`${this.gatewayUrl}/v0.5/users/auth/confirmWithAadhaarOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-CM-ID': 'sbx',
      },
      body: JSON.stringify({
        txnId,
        otp,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ABDM Aadhaar OTP Confirmation failed: ${errText}`);
    }

    const data: any = await response.json();
    return {
      abhaAddress: data.healthIdNumber || data.abhaAddress,
      abhaNumber: data.abhaNumber || data.healthIdNumber,
      profile: data,
    };
  }
}

export const abdmGatewayService = new ABDMGatewayService();
