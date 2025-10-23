import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [item, setItem] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")  // FastAPI base endpoint
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>UMass Marketplace POC</h1>
      <p>Backend says: {message}</p>
      {item && <p>Inserted item: {item.name}</p>}
    </div>
  );
}

export default App;
