import { processBlockEquation, separateEquations } from './separarLatex';

/**
 * Llista de blocs compatibles per al processament.
 */
const blocsCompatibles = [
  'paragraph',
  'bulleted_list_item',
  'numbered_list_item',
  'heading_3',
  'heading_2',
  'heading_1',
];

/**
 * Processa els blocs obtinguts de Notion i els classifica segons el seu tipus,
 * i aplica el processament adequat segons el contingut.
 * @param {Array} blocks - Llista de blocs obtinguts de Notion.
 * @returns {Array} Una llista de blocs processats.
 */
export function processBlocks(blocks) {
  return blocks
    .filter((block) => blocsCompatibles.includes(block.type)) // Filtra només blocs compatibles
    .map((block) => {
      if (block.type === 'paragraph') {
        // Processa blocs "paragraph" per block equations
        const blockEquation = processBlockEquation(block);
        if (blockEquation) {
          return { ...block, processedAs: 'block_equation', blockEquation };
        }

        // Si no és una block equation, processa inline equations
        const richText = block.paragraph?.rich_text || [];
        const processedRichText = richText.reduce((acc, textObj) => {
          const separated = separateEquations(textObj); // Processa inline equations
          return acc.concat(separated);
        }, []);
        return {
          ...block,
          paragraph: {
            ...block.paragraph,
            rich_text: processedRichText,
          },
          processedAs: 'inline_equation',
        };
      } else {
        // Processa altres tipus de blocs (no "paragraph") per inline equations
        const richText = block[block.type]?.rich_text || [];
        const hasInlineEquation = richText.some((textObj) =>
          textObj.text?.content?.includes('\\(') && textObj.text?.content?.includes('\\)')
        );

        if (!hasInlineEquation) {
          // Si no conté inline equations, no es processa
          return { ...block, processedAs: null };
        }

        const processedRichText = richText.reduce((acc, textObj) => {
          const separated = separateEquations(textObj); // Processa inline equations
          return acc.concat(separated);
        }, []);
        return {
          ...block,
          [block.type]: {
            ...block[block.type],
            rich_text: processedRichText,
          },
          processedAs: 'inline_equation',
        };
      }
    });
}