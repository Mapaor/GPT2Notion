### General
Aquest repositori conté els fitxers d'una aplicació web amb el framework NextJS.

### Com clonar en línia
1. Fas un fork del repositori.
2. Edites (des de GitHub web mateix) el que vulguis editar (per exemple el notion_token i el page id de `pages/botoRenderLatex.js`).
3. Crees un nou projecte de Vercel.
4. Selecciones aquest repositori ja existent de GitHub (hauràs de donar accés a Vercel com a GitHub App) i tries, si no està ja per defecte, el framework 'NextJS'.
5. Es farà build i deploy tot sol, i cada vegada que hi hagi una modificació també.

### Com clonar en local
1. Et baixes el repositori com a zip, o el clones amb GitHub desktop o des de la terminal amb Git.
2. L'obres en el VSCode o similar, i fas les modificacions que necessitis.
3. Mires com queda obrint una terminal, anant al directori del repositori i fent `npm install` seguit de `npm run dev`. Entres a http://localhost:3000/ o similar per visualitzar el resultat.
4. Publiques a través de Vercel CLI o simplement fent push to origin amb GitHub Desktop o Git, al actualitzar-se el repositori de GitHub automàticament es farà un nou build i deploy a Vercel.