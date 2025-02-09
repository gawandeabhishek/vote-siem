import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  const supabase = await getSupabase()
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // When a new user is created, add them as a voter by default
    const { error } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: evt.data.id,
          role: 'voter'
        }
      ])

    if (error) {
      console.error('Error creating user role:', error)
      return NextResponse.json({ error: 'Failed to create user role' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Webhook processed' })
}

export async function GET() {
  return new Response('Hello from the webhook!', { status: 200 })
} 