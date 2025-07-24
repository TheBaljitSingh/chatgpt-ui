import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from '@clerk/nextjs/webhooks'

import { createUser } from "@/lib/actions/user.action";
import { UserModel } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type

    //crete user is db

    if(eventType==='user.created'){
        console.log(evt.data);

        const {id, email_addresses, image_url, first_name, last_name} = evt.data;

        const user = {
            clerkId: id,
            email: email_addresses,
            firstName:first_name,
            lastname: last_name,
            image_url: image_url
        }
        console.log(user);
        const newUser = await UserModel.create(user);

        if(newUser){
            await clerkClient.users.updateUserMetaData(id,{
                publicMetaData:{
                    userId:newUser._id
                }
            })
        }

        
    }

    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}