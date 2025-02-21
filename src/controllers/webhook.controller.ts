import { Request, Response } from "express";
import { config } from "dotenv";

config();

const Graph_API_Token = process.env.GRAPH_API_TOKEN as string;
const Webhook_Verify_Token = process.env.WEBHOOK_VERIFY_TOKEN as string;

export const WEBHOOK_CALLBACK = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if the mode and token are correct
    if (mode === 'subscribe' && token === Webhook_Verify_Token) {
        console.log('Webhook Verified Successfully');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
}


export const WEBHOOK_EVENT_HANDLER = async (req: Request, res: Response) => {
    const messageObject = req.body;

    if (messageObject.object) {
        if (messageObject.entry && messageObject.entry[0].changes && messageObject.entry[0].changes[0].value.messages &&
            messageObject.entry[0].changes[0].value.messages[0]) {

            const changeValue = messageObject.entry[0].changes[0].value;
            const metadata = changeValue.metadata;
            const phoneNumberId = metadata.phone_number_id;

            console.log(String(changeValue));

            if (changeValue.messages && changeValue.messages[0]) {
                const message = changeValue.messages[0];
                const messageId = message.id; 
                const from = message.from;
                const senderNumber = changeValue.contacts[0].wa_id;

                if (message.text) {
                    console.log("Message Received:", message.text);
                } 
                
                else if (message.interactive && message.interactive.button_reply) {
                    const buttonReply = message.interactive.button_reply;
                    const buttonId = buttonReply.id; 
                    const buttonText = buttonReply.title;

                    const replyMessage = "Thank you 😊 for contacting Ridobiko Bike Rental. We will contact you shortly.";
                   
                }
            } else {
                res.sendStatus(404); 
            }

        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
}