import twilio from 'twilio'
import "dotenv/config";

const accountSid = process.env.TWILIO_ACCOUNT_SSID as string;
const authToken = '[AuthToken]'
const client = twilio(accountSid, authToken);
const serviceSid = process.env.TWILIO_SERVICE_SSID as string;

interface VerificationResponse {
  status: string;
}

export const sendOTP = async (phoneNumber: string, code: string): Promise<string> => {
  try {
    const verificationCheck: VerificationResponse = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: code });

    console.log('Verification Status:', verificationCheck.status);
    return verificationCheck.status;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
