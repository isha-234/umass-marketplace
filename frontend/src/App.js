// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function App() {
//   const [message, setMessage] = useState("");
//   const [item, setItem] = useState(null);

//   useEffect(() => {
//     axios.get("http://127.0.0.1:8000/")  // FastAPI base endpoint
//       .then(res => setMessage(res.data.message))
//       .catch(err => console.error(err));

//   }, []);

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>UMass Marketplace POC</h1>
//       <p>Backend says: {message}</p>
//       {item && <p>Inserted item: {item.name}</p>}
//     </div>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
