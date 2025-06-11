/**
 * Construeix un objecte d'equació per a Notion.
 * @param {string} eq - L'equació LaTeX.
 * @param {string} type - El tipus d'equació ('inline' o 'block').
 * @returns {Object} Objecte d'equació per a Notion.
 */
/**
 * Processa un bloc "paragraph" que conté una block equation.
 * @param {Object} block - Bloc de tipus "paragraph".
 * @returns {Object|null} Retorna el JSON per a la block equation o null si no és una block equation.
 */

export function buildEquation(eq, type) {
  return {
    type: 'equation',
    equation: {
      expression: eq.replace(/\\$/, '').trim(), // Elimina el slash extra al final i espais innecessaris
    },
  };
}

/**
 * Construeix un objecte de text per a Notion.
 * @param {string} txt - El text.
 * @param {Object} annotations - Les anotacions del text.
 * @returns {Object} Objecte de text per a Notion.
 */
export function buildText(txt, annotations) {
  return {
    type: 'text',
    text: {
      content: txt, // Preserva els espais
    },
    annotations: annotations || {}, // Assegura que les anotacions no siguin null
  };
}

/**
 * Separa equacions LaTeX d'un objecte de text.
 * @param {Object} input - Objecte de text de Notion.
 * @returns {Array} Una llista d'objectes de text i equacions separats.
 */
export function separateEquations(input = { text: { content: '' }, annotations: {} }) {
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
      // Inicia una equació inline
      if (buffer) {
        result.push(buildText(buffer, annotations));
        buffer = '';
      }
      inInlineEquation = true;
      i++; // Salta el següent caràcter '('
    } else if (char === '\\' && nextChar === '[') {
      // Inicia una equació block
      if (buffer) {
        result.push(buildText(buffer, annotations));
        buffer = '';
      }
      inBlockEquation = true;
      i++; // Salta el següent caràcter '['
    } else if (char === ')' && inInlineEquation) {
      // Finalitza una equació inline
      result.push(buildEquation(buffer, 'inline'));
      buffer = '';
      inInlineEquation = false;
    } else if (char === ']' && inBlockEquation) {
      // Finalitza una equació block
      result.push(buildEquation(buffer, 'block'));
      buffer = '';
      inBlockEquation = false;
    } else {
      buffer += char;
    }
  }

  // Afegeix el text restant com a text normal
  if (buffer) {
    result.push(buildText(buffer, annotations));
  }

  return result;
}

export function processBlockEquation(block) {
  const textContent = block.paragraph?.rich_text?.[0]?.text?.content || '';

  // Comprova si el text comença amb "\[" i acaba amb "\]"
  if (textContent.startsWith('\\[') && textContent.endsWith('\\]')) {
    // Extreu l'expressió eliminant "\[" i "\]" i escapant els slashes
    const expression = textContent
      .substring(2, textContent.length - 2) // Elimina els delimitadors "\[" i "\]"
      .trim() // Elimina espais innecessaris
      .replace(/\\/g, '\\\\'); // Escapa els slashes

    return {
      children: [
        {
          type: 'equation',
          equation: {
            expression: expression,
          },
        },
      ],
    };
  }

  return null; // Retorna null si no és una block equation
}