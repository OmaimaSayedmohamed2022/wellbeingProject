import crypto from 'crypto';


//  generates a random 6-digit verification code.
 
export const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};
