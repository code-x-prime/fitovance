import { getStoreConfig } from "../../utils/storeConfig.js";

// Common inline styles to enforce white bg, black text, bold headings, no rounded corners
const commonStyles = `
    body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #000000;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border: 1px solid #000000;
        overflow: hidden;
        border-radius: 0px !important;
    }
    .header {
        background-color: #ffffff;
        color: #000000;
        text-align: center;
        padding: 30px;
        border-bottom: 2px solid #000000;
    }
    .content {
        padding: 30px;
        background-color: #ffffff;
        color: #000000;
    }
    h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    h2 {
        color: #000000;
        font-size: 22px;
        font-weight: 800;
        margin-top: 0;
        text-transform: uppercase;
    }
    p {
        margin-bottom: 20px;
        font-size: 15px;
        color: #000000;
    }
    .button-container {
        text-align: center;
        margin: 25px 0;
    }
    .button {
        display: inline-block;
        padding: 14px 30px;
        background-color: #000000;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: bold;
        font-size: 16px;
        text-align: center;
        border-radius: 0px !important;
        text-transform: uppercase;
        border: 1px solid #000000;
    }
    .features, .warning, .alternatives, .payment-details, .fee-details, .error-box, .order-details, .order-summary, .security-note, .contact-details, .message-box {
        background-color: #ffffff;
        border: 1px solid #000000;
        padding: 20px;
        margin-top: 20px;
        border-radius: 0px !important;
    }
    .feature-item, .alternative-item {
        margin-bottom: 15px;
        font-size: 14px;
    }
    .footer {
        text-align: center;
        padding: 25px;
        font-size: 13px;
        color: #000000;
        background-color: #ffffff;
        border-top: 1px solid #000000;
    }
`;

export const getVerificationTemplate = (
  verificationLink,
  storeConfig = null
) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${store.storeName}</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email</h2>
            <p>Dear Customer,</p>
            <p>Welcome to ${store.storeName} - ${store.storeDescription}. Please verify your email address to access your account:</p>
            <div class="button-container">
                <a href="${verificationLink}" class="button">Verify Email Now</a>
            </div>
            <p>If you cannot click the button, copy and paste this link into your browser: <br>${verificationLink}</p>
            <p>If you did not create an account with ${store.storeName}, please ignore this email.</p>
            
            <div class="features">
                <h3 style="margin-top: 0; text-transform: uppercase;">What you can do after verification:</h3>
                <div class="feature-item">✓ Shop for premium quality fitness nutrition</div>
                <div class="feature-item">✓ Track your orders and deliveries</div>
                <div class="feature-item">✓ Receive exclusive member offers and fitness tips</div>
                <div class="feature-item">✓ Manage your nutrition plan preferences</div>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083 or reply to this email.<br>
            <small style="color: #666;">This is an automated message. Please do not reply directly.</small>
        </div>
    </div>
</body>
</html>
`;
};

export const getEmailOtpTemplate = (
  otp,
  expiresInMinutes = 10,
  storeConfig = null
) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your One-Time Password (OTP) - ${store.storeName}</title>
    <style>
        ${commonStyles}
        .otp { font-size: 32px; letter-spacing: 8px; font-weight: 900; color: #000000; background: #ffffff; border: 2px dashed #000000; padding: 12px 16px; text-align:center; display:inline-block; border-radius: 0px !important; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Email Verification OTP</h2>
            <p>Dear Customer,</p>
            <p>Use the following One-Time Password (OTP) to verify your email for ${store.storeName}:</p>
            <p style="text-align:center; margin: 24px 0;">
                <span class="otp">${otp}</span>
            </p>
            <p style="font-size: 13px; color: #000000;">This OTP will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083<br>
            <small style="color: #666;">This is an automated message.</small>
        </div>
    </div>
</body>
</html>
`;
};

export const getDeleteTemplate = (deletionLink, storeConfig = null) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion Request - ${store.storeName}</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Account Deletion Request</h2>
            <p>Dear Customer,</p>
            <p>We received a request to delete your ${store.storeName} account. Before proceeding, please note that this will permanently remove your orders, custom plan details, and history.</p>
            <p>If you are certain about deleting your account, click the button below:</p>
            <div class="button-container">
                <a href="${deletionLink}" class="button">Confirm Deletion</a>
            </div>
            <div class="warning">
                <strong>WARNING:</strong> This action is irreversible. All your data will be permanently removed.
            </div>
            <p style="margin-top: 20px;">If you did not request this deletion, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;
};

export const getResetTemplate = (resetLink, storeConfig = null) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ${store.storeName}</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear Customer,</p>
            <p>We received a request to reset the password for your ${store.storeName} account. Click the button below to create a new password:</p>
            <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>If you did not request this password reset, please contact our support team immediately.</p>
            <p style="font-size: 13px;">This link will expire in 15 minutes for security reasons.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;
};

export const getAdminResetTemplate = (resetLink, storeConfig = null) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Password Reset - ${store.storeName}</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName} Admin</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset the admin password for <strong>${store.storeName}</strong>.</p>
            <p>Click below to set a new password:</p>
            <div class="button-container">
                <a href="${resetLink}" class="button">Reset Admin Password</a>
            </div>
            <p style="margin-top:24px; font-size:13px;">This link expires in 1 hour. If you didn't request this, secure your account and contact support.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | Admin Dashboard<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;
};

export const getFeeReceiptTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - FITOVANCE</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Payment Receipt</h2>
            <p>Dear ${data.userName},</p>
            <p>Thank you for your payment. Your transaction for nutrition plan / consultation services was successful.</p>
            <div class="payment-details">
                <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${data.amount}</p>
                <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            </div>
            <p style="margin-top: 20px;">Please find your receipt details above. We look forward to supporting your fitness journey.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getFeeNotificationTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nutrition Consulting Statement - FITOVANCE</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Consultation Statement Details</h2>
            <div class="fee-details">
                <p style="margin: 8px 0;"><strong>Title:</strong> ${data.title}</p>
                <p style="margin: 8px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
                <p style="margin: 8px 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
                ${data.description ? `<p style="margin: 8px 0;"><strong>Description:</strong> ${data.description}</p>` : ""}
            </div>
            <p>Please complete your pending details or payment at your earliest convenience to continue your consultations.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getPaymentSuccessTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - FITOVANCE</title>
    <style>
        ${commonStyles}
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #000000; }
        .detail-row:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Payment Successful</h2>
            <p>Dear ${data.userName},</p>
            <p>Your payment for nutrition consultation / fitness package has been successfully processed. Details:</p>
            
            <div class="payment-details">
                <div class="detail-row">
                    <strong>Amount Paid:</strong>
                    <span>₹${data.amount}</span>
                </div>
                <div class="detail-row">
                    <strong>Receipt Number:</strong>
                    <span>${data.receiptNumber}</span>
                </div>
                <div class="detail-row">
                    <strong>Payment ID:</strong>
                    <span>${data.paymentId}</span>
                </div>
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>${new Date(data.date).toLocaleString("en-IN")}</span>
                </div>
            </div>
            <p>Thank you for choosing FITOVANCE! Let's hit those fitness goals.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getPaymentFailureTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - FITOVANCE</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Payment Failed</h2>
            <p>Dear ${data.userName},</p>
            <p>Unfortunately, your recent payment attempt for the nutrition program could not be completed.</p>
            
            <div class="error-box">
                <h3 style="margin-top: 0;">Transaction Details:</h3>
                <p><strong>Amount:</strong> ₹${data.amount}</p>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleString("en-IN")}</p>
                <p><strong>Program Type:</strong> ${data.feeTitle}</p>
                <p><strong>Error Status:</strong> ${data.error || "Declined by card issuer"}</p>
            </div>
            <p>Please verify your payment details and retry. For queries, contact support.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getFeeUpdateTemplate = ({
  name,
  feeTitle,
  oldAmount,
  newAmount,
  oldDate,
  newDate,
  reason,
}) => `
<!DOCTYPE html>
<html>
<head>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Nutrition Plan Update</h2>
            <p>Dear ${name},</p>
            <p>This is to inform you that there has been an update to your consultation program: <strong>${feeTitle}</strong></p>
            
            <div class="features">
                <h3 style="margin-top: 0;">Update Details:</h3>
                <p><strong>Amount:</strong> ₹${oldAmount} → ₹${newAmount}</p>
                <p><strong>Due Date:</strong> ${oldDate} → ${newDate}</p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getCertificateGeneratedTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitness Achievement Unlocked - FITOVANCE</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>Milestone Completed!</h2>
            <p>Dear ${data.userName},</p>
            <p>Congratulations! You have successfully completed your training and diet module:</p>
            <h3 style="color: #000000; text-transform: uppercase;">${data.courseName}</h3>
            
            <div class="features">
                <p><strong>Your milestone certificate is ready for download!</strong></p>
                <p>Verify ID: <span style="font-family: monospace; background: #eee; padding: 4px 8px;">${data.certificateId}</span></p>
                <p>Access it from your dashboard profile. Wear it like a badge of honor on your fitness journey.</p>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getContactFormTemplate = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry - FITOVANCE</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FITOVANCE</h1>
        </div>
        <div class="content">
            <h2>New FITOVANCE Inquiry</h2>
            <div class="message-box">
                <p><strong>Subject:</strong> ${data.subject || "General Consultation Inquiry"}</p>
                <p>${data.message}</p>
            </div>
            
            <div class="contact-details">
                <p><strong>From:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} FITOVANCE | Sports Nutrition & Fitness Solutions<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;

export const getOrderConfirmationTemplate = (data, storeConfig = null) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${store.storeName}</title>
    <style>
        ${commonStyles}
        .order-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-items th {
            background-color: #000000;
            color: #ffffff;
            padding: 10px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
        }
        .order-items td {
            padding: 10px;
            border-bottom: 1px solid #000000;
            font-size: 14px;
        }
        .total-row {
            font-weight: bold;
            border-top: 2px solid #000000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName}</h1>
        </div>
        <div class="content">
            <h2>Thank You For Your Order!</h2>
            <p>Dear ${data.userName},</p>
            <p>We've received your order and are processing it. Here's a summary of your sports nutrition purchase:</p>
            
            <div class="order-details">
                <p style="margin: 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            </div>
            
            <table class="order-items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items
                      .map(
                        (item) => `
                    <tr>
                        <td>${item.name} ${item.variant}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price}</td>
                    </tr>
                    `
                      )
                      .join("")}
                    <tr class="total-row">
                        <td colspan="2">Subtotal</td>
                        <td>₹${data.subtotal}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Shipping</td>
                        <td>₹${data.shipping}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Tax</td>
                        <td>₹${data.tax}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="2">Total</td>
                        <td>₹${data.total}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="order-summary">
                <h3 style="margin-top: 0; text-transform: uppercase;">Shipping Address:</h3>
                <p style="margin: 0;">
                    ${data.shippingAddress.name}<br>
                    ${data.shippingAddress.street}<br>
                    ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                    ${data.shippingAddress.country}
                </p>
            </div>
            
            <div class="button-container">
                <a href="${process.env.FRONTEND_URL}/account/orders" class="button">Track Your Order</a>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083 or email ${store.supportEmail || store.storeEmail}<br>
            ${store.orderEmailFooter ? `<br>${store.orderEmailFooter}` : ""}
        </div>
    </div>
</body>
</html>
`;
};

export const getPartnerResetTemplate = (resetLink, storeConfig = null) => {
  const store = storeConfig || getStoreConfig();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Partner Password - ${store.storeName}</title>
    <style>${commonStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${store.storeName} Partner</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear Partner,</p>
            <p>We received a request to reset the password for your Partner account. Click below to create a new password:</p>
            <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>If you cannot click the button, copy and paste this link into your browser: <br>${resetLink}</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${store.storeName} | ${store.storeTagline}<br>
            Need help? Call us at +91 96258 39083
        </div>
    </div>
</body>
</html>
`;
};
