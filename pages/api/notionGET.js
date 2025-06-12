import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log('Rebent petició GET');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { pageId, notionToken } = req.body;

  if (!pageId || !notionToken) {
    return res.status(400).json({ error: 'Falten el blockId o el notionToken' });
  }

  const notion = new Client({ auth: notionToken });

  try {
    const response = await notion.blocks.children.list({
      block_id: pageId, // Obtenim els children blocs del bloc especificat
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
  console.log('GET finalitzat');
};