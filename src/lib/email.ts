import nodemailer from 'nodemailer';

// Create a transporter using environment variables or a default Ethereal test account
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.warn("No SMTP credentials found in .env, using test Ethereal account for emails.");
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
};

export const sendBloodRequestEmail = async (
  patientName: string,
  bloodGroup: string,
  urgency: string,
  quantity: number,
  locationName: string | null,
  contactPhone: string | null
) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"redhope Alerts" <alerts@redhope.com>', // sender address
      to: "admin@redhope.com, hospitals@redhope.com", // list of receivers (dummy for now)
      subject: `[${urgency.toUpperCase()}] Blood Request: ${bloodGroup} needed!`, // Subject line
      text: `A new blood request has been created.\n\nPatient Name: ${patientName}\nBlood Group: ${bloodGroup}\nQuantity: ${quantity} units\nUrgency: ${urgency}\nLocation: ${locationName || 'Not provided'}\nContact: ${contactPhone || 'Not provided'}\n\nPlease check the dashboard for more details.`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">New Blood Request Alert</h2>
          <p>A new blood request has been registered on redhope. Please review the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Patient Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${patientName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Blood Group:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #d32f2f; font-weight: bold;">${bloodGroup}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quantity:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${quantity} units</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Urgency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><span style="background-color: ${urgency === 'Emergency' ? '#ffebee' : '#e3f2fd'}; color: ${urgency === 'Emergency' ? '#c62828' : '#1565c0'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${urgency}</span></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${locationName || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${contactPhone || 'Not provided'}</td></tr>
          </table>
          <p style="margin-top: 20px; font-size: 14px; color: #555;">Log in to the redhope dashboard to take action.</p>
        </div>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
