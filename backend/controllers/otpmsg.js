// controllers/otpmsg.js

const theme = {
  bgOuter: '#04060a',      // Deep dark background
  bgInner: '#0c1020',      // Card background
  gold: '#e8c87a',         // Primary signature gold
  goldMuted: '#d4a850',    // Secondary gold
  textLight: '#ffffff',
  textMuted: '#a0aabf',
  border: '1px solid rgba(212, 168, 80, 0.25)',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  monoFont: "'Courier New', Courier, monospace"
};

// 1. Template for New Registration (Welcome)
export const getWelcomeOtpTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 20px; font-family: ${theme.fontFamily}; text-align: center; color: ${theme.textLight};">
  <div style="max-width: 500px; margin: 0 auto; background-color: ${theme.bgInner}; padding: 40px; border-radius: 16px; border: ${theme.border}; box-shadow: 0 15px 40px rgba(0,0,0,0.8);">

    <h2 style="font-size: 22px; margin-bottom: 8px; font-weight: normal;">Welcome to the Vault, <strong style="color: ${theme.gold};">${name}</strong></h2>
    <p style="color: ${theme.textMuted}; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Your bloodline has summoned you. Use the ancient key below to unlock your digital estate and begin preserving your history.
    </p>

    <div style="background: rgba(212, 168, 80, 0.05); border: 1px dashed ${theme.goldMuted}; padding: 24px; border-radius: 12px; margin-bottom: 30px;">
      <span style="font-family: ${theme.monoFont}; font-size: 42px; font-weight: bold; letter-spacing: 12px; color: ${theme.gold};">${otp}</span>
    </div>

    <p style="color: ${theme.textMuted}; font-size: 13px; font-style: italic;">
      This key will turn to dust in exactly 10 minutes.<br/>Guard it with your life.
    </p>

    <div style="margin-top: 40px; font-size: 10px; letter-spacing: 4px; color: rgba(212, 168, 80, 0.3);">
      ✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦
    </div>
  </div>
</div>
`;

// 2. Template for Login (Unverified User)
export const getLoginOtpTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 20px; font-family: ${theme.fontFamily}; text-align: center; color: ${theme.textLight};">
  <div style="max-width: 500px; margin: 0 auto; background-color: ${theme.bgInner}; padding: 40px; border-radius: 16px; border: ${theme.border}; box-shadow: 0 15px 40px rgba(0,0,0,0.8);">

    <h2 style="font-size: 22px; margin-bottom: 8px; font-weight: normal;">Welcome Back, <strong style="color: ${theme.gold};">${name}</strong></h2>
    <p style="color: ${theme.textMuted}; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      You attempt to enter the vault, but your identity remains unverified. The Oracle requires proof of your lineage.
    </p>

    <div style="background: rgba(212, 168, 80, 0.05); border: 1px solid ${theme.goldMuted}; padding: 24px; border-radius: 12px; margin-bottom: 30px;">
      <div style="font-size: 12px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Access Key</div>
      <span style="font-family: ${theme.monoFont}; font-size: 42px; font-weight: bold; letter-spacing: 12px; color: ${theme.gold};">${otp}</span>
    </div>

    <p style="color: ${theme.textMuted}; font-size: 13px; font-style: italic;">
      Valid for 10 minutes. Do not share this sequence with outsiders.
    </p>

    <div style="margin-top: 40px; font-size: 10px; letter-spacing: 4px; color: rgba(212, 168, 80, 0.3);">
      ✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦
    </div>
  </div>
</div>
`;

// 3. Template for Password Reset
export const getResetPasswordTemplate = (name, otp) => `
<div style="background-color: ${theme.bgOuter}; padding: 40px 20px; font-family: ${theme.fontFamily}; text-align: center; color: ${theme.textLight};">
  <div style="max-width: 500px; margin: 0 auto; background-color: #120505; padding: 40px; border-radius: 16px; border: 1px solid rgba(220, 60, 60, 0.3); box-shadow: 0 15px 40px rgba(0,0,0,0.8);">

    <h2 style="font-size: 22px; margin-bottom: 8px; font-weight: normal;">Forging a New Key, <strong style="color: #f08080;">${name}</strong></h2>
    <p style="color: ${theme.textMuted}; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      It seems your original key was lost to the shadows. Use this temporal code to forge a new password and reclaim your vault.
    </p>

    <div style="background: rgba(220, 60, 60, 0.05); border: 1px dashed rgba(220, 60, 60, 0.5); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
      <span style="font-family: ${theme.monoFont}; font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #f08080;">${otp}</span>
    </div>

    <p style="color: ${theme.textMuted}; font-size: 13px; font-style: italic;">
      This code expires in 10 minutes. If you did not request this, secure your account immediately.
    </p>

    <div style="margin-top: 40px; font-size: 10px; letter-spacing: 4px; color: rgba(220, 60, 60, 0.3);">
      ✦ ᚦ ᛖ ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ ✦
    </div>
  </div>
</div>
`;