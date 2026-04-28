import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/search">Search</NavLink>
      <NavLink to="/my-safe-foods">My Safe Foods</NavLink>
      <NavLink to="/my-triggers">My Triggers</NavLink>
      <NavLink to="/about">About</NavLink>
    </aside>
  );
}
