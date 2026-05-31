import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MyTriggers from "./pages/MyTriggers";
import ProductDetail from "./pages/ProductDetail";
import Layout from "./components/Layout";
import MyFavoriteProducts from "./pages/MyFavoriteProducts";
import Scan from "./pages/Scan";
import { TriggerProvider } from "./context/TriggerProvider";
import { FavoritesProvider } from "./context/FavoritesProvider";

function App() {
  return (
    <TriggerProvider>
      <FavoritesProvider>
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
                path="/scan"
                element={<Scan />}
              />
              <Route
                path="/product/:id"
                element={<ProductDetail />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </TriggerProvider>
  );
}

export default App;
