
import nodemailer from 'nodemailer'

export const emailRegister = async (data) => {
    const {name, email, token } = data

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Project Manager" <accounts@uptask.com>',
        to: email,
        subject: "UpTask - Check your account",
        text: "Verify your account on UpTask",
        html: `
        <p>${name} Verify your account on UpTask</p>
        <p>Your Account is almost ready, only must verify on link below <a href="${process.env.FRONTEND_URL2}/confirm/${token}">Check Account</a></p>
        <p>If you do not create the account, you can ignore this message</p>
        `
    })
}

export const emailForgetPassword = async (data) => {
    const {name, email, token } = data

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: '"UpTask - Project Manager" <accounts@uptask.com>',
        to: email,
        subject: "UpTask - Reset your password",
        text: "Reset your password on UpTask",
        html: `
        <p>Hello, ${name} You are request to reset your password on UpTask</p>
        <p>Follow the link below to generate a new password <a href="${process.env.FRONTEND_URL2}/forget-password/${token}">Reset Password</a></p>
        <p>If you do not request this email, you can ignore this message</p>
        `
    })
}