const resetPasswordTemplate = (resetPasswordUrl) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Reset Password Email</title>
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
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
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
			<div class="message">Reset Password Email</div>
			<div class="body">
				<p>Dear User,</p>
				<p>We received a request to reset your password for SabMiltaHai E-Commerce. To complete the password reset process,
					please click the link below:</p>
				<a class="cta" href="${resetPasswordUrl}" target="_blank">Reset Password</a>
				<p>This link is valid for 15 minutes. If you did not request a password reset, please disregard this email.
				Once your password is reset, you can use your new password to login to our platform.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
					href="mailto:innocentboyabhi1234@gmail.com">innocentboyabhi1234@gmail.com</a>. We are here to help!</div>
		</div>
	</body>
	</html>`;
};

module.exports = resetPasswordTemplate;