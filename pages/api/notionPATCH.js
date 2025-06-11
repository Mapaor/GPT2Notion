import { processBlocks } from '../../utils/processBlocks';
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
    // Filtra blocs no arxivats
    const nonArchivedBlocks = blocks.filter((block) => !block.in_trash);

    // Processa els blocs
    const processedBlocks = processBlocks(nonArchivedBlocks);

    // Gestiona els blocs processats
    for (const block of processedBlocks) {
    //   console.log('Bloc abans de l\'actualitzacio:', block);

      if (block.processedAs === 'block_equation') {
        // Afegeix la block equation com a fill del bloc original
        await notion.blocks.children.append({
          block_id: block.id,
          children: block.blockEquation.children,
        });

        // Elimina el bloc original
        await notion.blocks.delete({
          block_id: block.id,
        });
      } else if (block.processedAs === 'inline_equation') {
        // Actualitza el bloc amb les inline equations processades
        const body = {
          [block.type]: {
            rich_text: block[block.type].rich_text, // Contingut processat
          },
        };

        // console.log('Cos de la peticio PATCH:', body);

        await notion.blocks.update({
          block_id: block.id, // ID del bloc a actualitzar
          ...body, // Cos de la petició
        });

        console.log(`Bloc ${block.id} actualitzat amb inline equations.`);
      }
    }

    res.status(200).json(processedBlocks);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}