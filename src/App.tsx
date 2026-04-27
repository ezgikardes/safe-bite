import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MySafeFoods from "./pages/MySafeFoods";
import MyTriggers from "./pages/MyTriggers";
import About from "./pages/About";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/search"
          element={<Search />}
        />
        <Route
          path="/my-safe-foods"
          element={<MySafeFoods />}
        />
        <Route
          path="/my-triggers"
          element={<MyTriggers />}
        />
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetail />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
