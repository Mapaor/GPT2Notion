async function fetchData(blockId, notionToken, setError) {
    if (!blockId || !notionToken) {
        throw new Error('Falten el blockId o el notionToken');
    }
    
    try {
        // Obtenim els children blocs (ja sigui d'una pàgina o d'un bloc)
        const res = await fetch(`/api/notionGET`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pageId: blockId, notionToken }),
        });

        if (!res.ok) {
            throw new Error(`Error obtenint blocs: ${res.status}`);
        }

        const json = await res.json();
        if (!json || !json.results || !Array.isArray(json.results)) {
            throw new Error('Resposta JSON no vàlida o sense blocs.');
        }
        return json.results;
    } catch (err) {
        console.error('Error al fetchData:', err.message);
        if (setError) setError(err.message);
        return null;
    }
}

export default fetchData;