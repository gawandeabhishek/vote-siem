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

    // Check if the position_id exists
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('id')
      .eq('id', position_id)
      .single();

    if (positionError || !position) {
      const { error: createPositionError } = await supabase
        .from('positions')
        .insert([{ id: position_id, title: 'New Position Title' }]); // Set a default title or modify as needed

      if (createPositionError) {
        return res.status(400).json({ error: 'Failed to create position.' });
      }
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ name, position_id, image: image || null, user_id: userId }]) // Include user_id

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Candidate added successfully', data })
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 