import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Send booking confirmation email FROM user's email TO user's email
 * This requires the user's email credentials
 */
export const sendBookingEmailFromUser = async (
  bookingData,
  userEmailCredentials
) => {
  try {
    const {
      userEmail,
      userName,
      movieTitle,
      showtime,
      theatreName,
      seats,
      totalAmount,
      bookingId,
    } = bookingData;
    const { email, password } = userEmailCredentials;

    // Create transporter with user's email credentials
    const userTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });

    // Verify user's email configuration
    await userTransporter.verify();

    const mailOptions = {
      from: `"${userName}" <${email}>`, // Send from user's email
      to: userEmail, // Send to user's email
      subject: `🎬 Your Movie Ticket Booking Confirmation - ${movieTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎬 CineBook</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Movie Ticket Booking Confirmation</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">Your movie ticket has been successfully booked. Here are the details:</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📋 Booking Details</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                  <strong style="color: #667eea;">Movie:</strong><br>
                  <span style="color: #333;">${movieTitle}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Theatre:</strong><br>
                  <span style="color: #333;">${theatreName}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Showtime:</strong><br>
                  <span style="color: #333;">${showtime}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Seats:</strong><br>
                  <span style="color: #333;">${seats}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Booking ID:</strong><br>
                  <span style="color: #333; font-family: monospace;">${bookingId}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Total Amount:</strong><br>
                  <span style="color: #333; font-size: 18px; font-weight: bold;">₹${totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h4 style="color: #28a745; margin-top: 0;">✅ Booking Confirmed</h4>
              <p style="color: #666; margin: 0;">Your tickets have been reserved. Please arrive at the theatre 15 minutes before the showtime.</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Important Instructions</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Please carry a valid ID proof</li>
                <li>Arrive 15 minutes before showtime</li>
                <li>Show this email at the ticket counter</li>
                <li>Keep your booking ID safe</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">Thank you for choosing CineBook!</p>
              <p style="color: #999; font-size: 12px;">This email was sent from your account.</p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await userTransporter.sendMail(mailOptions);
    console.log("Booking email sent from user account:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email from user account:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email FROM admin email TO user's email
 * This is the current setup - admin sends confirmation to user
 */
export const sendBookingEmailFromAdmin = async (bookingData) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Admin email not configured. Skipping email send.");
      return { success: false, error: "Admin email not configured" };
    }

    const {
      userEmail,
      userName,
      movieTitle,
      showtime,
      theatreName,
      seats,
      totalAmount,
      bookingId,
    } = bookingData;

    // Create admin transporter
    const adminTransporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CineBook Admin" <${process.env.EMAIL_USER}>`, // Admin sends to user
      to: userEmail,
      subject: `🎬 Movie Ticket Booking Confirmation - ${movieTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎬 CineBook</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Movie Ticket Booking Confirmation</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">Your movie ticket has been successfully booked. Here are the details:</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📋 Booking Details</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                  <strong style="color: #667eea;">Movie:</strong><br>
                  <span style="color: #333;">${movieTitle}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Theatre:</strong><br>
                  <span style="color: #333;">${theatreName}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Showtime:</strong><br>
                  <span style="color: #333;">${showtime}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Seats:</strong><br>
                  <span style="color: #333;">${seats}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Booking ID:</strong><br>
                  <span style="color: #333; font-family: monospace;">${bookingId}</span>
                </div>
                <div>
                  <strong style="color: #667eea;">Total Amount:</strong><br>
                  <span style="color: #333; font-size: 18px; font-weight: bold;">₹${totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h4 style="color: #28a745; margin-top: 0;">✅ Booking Confirmed</h4>
              <p style="color: #666; margin: 0;">Your tickets have been reserved. Please arrive at the theatre 15 minutes before the showtime.</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Important Instructions</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Please carry a valid ID proof</li>
                <li>Arrive 15 minutes before showtime</li>
                <li>Show this email at the ticket counter</li>
                <li>Keep your booking ID safe</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">Thank you for choosing CineBook!</p>
              <p style="color: #999; font-size: 12px;">This is an automated email from CineBook Admin.</p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await adminTransporter.sendMail(mailOptions);
    console.log("Booking email sent from admin account:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email from admin account:", error);
    return { success: false, error: error.message };
  }
};
