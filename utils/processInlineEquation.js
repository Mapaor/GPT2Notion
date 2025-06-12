export function processInlineLatex(block, notionToken, pageId) {
    try {
        const jsonActualitzat = separateEquations(block);
        if (jsonActualitzat === null) {
            return null;
        }
        console.log('NOTION TOKEN abans de actualitzarBlocAPI:', notionToken);
        const outputEnviarAPI = actualitzarBlocAPI(block.type, jsonActualitzat, block.id, notionToken, pageId);
        if (outputEnviarAPI === null) {
            console.error("Error al fer actualitzarBlocAPI. JSON obtingut: ", jsonActualitzat);
            return null;
        }
        return outputEnviarAPI;
    } catch (error) {
        console.error("Error inesperat a processInlineLatex:", error);
        return null;
    }
}

/**
 * Separa equacions LaTeX d'un objecte de text.
 * @param {Object} block - Objecte de text de Notion.
 * @returns {Object} Bloc actualitzat amb equacions separades.
 */
function separateEquations(block) {
    try {
        const content = block[block.type]?.rich_text?.map(rt => rt.text.content).join('') || '';
        const annotations = block[block.type]?.rich_text?.[0]?.annotations || {};
        const result = [];
        let buffer = '';
        let inInlineEquation = false;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const nextChar = content[i + 1];

            if (!inInlineEquation && char === '\\' && nextChar === '(') {
                // Hem trobat l'inici d'una equació inline
                if (buffer) {
                    result.push(buildText(buffer, annotations));
                    buffer = '';
                }
                inInlineEquation = true;
                i++; // Saltem el següent caràcter '('
            } else if (inInlineEquation && char === '\\' && nextChar === ')') {
                // Hem trobat el final d'una equació inline
                result.push(buildEquation(buffer));
                buffer = '';
                inInlineEquation = false;
                i++; // Saltem el següent caràcter ')'
            } else {
                // Afegim el caràcter al buffer
                buffer += char;
            }
        }

        // Afegim el text restant al buffer si no està buit
        if (buffer) {
            result.push(buildText(buffer, annotations));
        }

        const processedRichText = result;

        return {
            ...block,
            [block.type]: {
                ...block[block.type],
                rich_text: processedRichText,
            },
        };
    } catch (error) {
        console.error("Error a separateEquations:", error);
        return null;
    }
}

function buildEquation(eq) {
    return {
        type: 'equation',
        equation: {
            expression: eq.trim(),
        },
    };
}

function buildText(txt, annotations) {
    return {
        type: 'text',
        text: {
            content: txt,
        },
        annotations: annotations || {},
    };
}

async function actualitzarBlocAPI(blockType, jsonActualitzat, blockId, notionToken, pageId) {
    try {
        const dataToUpdate = {
            [blockType]: {
                rich_text: jsonActualitzat[blockType]?.rich_text || [], // Inclou tots els tipus (text i equation)
            },
        };

        console.log('Cos de la petició a notionPATCH:', {
            blockType,
            jsonActualitzat: dataToUpdate,
            blockId,
            notionToken,
            pageId,
        });

        const patchRes = await fetch(`/api/notionPATCH`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blockType, jsonActualitzat: dataToUpdate, blockId, notionToken, pageId }),
        });

        if (!patchRes.ok) {
            const errorDetails = await patchRes.json();
            console.error('Error de l\'API de Notion:', errorDetails);
            throw new Error(`Error actualitzant (PATCH): ${patchRes.status} - ${errorDetails.error}`);
        }
        return await patchRes.json();
    } catch (error) {
        console.error("Error a actualitzarBlocAPI:", error);
        throw error;
    }
}