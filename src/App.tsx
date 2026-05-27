import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MyTriggers from "./pages/MyTriggers";
import About from "./pages/About";
import ProductDetail from "./pages/ProductDetail";
import Layout from "./components/Layout";
import MyFavoriteProducts from "./pages/MyFavoriteProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/search"
            element={<Search />}
          />
          <Route
            path="/my-favorite-products"
            element={<MyFavoriteProducts />}
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
