import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Lists from "./pages/Lists";
import ListDetails from "./pages/ListDetails";
import CreateList from "./pages/CreateList";
import FolderDetails from "./pages/FolderDetails";
import Profile from "./pages/Profile";
import MediaDetails from "./pages/MediaDetails";
import PublicProfile from "./pages/PublicProfile";
import PublicFolder from "./pages/PublicFolder";
import PublicList from "./pages/PublicList";
import Cinefilos from "./pages/Cinefilos";
import ReviewDetails from "./pages/ReviewDetails";
import ProfileMediaList from "./pages/ProfileMediaList";
import ProfileReviews from "./pages/ProfileReviews";
import PublicProfileWatched from "./pages/PublicProfileWatched";
import PublicProfileReviews from "./pages/PublicProfileReviews";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/create" element={<CreateList />} />
        <Route path="/lists/:id" element={<ListDetails />} />
        <Route path="/folders/:id" element={<FolderDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/watched" element={<ProfileMediaList />} />
        <Route path="/profile/watching" element={<ProfileMediaList />} />
        <Route path="/profile/planned" element={<ProfileMediaList />} />
        <Route path="/profile/dropped" element={<ProfileMediaList />} />
        <Route path="/profile/reviews" element={<ProfileReviews />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/u/:username/watched" element={<PublicProfileWatched />} />
        <Route path="/u/:username/reviews" element={<PublicProfileReviews />} />
        <Route path="/u/:username/folders/:folderId" element={<PublicFolder />} />
        <Route path="/u/:username/lists/:listId" element={<PublicList />} />
        <Route path="/cinefilos" element={<Cinefilos />} />
        <Route path="/media/:id" element={<MediaDetails />} />
        <Route path="/reviews/:id" element={<ReviewDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

