import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { pageId, notionToken } = req.body;

  console.log('pageId:', pageId);
  console.log('notionToken:', notionToken);

  if (!pageId || !notionToken) {
    return res.status(400).json({ error: 'Falten el pageId o el notionToken' });
  }

  const notion = new Client({ auth: notionToken });

  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}