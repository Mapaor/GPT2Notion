import { useState } from 'react';
import styles from '../styles/PagPrincipal.module.css';

export default function Home() {
  const [pageId, setPageId] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/notionGET`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, notionToken }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderLatex = async () => {
    setError(null);
    try {
      // Obtenim els blocs de la pàgina
      const res = await fetch(`/api/notionGET`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, notionToken }),
      });

      if (!res.ok) {
        throw new Error(`Error obtenint blocs: ${res.status}`);
      }

      const json = await res.json();

      // Processa les block equations
      const appendDeleteRes = await fetch(`/api/notionAPPEND_DELETE`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks: json.results, notionToken, pageId }), // Passa també el pageId
      });

      if (!appendDeleteRes.ok) {
        throw new Error(`Error processant block equations: ${appendDeleteRes.status}`);
      }

      // Processa les inline equations
      const patchRes = await fetch(`/api/notionPATCH`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks: json.results, notionToken }), // Passa els blocs i el notionToken
      });

      if (!patchRes.ok) {
        throw new Error(`Error actualitzant blocs amb inline equations: ${patchRes.status}`);
      }

      const result = await patchRes.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
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
      <button className={styles.botoPagPrincipal} onClick={fetchData}>
        Obtenir blocs
      </button>
      <button className={styles.botoPagPrincipal} onClick={renderLatex}>
        Renderitzar LaTeX
      </button>
      <h3 className={styles.subtitle}>Output</h3>

      {error && <p className={styles.error}>Error: {error}</p>}

      {data && (
        <pre className={styles.data}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {!data && !error && (
        <p className={styles.placeholder}>
          Introdueix un Page ID i un Notion Token per obtenir els blocs.
        </p>
      )}
    </div>
  );
}