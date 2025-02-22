import { Request, Response } from "express";
import { config } from "dotenv";
import product from "../models/product";
import customer from "../models/customer";
import { IProduct } from "../../types/model";

config();

const Graph_API_Token = process.env.GRAPH_API_TOKEN as string;
const Webhook_Verify_Token = process.env.WEBHOOK_VERIFY_TOKEN as string;

let currentFilter: Record<string, any> = {};
let selectedProduct: Partial<IProduct> = {};

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
                    let replyMessage = "Thank you 😊 for contacting. We will contact you shortly.";
                    if(message.text.body === 'hi' || message.text.body === 'hello') {
                        replyMessage = "Hi😊, You can Search products by any message query !!!";
                    } else if (!isNaN(message.text.body) && message.text.body.trim() !== '') {
                        const index = parseInt(message.text.body, 10) - 1; 
                        const products = await product.find(currentFilter).limit(5).skip(0); 
                    
                        if (index >= 0 && index < products.length) {
                            const product = products[index]; 
                    
                            const confirmMessage = `You have selected the following product:\n\n` +
                                `*Product ID:* ${index}\n` +
                                `*Product Name:* ${product.name}\n` +
                                `*Description:* ${product.description}\n` +
                                `*Price:* $${product.sellingPrice}\n` +
                                `*Category:* ${product.category}\n\n` +
                                `Would you like to confirm your order? Reply with 'yes' to confirm or 'no' to cancel.`;
                                selectedProduct = product;
                            replyMessage = confirmMessage;
                        } else {
                            const notFoundMessage = "Sorry, no product found with that index. Please select a valid number.";
                            replyMessage = notFoundMessage;
                        }
                    } else if (message.text.body.toLowerCase() === 'yes') {
                        const userMobileNumber = message.from; // Assuming message.from contains the user's mobile number
                        const cleanedMobileNumber = userMobileNumber.replace(/91$/, ''); // Remove '91' from the rightmost part
                
                        // Fetch user details from the database using the cleaned mobile number
                        const user = await customer.findOne({ mobile: cleanedMobileNumber });
                
                        if (user) {
                            // Create a new order
                            // const newOrder = new Order({
                            //     userId: user._id,
                            //     productId: selectedProduct._id, // Assuming you have the product ID
                            //     quantity: 1, // You can modify this based on your requirements
                            //     totalPrice: selectedProduct.sellingPrice,
                            //     status: 'Pending' // Set the initial status of the order
                            // });
                
                            // await newOrder.save();
                
                            const orderConfirmationMessage = `Your order for *${selectedProduct.name}* has been confirmed! 🎉\n` +
                                `*Price:* $${selectedProduct.sellingPrice}\n` +
                                // `*Order ID:* ${newOrder._id}\n` +
                                `Thank you ${user.fullName} for your purchase!`;
            
                            replyMessage = orderConfirmationMessage;
                        } else {
                            const userNotFoundMessage = "Sorry, we couldn't find your account. Please register first.";
                            replyMessage = userNotFoundMessage;
                        }
                    } else {
                        const query = message.text.body;
                        const filter: Record<string, any> = {};
                        filter.$or = [
                            { name: { $regex: query as string, $options: 'i' } },
                            { description: { $regex: query as string, $options: 'i' } }, 
                            { category: { $regex: query as string, $options: 'i' } } // Add more fields if needed
                          ];
                          currentFilter = filter;
                        const products = await product.find(filter)
                              .limit(5)
                              .skip(0);
                        console.log("Products:", products);
                        if (products.length > 0) {
                            let productMessage = "Here are some products that match your query:\n\n";
                            
                            products.forEach((product, index) => {
                                productMessage += `*Product ID:* ${index + 1}\n`;
                                productMessage += `*Product Name:* ${product.name}\n`;
                                productMessage += `*Description:* ${product.description}\n`;
                                productMessage += `*Price:* ₹${product.sellingPrice}\n`;
                                productMessage += `*Category:* ${product.category}\n`;
                                productMessage += `*To Buy:* Reply with the product number\n\n`; // Assuming you have a link to the product
                            });
                            replyMessage = productMessage;
                        } else {
                            const noResultsMessage = "Sorry, no products found matching your query.";
                            replyMessage = noResultsMessage;
                        }
                    }
                    const url = 'https://graph.facebook.com/v20.0/582090988318288/messages';

                    // const body_parameters: [String] = []; 
                    const TOKEN = `Bearer ${Graph_API_Token}`; 

                    const payload = {
                        messaging_product: 'whatsapp',
                        to: senderNumber,
                        text: {
                            body: replyMessage
                        }
                    };

                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': TOKEN,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
                } 
                
                else if (message.interactive && message.interactive.button_reply) {
                    const buttonReply = message.interactive.button_reply;
                    const buttonId = buttonReply.id; 
                    const buttonText = buttonReply.title;

                    const replyMessage = "Thank you 😊 for contacting Ridobiko Bike Rental. We will contact you shortly.";
                   console.log("Button Reply Received:", buttonText);
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