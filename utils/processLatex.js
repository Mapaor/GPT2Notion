import { buildEquation, buildText } from './separarLatex';

/**
 * Processa els blocs de Notion per separar equacions LaTeX.
 * @param {Array} blocks - Llista de blocs obtinguts de Notion.
 * @returns {Array} Una llista de blocs processats amb equacions separades.
 */
export function processLatex(blocks) {
  return blocks.map((block) => {
    if (['paragraph', 'heading_3', 'bulleted_list', 'numbered_list'].includes(block.type)) {
      const richText = block[block.type]?.rich_text || [];
      const processedRichText = richText.reduce((acc, textObj) => {
        const separated = separateEquations(textObj);
        return acc.concat(separated);
      }, []);
      return {
        ...block,
        [block.type]: {
          ...block[block.type],
          rich_text: processedRichText,
        },
      };
    }
    return block; // Retorna el bloc sense modificar si no és dels tipus especificats
  });
}

/**
 * Separa equacions LaTeX d'un objecte de text.
 * @param {Object} input - Objecte de text de Notion.
 * @returns {Array} Una llista d'objectes de text i equacions separats.
 */
function separateEquations(input = { text: { content: '' }, annotations: {} }) {
  const content = input.text.content;
  const annotations = input.annotations;
  const result = [];
  let buffer = '';
  let inInlineEquation = false;
  let inBlockEquation = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '\\' && nextChar === '(') {
      if (buffer) {
        result.push(buildText(buffer, annotations));
        buffer = '';
      }
      inInlineEquation = true;
      i++; // Salta el següent caràcter '('
    } else if (char === '\\' && nextChar === '[') {
      if (buffer) {
        result.push(buildText(buffer, annotations));
        buffer = '';
      }
      inBlockEquation = true;
      i++; // Salta el següent caràcter '['
    } else if (char === ')' && inInlineEquation) {
      result.push(buildEquation(buffer, 'inline'));
      buffer = '';
      inInlineEquation = false;
    } else if (char === ']' && inBlockEquation) {
      result.push(buildEquation(buffer, 'block'));
      buffer = '';
      inBlockEquation = false;
    } else {
      buffer += char;
    }
  }

  if (buffer) {
    result.push(buildText(buffer, annotations));
  }

  return result;
}