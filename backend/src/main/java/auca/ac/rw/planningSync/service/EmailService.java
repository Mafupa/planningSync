package auca.ac.rw.planningSync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetOTP(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Planning Sync OTP");
        message.setText("Your OTP for password reset is: " + otp);
        mailSender.send(message);
    }

    public void sendLoginOTP(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Planning Sync OTP");
        message.setText("Your OTP for login is: " + otp);
        mailSender.send(message);
    }
}
