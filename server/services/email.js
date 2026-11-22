import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter
const getTransporter = () => (transporter ||= nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465, // 587 uses STARTTLS
    auth: { user: env.email.user, pass: env.email.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
}))

export const emailConfigured = () => Boolean(env.email.user && env.email.pass)

export async function sendMail({ to, subject, html, text, replyTo }) {
    const fromName = env.restaurant.name
    await getTransporter().sendMail({
        from: `"${fromName}" <${env.email.from}>`,
        to, subject, html, text,
        ...(replyTo && { replyTo }),
    })
}