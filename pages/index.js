import { useState } from 'react';
import styles from '../styles/PagPrincipal.module.css';
import fetchData from '../utils/fetchData'; // Import correcte
import { processBlocks } from '../utils/processBlocks'; // Import correcte

export default function Home() {
  const [pageId, setPageId] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [msgOutput, setOutput] = useState(null);

  const fetchDataHandler = async () => {
    try {
      setError(null);
      setData(null);
      const result = await fetchData(pageId, notionToken, setError);
      if (result) setData(result);
    } catch (err) {
      console.error('Error inesperat:', err.message);
      setError(err.message);
    }
  };

  const renderLatex = async () => {
    let outputRebut = { numBlocsProcessats: 0, msgErrorOutput: null };
    try{
      setError(null);
      setOutput(null);
      // Obtenim els blocs
      const jsonBlocs = await fetchData(pageId, notionToken, setError); // Passa setError
      if (!jsonBlocs) return; 
      console.log('fetchData correcte');
      // Processem els blocs
      try {
        console.log("Abans de processar els blocs");
        outputRebut = await processBlocks(jsonBlocs, notionToken, pageId, 1); // Passa directament json (ja és un array de blocs)
        console.log("Blocs processats correctament");
        console.log("outputRebut:", outputRebut);
        if (outputRebut.msgErrorOutput !== null) {
          setOutput(outputRebut.msgErrorOutput);
        } else {
          if (outputRebut.numBlocsProcessats === 0) {
            setOutput("No s'han trobat blocs amb indicadors de inline o block equations.");
          } else {
            setOutput(`Tot ha anat correctament. Blocs renderitzats: ${outputRebut.numBlocsProcessats}`);
          }
        }
      } catch (err) {
        console.error('Error al fer processBlocks:', err.message);
        setError(err.message);
      }
    } catch (err){
      console.error('Error al fer fetchData:', err.message);
      setError(err.message);
    }
    console.log("renderLatex finalitzat!");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notion Children Blocks Viewer</h1>
      <h3 className={styles.subtitle}>NOTION_TOKEN</h3>
      <input
        className={styles.inputUsuari}
        type="text"
        placeholder="secret_SIVxh3uvLaILL5rOoG5xkc4HLNFCoeMtBXiUJKNEZ5s"
        value={notionToken}
        onChange={(e) => setNotionToken(e.target.value)}
      />
      <h3 className={styles.subtitle}>Page ID</h3>
      <input
        className={styles.inputUsuari}
        type="text"
        placeholder="27ce4dfb5f5543e8bcaad63dd3ea1d8b"
        value={pageId}
        onChange={(e) => setPageId(e.target.value)}
      />
      <h3 className={styles.subtitle}>Tria una opció</h3>
      <button className={styles.botoPagPrincipal} onClick={fetchDataHandler}>
        Obtenir blocs
      </button>
      <button className={styles.botoPagPrincipal} onClick={renderLatex}>
        Renderitzar LaTeX
      </button>
      <h3 className={styles.subtitle}>Output</h3>
      <div className={styles.outputContainer}>
      {error && (
        <>
          <p className={styles.subtitolOutput}>Error</p>
          <pre className={styles.error}>
            {JSON.stringify({ error }, null, 2)}
          </pre>
        </>
      )}

      {msgOutput && (
        <>
          <p className={styles.subtitolOutput}>Missatge Output</p>
          <pre className={styles.msgOutput}>
            {JSON.stringify(msgOutput, null, 2)}
          </pre>
        </>
      )}

      {data && (
        <>
          <p className={styles.subtitolOutput}>JSON Data</p>
        <pre className={styles.data}>
          {JSON.stringify(data, null, 2)}
        </pre>
        </>
      )}
      </div>
    </div>
  );
}