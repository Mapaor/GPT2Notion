import { processBlockEquation } from '../../utils/separarLatex';
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Només es permet POST' });
  }

  const { blocks, notionToken, pageId } = req.body;

  if (!blocks || !notionToken || !pageId) {
    return res.status(400).json({ error: 'Falten blocs, el notionToken o el pageId' });
  }

  const notion = new Client({ auth: notionToken });

  try {
    for (const block of blocks) {
      // Només processa blocs de tipus "paragraph"
      if (block.type === 'paragraph') {
        const blockEquation = processBlockEquation(block);

        if (blockEquation) {
          // Afegeix la block equation després del bloc original
          await notion.blocks.children.append({
            block_id: pageId, // Utilitza l'ID de la pàgina
            children: blockEquation.children,
            after: block.id, // Especifica que s'ha d'afegir després del bloc original
          });

          // Elimina el bloc original
          await notion.blocks.delete({
            block_id: block.id,
          });

          console.log(`Bloc ${block.id} processat i eliminat com a block equation.`);
        }
      }
    }

    res.status(200).json({ message: 'Blocs processats correctament.' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}