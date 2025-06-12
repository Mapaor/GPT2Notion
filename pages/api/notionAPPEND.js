import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log("Rebent petició APPEND");
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { jsonBlockEquation, blockId, notionToken, pageId } = req.body;

  if (!jsonBlockEquation || !blockId || !notionToken || !pageId) {
    return res.status(400).json({ error: 'Falta o jsonBlockEquation, o BlcokId, o notionToken, o pageId.' });
  }

  const notion = new Client({ auth: notionToken });

  // Fem APPEND

  try {
    await notion.blocks.children.append({
      block_id: pageId, // Pagina
      children: jsonBlockEquation, // Afegim un nou fill (a la pagina)
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