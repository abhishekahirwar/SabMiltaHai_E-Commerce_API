const roleUpdated = (name, role) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Update Confirmation</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>

        <body>
            <div class="container">
            <a href="sks"><img class="logo"
            src="https://res.cloudinary.com/dgd27fi7o/image/upload/v1707299054/SabMiltaHai%20E-Commerce%27s%20Logo/ezs6lhhepmd7u2tssqlf.jpg"></a>
                <div class="message">User Role Update Notification</div>
                <div class="body">
                    <p>Hey ${name},</p>
                    <p>Your role on SabMiltaHai has been updated.</p>
                    <p>Your new role is: <span class="highlight">${role}</span>.</p>
                    <p>If you have any questions or concerns about your new role, please feel free to contact us.</p>
                </div>
                <div class="support">If you have any further questions or need assistance, please feel free to reach out to us
                    at
                    <a href="mailto:innocentboyabhi1234@gmail.com">innocentboyabhi1234@gmail.com</a>. We are here to help!
                </div>
            </div>
        </body>

    </html>`;
};

module.exports = roleUpdated;