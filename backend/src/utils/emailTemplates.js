function otpEmailTemplate(otp, title, text) {
  const otpBoxes = otp.split('').map(num => `
    <td style="border: 2px solid #efac7e; border-radius: 6px; width: 45px; height: 50px; text-align: center; vertical-align: middle; font-size: 22px; font-weight: bold; color: #ff6600;">
        ${num}
    </td>
  `).join('');

  return `
    <div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; border: 5px solid #eee; border-radius: 10px; padding: 20px; text-align: center; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="margin-bottom: 15px;">
        <img src="https://cdn.tinynet.net/tinynet.jpg" alt="Tiny Net Logo" style="width: 60px; height: 60px;">
      </div>
      <h2 style="font-size: 25px; margin: 0 0 10px;">${title}</h2>
      <p style="color: #333; font-size: 15px; margin: 0 0 20px;">
  ${text}<br>
        <strong style="color: #ff2a00ff;">This code will expire in 5 minutes.</strong>
      </p>
      <!-- OTP Table -->
        <table border="0" cellspacing="5" cellpadding="0" align="center" style="margin: 20px auto;">
            <tr>
            ${otpBoxes}
            </tr>
        </table>
      <p style="color: #777; font-size: 13px; margin-top: 20px;">
        Please do not share this code with anyone.<br>
        If you didn’t request this OTP, you can ignore this email.
      </p>
    </div>
  `;
}

module.exports = { otpEmailTemplate };
