import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  console.log("Rebent petició DELETE");
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { blockId, notionToken, parentId } = req.body; // Canviat de pageId a parentId

  if (!blockId || !notionToken || !parentId) {
    return res.status(400).json({ error: 'Falta blockId, notionToken o parentId' });
  }

  const notion = new Client({ auth: notionToken });

  try {
    // Eliminar el bloc original
    console.log(`Eliminant el bloc original ${blockId}...`);
    await notion.blocks.delete({
      block_id: blockId,
    });
    console.log(`Bloc original eliminat correctament. Ja no es farà servir.`);
    
    // Retorna un "tot correcte" (200)
    res.status(200).json({
      message: 'Bloc eliminat correctament.'
    });  
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
  console.log("DELETE finalitzat");
}