// controllers/otpmsg.js

// Email-safe Pop-Art Color Palette
const theme = {
  bgOuter: '#FFF6E5',      // Cream comic page background
  bgInner: '#FFFFFF',      // White panel background
  primary: '#FFD23F',      // Yellow action color
  secondary: '#3FE0FF',    // Cyan action color
  accent: '#FF3D81',       // Pink action color
  black: '#171719',        // Ink black for borders/text
  gray: '#F5F5F5',         // Light gray for inset panels
  fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", // Safest fallback
  headingFont: "Impact, 'Arial Black', Arial, sans-serif", // Blocky comic feel
  monoFont: "'Courier New', Courier, monospace"
};

// 1. Template for New Registration (Welcome)
export const getWelcomeOtpTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 10px; font-family: ${theme.fontFamily}; color: ${theme.black};">
  
  <!-- Outer Shadow Table (Fakes the box-shadow) -->
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
    <tr>
      <td style="background-color: ${theme.black}; padding: 8px 8px 0px 8px; border-radius: 20px;">
        
        <!-- Inner Card Table -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${theme.bgInner}; border: 4px solid ${theme.black}; border-radius: 16px; text-align: center;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${theme.primary}; padding: 30px 20px; border-bottom: 4px solid ${theme.black}; border-radius: 12px 12px 0 0;">
              <div style="font-size: 50px; margin-bottom: 10px; line-height: 1;">👋</div>
              <h1 style="font-family: ${theme.headingFont}; font-size: 32px; color: ${theme.black}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                HEY, ${name}!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px;">
              <p style="font-size: 18px; font-weight: bold; line-height: 1.5; margin: 0 0 25px 0;">
                Welcome to the Scrapbook! You're almost in. Use this super-secret code to unlock your account.
              </p>

              <!-- Code Box -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: ${theme.gray}; border: 3px dashed ${theme.black};">
                <tr>
                  <td style="padding: 20px 30px;">
                    <span style="font-family: ${theme.headingFont}; font-size: 42px; color: ${theme.accent}; letter-spacing: 8px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Warning Tag -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 25px auto 0 auto; background-color: ${theme.black}; color: ${theme.primary}; border-radius: 8px;">
                <tr>
                  <td style="padding: 10px 15px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                    ⏳ QUICK! EXPLODES IN 10 MINS!
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; border-top: 4px solid ${theme.black}; background-color: ${theme.bgOuter}; border-radius: 0 0 12px 12px;">
              <div style="font-family: ${theme.headingFont}; font-size: 18px; color: ${theme.black};">
                THE LEGACY TRUNK 💥
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`;

// 2. Template for Login (Unverified User)
export const getLoginOtpTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 10px; font-family: ${theme.fontFamily}; color: ${theme.black};">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
    <tr>
      <td style="background-color: ${theme.black}; padding: 8px 8px 0px 8px; border-radius: 20px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${theme.bgInner}; border: 4px solid ${theme.black}; border-radius: 16px; text-align: center;">
          
          <tr>
            <td style="background-color: ${theme.secondary}; padding: 30px 20px; border-bottom: 4px solid ${theme.black}; border-radius: 12px 12px 0 0;">
              <div style="font-size: 50px; margin-bottom: 10px; line-height: 1;">🔐</div>
              <h1 style="font-family: ${theme.headingFont}; font-size: 32px; color: ${theme.black}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                WELCOME BACK!
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 20px;">
              <p style="font-size: 18px; font-weight: bold; line-height: 1.5; margin: 0 0 25px 0;">
                Looks like you need to verify your identity, ${name}. Here is your access key for the vault!
              </p>

              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: ${theme.bgInner}; border: 4px solid ${theme.black}; border-radius: 8px;">
                <tr>
                  <td style="background-color: ${theme.black}; color: ${theme.secondary}; padding: 8px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                    ACCESS KEY
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px;">
                    <span style="font-family: ${theme.headingFont}; font-size: 42px; color: ${theme.black}; letter-spacing: 8px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; font-weight: bold; color: ${theme.textMuted}; margin-top: 25px;">
                Valid for 10 minutes. Keep it secret!
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px; border-top: 4px solid ${theme.black}; background-color: ${theme.bgOuter}; border-radius: 0 0 12px 12px;">
              <div style="font-family: ${theme.headingFont}; font-size: 18px; color: ${theme.black};">
                THE LEGACY TRUNK 💥
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`;

// 3. Template for Password Reset
export const getResetPasswordTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 10px; font-family: ${theme.fontFamily}; color: ${theme.black};">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
    <tr>
      <td style="background-color: ${theme.black}; padding: 8px 8px 0px 8px; border-radius: 20px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${theme.bgInner}; border: 4px solid ${theme.black}; border-radius: 16px; text-align: center;">
          
          <tr>
            <td style="background-color: ${theme.accent}; padding: 30px 20px; border-bottom: 4px solid ${theme.black}; border-radius: 12px 12px 0 0;">
              <div style="font-size: 50px; margin-bottom: 10px; line-height: 1;">🚨</div>
              <h1 style="font-family: ${theme.headingFont}; font-size: 32px; color: ${theme.bgInner}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                LOST YOUR KEY?
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 20px;">
              <p style="font-size: 18px; font-weight: bold; line-height: 1.5; margin: 0 0 25px 0;">
                Don't panic, ${name}! Use the code below to reset your password and get back to your memories.
              </p>

              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: ${theme.primary}; border: 4px dashed ${theme.black};">
                <tr>
                  <td style="padding: 20px 30px;">
                    <span style="font-family: ${theme.headingFont}; font-size: 42px; color: ${theme.black}; letter-spacing: 8px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; font-weight: bold; color: ${theme.textMuted}; margin-top: 25px;">
                Expires in 10 minutes. Ignore this if you didn't request a reset!
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px; border-top: 4px solid ${theme.black}; background-color: ${theme.bgOuter}; border-radius: 0 0 12px 12px;">
              <div style="font-family: ${theme.headingFont}; font-size: 18px; color: ${theme.black};">
                THE LEGACY TRUNK 💥
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`;