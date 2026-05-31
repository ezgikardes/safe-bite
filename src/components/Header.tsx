// import { Settings, Search } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Header() {
//   const [query, setQuery] = useState("");
//   const navigate = useNavigate();

//   // Handles search submit and navigates to search page if query is valid.
//   function handleSearch(e: { preventDefault: () => void }) {
//     e.preventDefault();
//     if (query.trim()) navigate(`/search?q=${query.trim()}`);
//   }

//   return (
//     <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface px-6 py-3">
//       <formv
//         onSubmit={handleSearch}
//         className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 max-w-lg">
//         <Search className="size-4 text-text-muted shrink-0" />
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search for a product..."
//           className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
//         />
//       </form>
//       <div className="flex items-center gap-2 ml-auto">
//         <button className="rounded-lg p-2 text-text-secondary hover:bg-background transition-colors">
//           <Settings className="size-5" />
//         </button>
//       </div>
//     </header>
//   );
// }
