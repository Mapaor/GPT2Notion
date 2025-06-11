import { processLatex } from '../../utils/processLatex';
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { blocks, notionToken } = req.body;

  if (!blocks || !notionToken) {
    return res.status(400).json({ error: 'Falten blocs o el notionToken' });
  }

  const notion = new Client({ auth: notionToken });

  try {
    const processedBlocks = processLatex(blocks);

    // Actualitza els blocs a Notion
    for (const block of processedBlocks) {
      await notion.blocks.update({
        block_id: block.id,
        [block.type]: block[block.type],
      });
    }

    res.status(200).json(processedBlocks);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}