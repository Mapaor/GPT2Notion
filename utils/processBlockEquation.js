export function processLatexBlock(block, notionToken, pageId, level = 1, parentBlockId = null) {
    console.log('DADES DEL BLOC abans de processar:', JSON.stringify(block, null, 2));
    let jsonBlockEquation;
    try {
        jsonBlockEquation = obtenirExpression(block);
        if (jsonBlockEquation === null) {
            return null;
        }
        console.log("obtenirExpression ha retornat:", jsonBlockEquation);
    } catch {
        console.error("obtenirExpression ha fallat inesperadament.");
        return null;
    }
    try {
        // Determina el parentId a utilitzar (el pageId o el parentBlockId si és un bloc anidat)
        const parentId = level > 1 && parentBlockId ? parentBlockId : pageId;
        console.log(`Bloc de nivell ${level}, utilitzant parentId: ${parentId}`);
        
        const resultat = enviarBlockEquationAPI(jsonBlockEquation, block.id, notionToken, parentId);
        return resultat;
    } catch (error) {
        console.error("Error enviant l'equació del bloc:", error);
        return false;
    }
}

function obtenirExpression(block) {
    if (block.type !== 'paragraph') return null; // Comprova el tipus del bloc
    const textContent = block.paragraph?.rich_text?.[0]?.text?.content || '';

    // Comprova si el text comença amb "\[" i acaba amb "\]"
    if (textContent.startsWith('\\[') && textContent.endsWith('\\]')) {
        
        // Obtenim l'expressió
        const expression = textContent
            .substring(2, textContent.length - 2)
            .trim(); // Elimina espais innecessaris
        return [
            {
                type: 'equation',
                equation: {
                    expression: expression,
                },
            },
        ];
    } else {
        return null;
    }
}

async function enviarBlockEquationAPI(jsonBlockEquation, blockId, notionToken, parentId) {
    // APPEND
    try {
        const appendRes = await fetch(`/api/notionAPPEND`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                jsonBlockEquation, 
                blockId, 
                notionToken, 
                parentId // Canviat de pageId a parentId
            }),
        });

        if (!appendRes.ok) {
            throw new Error(`Error fent APPEND: ${appendRes.status}`);
        }

        // DELETE
        const deleteRes = await fetch(`/api/notionDELETE`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blockId, notionToken, parentId }), // Canviat de pageId a parentId
        });

        if (!deleteRes.ok) {
            throw new Error(`Error fent DELETE: ${deleteRes.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error enviant bloc:', error.message);
        throw error;
    }
}