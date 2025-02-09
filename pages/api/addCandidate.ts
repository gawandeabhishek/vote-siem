import { NextApiRequest, NextApiResponse } from 'next'
import { getSupabase } from '@/lib/supabase'
import { getAuth } from '@clerk/nextjs/server'

const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, position_id, image } = req.body;

    // Log the incoming request body for debugging
    console.log("Incoming request body:", req.body);

    // Get userId from Clerk
    const { userId } = getAuth(req);

    // Validate input
    if (!name || !position_id || !isValidUUID(position_id)) {
      return res.status(400).json({ error: "Valid name and position_id are required." });
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ name, position_id, image: image || null, user_id: userId }]) // Include user_id

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data })
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 