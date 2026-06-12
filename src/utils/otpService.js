/**
 * Anutex Parikrama - Enterprise OTP Service Abstraction
 * 
 * This module encapsulates the phone authentication OTP workflow.
 * Currently runs in simulated mode for enterprise local testing using a fixed 
 * test number, preventing billing/recaptcha issues.
 * 
 * To integrate with a real provider (e.g. Twilio, Firebase, or SMS Gateway) later,
 * simply replace the implementation of sendOTP and verifyOTP inside this class.
 */

class OTPService {
  constructor() {
    // Fixed enterprise testing phone number and code
    this.authorizedTestNumber = "+91 99999 99999";
    this.fixedOTP = "123456";
  }

  /**
   * Helper to normalize phone numbers for comparison
   */
  normalizePhoneNumber(phone) {
    if (!phone) return "";
    return phone.replace(/[\s()-+]/g, "");
  }

  /**
   * Requests a simulated SMS OTP to the specified phone number.
   * Only allows the authorized test phone number.
   * 
   * @param {string} phoneNumber 
   * @returns {Promise<{ verificationId: string, message: string }>}
   */
  async sendOTP(phoneNumber) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanInput = this.normalizePhoneNumber(phoneNumber);
    const cleanTest = this.normalizePhoneNumber(this.authorizedTestNumber);

    // Also support +91 00000 00000 and 55555 numbers for backward compatibility in mock data
    const cleanBackwardsCompatibleTest = this.normalizePhoneNumber("+91 00000 00000");

    if (cleanInput !== cleanTest && cleanInput !== cleanBackwardsCompatibleTest && !cleanInput.includes("55555")) {
      throw new Error(
        `Invalid phone number. To prevent unauthorized access and charges during testing, please use the authorized testing phone number: ${this.authorizedTestNumber}`
      );
    }

    const verificationId = `v_session_${Math.random().toString(36).substring(2, 11)}`;
    
    // Store mock OTP info in local storage with 5 minutes expiration
    localStorage.setItem(
      `enterprise_otp_${verificationId}`,
      JSON.stringify({
        phone: cleanInput,
        expectedCode: this.fixedOTP,
        expiresAt: Date.now() + 5 * 60 * 1000,
      })
    );

    console.log(
      `[OTP Service] Simulated SMS OTP generated: ${this.fixedOTP} for number: ${phoneNumber}. Session ID: ${verificationId}`
    );

    return {
      verificationId,
      message: `Simulated OTP sent to ${phoneNumber}. Use code ${this.fixedOTP} to verify.`
    };
  }

  /**
   * Verifies the user entered OTP code against the verification ID.
   * 
   * @param {string} verificationId 
   * @param {string} code 
   * @returns {Promise<{ success: boolean, uid: string }>}
   */
  async verifyOTP(verificationId, code) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const sessionDataStr = localStorage.getItem(`enterprise_otp_${verificationId}`);
    if (!sessionDataStr) {
      throw new Error("OTP session expired or invalid. Please request a new code.");
    }

    const session = JSON.parse(sessionDataStr);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(`enterprise_otp_${verificationId}`);
      throw new Error("OTP code has expired. Please request a new code.");
    }

    if (code !== session.expectedCode) {
      throw new Error("Invalid OTP code entered. Please try again.");
    }

    // Clean up OTP token after successful verification
    localStorage.removeItem(`enterprise_otp_${verificationId}`);

    return {
      success: true,
      uid: `ent-uid-${verificationId}`
    };
  }
}

export const otpService = new OTPService();
