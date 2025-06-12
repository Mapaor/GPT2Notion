import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log("Rebent petició APPEND");
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { jsonBlockEquation, blockId, notionToken, parentId } = req.body;

  if (!jsonBlockEquation || !blockId || !notionToken || !parentId) {
    return res.status(400).json({ error: 'Falta o jsonBlockEquation, o blockId, o notionToken, o parentId.' });
  }

  const notion = new Client({ auth: notionToken });

  // Fem APPEND

  try {
    console.log(`Fent APPEND al bloc ${parentId} després del bloc ${blockId}`);
    await notion.blocks.children.append({
      block_id: parentId, // Utilitzem parentId (pot ser la pàgina o un bloc pare)
      children: jsonBlockEquation, // Afegim un nou fill
      after: blockId, // L'afegim en una posicio concreta
    });  
    
    // Retorna un "tot correctet" (200)
    res.status(200).json({
      message: 'Bloc afegit (APPEND) correctament.'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
  console.log("APPEND finalitzat");
}