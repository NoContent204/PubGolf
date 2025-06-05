import './App.css';
import Home from './Home'
import CreateGame from './CreateGame';
import GamePage from './GamePage';
import TeamsCreation from './TeamsCreation';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>    
      <Toaster position="top-center"/>
          <header class="bg-[#081c15] py-4 px-6 shadow-lg">
                <div class="container mx-auto flex justify-center">
                    <div class="flex items-center">
                       <svg width="80" height="80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g transform="rotate(-20 70 100)">
                          <rect x="50" y="80" width="40" height="60" rx="5" ry="5" fill="#ffcc00" stroke="#333" stroke-width="3"/>
                          <rect x="40" y="95" width="10" height="30" rx="5" ry="5" fill="none" stroke="#333" stroke-width="3"/>
                          <g fill="#fff">
                            <circle cx="60" cy="75" r="7"/>
                            <circle cx="68" cy="70" r="9"/>
                            <circle cx="76" cy="73" r="6"/>
                            <circle cx="64" cy="65" r="6"/>
                            <circle cx="72" cy="66" r="5"/>
                            <circle cx="55" cy="70" r="6"/>
                          </g>
                        </g>

                        <g transform="rotate(20 130 100)">
                          <rect x="110" y="80" width="40" height="60" rx="5" ry="5" fill="#ffcc00" stroke="#333" stroke-width="3"/>
                          <rect x="150" y="95" width="10" height="30" rx="5" ry="5" fill="none" stroke="#333" stroke-width="3"/>
                          <g fill="#fff">
                            <circle cx="120" cy="75" r="7"/>
                            <circle cx="128" cy="70" r="9"/>
                            <circle cx="136" cy="73" r="6"/>
                            <circle cx="124" cy="65" r="6"/>
                            <circle cx="132" cy="66" r="5"/>
                            <circle cx="115" cy="70" r="6"/>
                          </g>
                        </g>
                      </svg>
                        <Link to="/" class="text-2xl font-bold">Pub Golf Scorecard</Link>
                    </div>
                </div>  
            </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/game/:gamecode" element={<GamePage/>}/>
          <Route path="/teams" element={<TeamsCreation/>}/>
          <Route path="*" element={<Home/>} />
        </Routes>
    </Router>
  );
}

export default App;
