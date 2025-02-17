import axios from 'axios'

export async function sendOTP(number: string, otp: string): Promise<void> {
  const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';
  try {
    const response = await axios.post(apiUrl, {
      route: 'q',
      sender_id: 'FSTSMS',
      numbers: number,
      message: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      language: 'english',
      flash: 0
    }, {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY as string, 
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return === true) {
      console.log('OTP sent successfully!')
    } else {
      console.log('Failed to send OTP!')
    }
  } catch (error) {
    throw error;
  }
}
