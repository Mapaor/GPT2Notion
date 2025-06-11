/**
 * Processa els blocs obtinguts de Notion i els classifica segons el seu tipus.
 * @param {Array} blocks - Llista de blocs obtinguts de Notion.
 * @returns {Object} Un objecte amb els blocs classificats per tipus.
 */
export function processBlocks(blocks) {
  const classifiedBlocks = {};

  blocks.forEach((block) => {
    const { type } = block;

    // Si el tipus no existeix al resultat, inicialitza'l com a array buit
    if (!classifiedBlocks[type]) {
      classifiedBlocks[type] = [];
    }

    // Afegeix el bloc al tipus corresponent
    classifiedBlocks[type].push(block);
  });

  return classifiedBlocks;
}