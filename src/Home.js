import {Link} from "react-router-dom";
import { joinGame}  from "./JoinGame";
import { useEffect } from "react";

const UID = window.localStorage.getItem("UID");
const username = window.localStorage.getItem("username");
const GID = window.localStorage.getItem("GID")
const gameCode = window.localStorage.getItem("game-code")


function showAddPlayerModal(id, toShow){
  const addPlayerModal = document.getElementById(id);
  if (toShow) {
    addPlayerModal.classList.remove('hidden')
  } else {
    addPlayerModal.classList.add('hidden') 
  }
  addPlayerModal.children[0].reset()
  
}


function homeContent() {
  return (
    <div className='home'>
      <div id="home-content">
        <h2>Welcome to the Pub Golf web app </h2>
        <p>You can either create a new game or join a game created by your host</p>
        <br/>
        <div id="home-buttons">
          <button onClick={() => {showAddPlayerModal("addPlayerModal",true)}} className='btn-secondary px-4 py-2 rounded-lg font-medium'>Join Game</button>
          <Link to="/create"><button className='btn-secondary px-4 py-2 rounded-lg font-medium'>Create Game</button></Link>
        </div>
      </div>

    
    <div id="addPlayerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <form onSubmit={async (event) => {await joinGame(event); showAddPlayerModal("addPlayerModal",false)}}> 
        <div class="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Join a game</h3>
            <div class="mb-4">
                <label for="playerName" class="block mb-2">Player Name</label>
                <input type="text" id="playerName" class="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter player name" required/>
            </div>
            <div class="mb-4">
                <label for="gameCode" class="block mb-2">Game Code</label>
                <input type="text" id="gameCode" class="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter game code" required/>
            </div>
            <div class="flex justify-end space-x-3">
                <input type="submit" id="confirmAddPlayer" class="btn-primary px-4 py-2 rounded-lg font-medium" value={"Add player"}/>
                <button onClick={(event) => {event.preventDefault(); showAddPlayerModal("addPlayerModal",false)}} id="cancelAddPlayer" class="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
            </div>
        </div>
      </form>
    </div>

    <div id="resumeGameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <form onSubmit={(event) => {event.preventDefault();  window.location.replace(window.location+"game/"+gameCode); showAddPlayerModal("resumeGameModal", false)}}> 
        <div class="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Resume Game</h3>
            <div class="mb-4">
                <h4>Do you want to resume game <strong>{gameCode}</strong>. Your username was <strong>{username}</strong></h4>
            </div>
            <div class="flex justify-end space-x-3">
                <input type="submit" id="confirmAddPlayer" class="btn-primary px-4 py-2 rounded-lg font-medium" value={"Yes"}/>
                <button onClick={(event) => {event.preventDefault(); localStorage.clear(); showAddPlayerModal("resumeGameModal", false)}} id="cancelAddPlayer" class="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">No</button>
            </div>
        </div>
      </form>
    </div>

      
    </div>
  );
}


function Home() {

  console.log("home page")

  useEffect(() => {
    if (UID && username && GID && gameCode) {
      showAddPlayerModal("resumeGameModal", true)
    }
  },[])

  return homeContent()

}

export default Home
