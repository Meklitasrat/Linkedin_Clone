import { mailtrapClient, sender } from "../lib/mailtrap.js"
import { createCommentNotificationEmailTemplate, createConnectionAcceptedEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplate.js"

export const sendWelcomeEmail = async(email , name , profileUrl) =>{

    const recipient = [{email}]
    try {
        const response = await mailtrapClient.send({
            from : sender,
            to : recipient,
            subject: "Welcome to linkedin",
            html: createWelcomeEmailTemplate(name , profileUrl),
            category: "welcome"
        })

        console.log("Welcome email sent successfully", response)
    } catch (error) {
        throw error
    }
}

export const sendCommentNotification = async(
    recipientEmail,
    recipientName,
    commentName, 
    postUrl,
    commentContent
) =>{

    const recipient = [{email: recipientEmail}]

    try {
        const response = await mailtrapClient.send({
            from: sender, 
            to: recipient,
            html: createCommentNotificationEmailTemplate(recipientName, commentName , postUrl, commentContent),
            category: 'comment_notification',
        });

        console.log('Comment email sent successfully', response);

    } catch (error) {
        throw error
    }
}

export const sendConnectionAcceptedEmail = async(senderEmail , senderName , recipientName , profileUrl) =>{
    const recipient = [{email: senderEmail}]

    try {
        const response = await mailtrapClient.send({
            from: senderEmail,
            to: recipient,
            subject: `${recipientName} accepted your request!`,
            html: createConnectionAcceptedEmailTemplate(senderName , recipientName , profileUrl),
            category: 'connection_accepted'
        })

        console.log('email sent successfully', response)
    } catch (error) {
        throw error
    }
}