import './App.css';
import Home from './Home'
import JoinGame from './JoinGame';
import CreateGame from './CreateGame';
import GamePage from './GamePage';
// import TeamsCreation from './TeamsCreation';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
       <h1 id="title"><Link to="/">Pub Golf</Link></h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame/>}/>
          <Route path="/game/:gamecode" element={<GamePage/>}/>
          {/* <Route path="/teams" element={<TeamsCreation/>}/> */}
          <Route path="*" element={<Home/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
