import { processInlineLatex } from './processInlineEquation';
import { processLatexBlock } from './processBlockEquation';
import fetchData from './fetchData';

export async function processBlocks(blocks, notionToken, pageId, level = 1, parentBlockId = null) {
    console.log(`NOTION TOKEN al principi de processBlocks (nivell ${level}):`, notionToken);
    const processables = [
        'paragraph',
        'bulleted_list_item',
        'numbered_list_item',
        'heading_1',
        'heading_2',
        'heading_3',
    ];

    // Limitar la recursió a 3 nivells
    if (level > 3) {
        console.log("Nivell màxim d'anidament (3) assolit. No es processaran més nivells.");
        return { numBlocsProcessats: 0, msgErrorOutput: null };
    }

    let numBlocsProcessats = 0;
    let msgErrorOutput = null;
    console.log(`Ara començarem a processar blocs de nivell ${level}.`);

    for (const block of blocks) {
        try {
            console.log(`Fent les comprovacions pel bloc al nivell ${level}...`);
            if (!block || !block.id || !block.type) continue;
            if (block.archived || block.in_trash) continue;
            const rich = block[block.type]?.rich_text || [];
            if (!processables.includes(block.type)) continue;
            console.log(`Comprovacions fetes pel bloc al nivell ${level}.`);

            // Afegim un retard per evitar saturar l'API
            await new Promise((resolve) => setTimeout(resolve, 334)); // Espera 334 mil·lisegons (Restricció de la API de Notoin: màxim 3 peticions per segon)

            if (block.type === 'paragraph') {
                const containsBlockEquation = rich.some((t) => {
                    const content = t.text?.content || '';
                    return content.startsWith('\\[') && content.endsWith('\\]');
                });

                if (containsBlockEquation) {
                    console.log(`Bloc que conté una block equation detectat al nivell ${level}.`);
                    try {
                        // Passem el level i el parentBlockId
                        const processamentLatexBlock = await retry(() => 
                            processLatexBlock(block, notionToken, pageId, level, parentBlockId), 3);
                        
                        if (processamentLatexBlock !== null) {
                            numBlocsProcessats++;
                            continue;
                        } else {
                            console.error(`Un 'paragraph' que contenia \\[ i \\] ha estat mal processat al nivell ${level}, processLatexBloc ha retornat null.`);
                            msgErrorOutput = "Un 'paragraph' que contenia \\[ i \\] ha estat mal processat, processLatexBloc ha retornat null.";
                        }
                    } catch (error) {
                        console.error(`Error inesperat al fer processLatexBlock al nivell ${level}:`, error);
                        msgErrorOutput = "Error inesperat al fer processLatexBlock.";
                    }
                }
            }

            // Si és un bloc processable, comprovem si conté inline equations
            const containsInlineLatex = rich.some((t) =>
                t.text?.content?.includes('\\(') && t.text?.content?.includes('\\)')
            );

            if (containsInlineLatex) {
                console.log(`Bloc que conté una inline equation detectat al nivell ${level}. Tipus: ${block.type}`);
                try {
                    console.log('NOTION TOKEN abans de processInlineLatex:', notionToken);
                    const processamentLatexInline = await retry(() => processInlineLatex(block, notionToken, pageId), 3);
                    if (processamentLatexInline !== null) {
                        numBlocsProcessats++;
                    }
                } catch (error) {
                    console.error(`Hi ha hagut un error inesperat fent processInlineLatex al nivell ${level}:`, error);
                    msgErrorOutput = "Hi ha hagut un error inesperat fent processInlineLatex.";
                }
            }

            // Processar els children dels blocs de tipus llista
            if ((block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') && 
                block.has_children) {
                
                console.log(`Bloc de tipus ${block.type} amb children detectat al nivell ${level}. Fent fetch dels children...`);
                try {
                    // Fer la petició per obtenir els children del bloc
                    const children = await fetchData(block.id, notionToken);
                    
                    if (children && children.length > 0) {
                        console.log(`Obtinguts ${children.length} children pel bloc ${block.id}. Processant recursivament...`);
                        // Passem el bloc actual com a parentBlockId als seus children
                        const childResult = await processBlocks(children, notionToken, pageId, level + 1, block.id);
                        numBlocsProcessats += childResult.numBlocsProcessats;
                        if (childResult.msgErrorOutput) {
                            msgErrorOutput = childResult.msgErrorOutput;
                        }
                    } else {
                        console.log(`No s'han trobat children per al bloc ${block.id} o hi ha hagut un error obtenint-los.`);
                    }
                    
                    console.log(`Finalitzat el processament dels children al nivell ${level+1} per al bloc de tipus ${block.type}`);
                } catch (error) {
                    console.error(`Error inesperat obtenint o processant els children recursivament al nivell ${level}:`, error);
                    msgErrorOutput = "Error inesperat obtenint o processant els children recursivament.";
                }
            }
        } catch (error) {
            console.error(`Error inesperat processant un bloc al nivell ${level}:`, error);
            msgErrorOutput = "Error inesperat processant un bloc.";
        }
    }

    console.log(`Tots els blocs de nivell ${level} iterats. Num de blocs processats: ${numBlocsProcessats}`);
    const outputFinal = { numBlocsProcessats, msgErrorOutput };
    console.log(`Output final del nivell ${level}:`, outputFinal);
    return outputFinal;
}

// Funció de reintents
async function retry(fn, retries) {
    while (retries > 0) {
        try {
            return await fn();
        } catch (error) {
            console.error(`Error durant l'execució. Reintents restants: ${retries - 1}`, error);
            retries--;
            if (retries === 0) throw error;
        }
    }
}