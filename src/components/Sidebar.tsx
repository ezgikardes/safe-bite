import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/search">Search</NavLink>
      <NavLink to="/my-favorite-products">My Favorite Products</NavLink>
      <NavLink to="/my-triggers">My Triggers</NavLink>
    </aside>
  );
}
