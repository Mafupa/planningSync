package auca.ac.rw.planningSync.util;

import java.security.SecureRandom;

public class OTPUtil {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOTP(int length) {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10)); // 0-9 digits
        }
        return otp.toString();
    }
}
