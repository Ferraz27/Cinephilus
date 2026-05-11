import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Search from "./pages/Search";
import Lists from "./pages/Lists";
import ListDetails from "./pages/ListDetails";
import CreateList from "./pages/CreateList";
import Profile from "./pages/Profile";
import MediaDetails from "./pages/MediaDetails";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/create" element={<CreateList />} />
        <Route path="/lists/:id" element={<ListDetails />} />
		    <Route path="/profile"element={<Profile />}/>
        <Route path="/media/:id" element={<MediaDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

