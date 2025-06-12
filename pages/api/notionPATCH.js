import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    console.log('Rebent petició PATCH');
    console.log('Dades rebudes al servidor:', JSON.stringify(req.body, null, 2));

    // Comprovacions
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Només es permet POST' });
    }

    const { blockType, jsonActualitzat, notionToken, blockId } = req.body;

    const validBlockTypes = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item'];
    if (!validBlockTypes.includes(blockType)) {
        return res.status(400).json({ error: 'Tipus de bloc no vàlid.' });
    }

    if (!blockType) {
        console.error('blockType no està definit.');
    }
    if (typeof jsonActualitzat !== 'object'){
        return res.status(400).json({ error: 'El JSON actualitzat no és un objecte' });
    } 
    if (!notionToken ){
        console.error('Falta el notionToken.');
        return res.status(400).json({ error: 'Falta el token de Notion.' });
    }
    if (!blockId) {
        return res.status(400).json({ error: 'Falta l\'ID del bloc.' });
    }

    const notion = new Client({ auth: notionToken });

    try {
        const dataToSend = {
            block_id: blockId,
            [blockType]: {
                rich_text: jsonActualitzat[blockType]?.rich_text || [],
            },
        };
        
        // Temporalment provem amb unes dades que SÍ haurien de funcionar
        // dataToSend = {
        //     block_id: "ffa78b8e-1ec7-4e62-9b1d-09dc44009dea",
        //     paragraph: {
        //         rich_text: [
        //             {
        //                 type: "text", // Afegeix el tipus "text"
        //                 text: {
        //                     content: "Lacinato kale"
        //                 },
        //                 annotations: {
        //                 }
        //             }
        //         ]
        //     }
        // };

        console.log('Dades enviades a Notion API:', JSON.stringify(dataToSend, null, 2));

        const response = await notion.blocks.update(dataToSend);
        console.log('Resposta de Notion API:', response);

        res.status(200).json({
            message: 'Bloc actualitzat (PATCH) correctament.',
        });
    } catch (error) {
        console.error('Error actualitzant un bloc:', error);
        res.status(500).json({ error: 'Error intern del servidor', details: error.message });
    }
}