import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { app } from "./firebase";
import { getDatabase, ref, push, child, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Checkbox from '@mui/material/Checkbox';

function toggleBingo(checked){
  const challengeInputs = document.querySelectorAll('.challengeInput');


  const bingoSetupTable = document.getElementById("bingoSetUpTable");
  if (checked) {
    //Change the text of multiple elements with a loop
    challengeInputs.forEach(element => {
      element.required = true;
    });
    bingoSetupTable.hidden = false;
    bingoSetupTable.style.display = "flex";
    bingoSetupTable.style.flexFlow = "column wrap";

  } else {
      // Change the text of multiple elements with a loop
    challengeInputs.forEach(element => {
      element.required = false;
    });
    bingoSetupTable.hidden = true;
    bingoSetupTable.style.display = "";

  }
}

const db = getDatabase(app);

function CreateGame() {

    const nav = useNavigate();

    const [holes, setRows] = useState([]);
    const [teamsEnabled, enableTeams] = useState(false);

  
    const handleCreateGame = async (event) => {
      event.preventDefault();

      const bingoActive = false//document.getElementById("bingocheckbox").checked;

      const username = document.getElementById("playerName").value;
      
      var gameinfo = {};
      gameinfo["code"] = uuidv4().slice(0,5);
      gameinfo["holes"] = holes;
      gameinfo["teamsEnabled"] = teamsEnabled;

      if (bingoActive) {
        const challenge1 = document.getElementById("challenge1").value;
        const challenge2 = document.getElementById("challenge2").value;
        const challenge3 = document.getElementById("challenge3").value;
        const challenge4 = document.getElementById("challenge4").value;
        const challenge5 = document.getElementById("challenge5").value;
        const challenge6 = document.getElementById("challenge6").value;
        const challenge7 = document.getElementById("challenge7").value;
        const challenge8 = document.getElementById("challenge8").value;
        const challenge9 = document.getElementById("challenge9").value;
        const challenges = {"challenge1":challenge1, "challenge2":challenge2, "challenge3":challenge3, "challenge4":challenge4, "challenge5":challenge5, "challenge6":challenge6,
                          "challenge7":challenge7, "challenge8":challenge8, "challenge9":challenge9};
        gameinfo["challenges"] = challenges;

      }
      
  
      //create game object in database
      const newGameKey = push(child(ref(db), 'games')).key;
      const gameUpdates = {}
      gameUpdates["/games/"+newGameKey] = gameinfo;
      update(ref(db),gameUpdates);

      // create new user or team object for the host
      const newUserKey = push(child(ref(db), 'users')).key;
      const userUpdates = {}
      userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
      update(ref(db),userUpdates);

  
      // create new player entry for user/team and game
      const playerUpdates = {};
      const playerObject = {};
      playerObject[newUserKey] = true;
      playerUpdates["/players/"+newGameKey] = playerObject;
      update(ref(db),playerUpdates);

      window.localStorage.setItem("username", username);
      window.localStorage.setItem("UID", newUserKey);
      window.localStorage.setItem("GID", newGameKey);
      window.localStorage.setItem("game-code",gameinfo["code"])

      nav('/game/'+gameinfo["code"]);

  
    }

    function showAddHoleModal(id, toShow){
      if (id !== undefined) {
        const addHoleModal = document.getElementById(id);
        if (toShow) {
          addHoleModal.classList.remove('hidden')
        } else {
          addHoleModal.classList.add('hidden') 
        }
        addHoleModal.children[0].reset()
      }
    }

    function addHole(event) {
      event.preventDefault()
      try {
        const pubName = document.getElementById("pubName").value;
        const holePar = parseInt(document.getElementById("holePar").value);
        const drink = document.getElementById("drink").value;
                
        const updatedHoles = [...holes]
        
        updatedHoles.push({id: Math.random(), pub: pubName, drink, par: holePar, customProperty: ""})
        
        setRows(updatedHoles)
        
        showAddHoleModal("addHoleModal", false);
      } catch {
        toast.error("Failed to create hole. Please try again")
      }

    }
  
    return (
      <main class="flex-grow px-6 py-8">
        <div class="container mx-auto">
          <div class="tab-content">
            <div class="flex">
              <h2 class="text-left text-xl font-semibold mb-4">Holes</h2>
              <button class="ms-auto self-start btn-secondary px-4 py-2 rounded-lg font-medium" onClick={() => {showAddHoleModal("startGameModal", true)}}> Start Game </button>

            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div onClick={() => {showAddHoleModal("addHoleModal", true)}} class="hole-card rounded-lg shadow-lg p-5 border-2 border-dashed border-[#74c69d] flex flex-col items-center justify-center cursor-pointer hover:border-[#d8f3dc]">
                    <svg class="w-10 h-10 mb-2 text-[#74c69d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="font-medium">Add Hole</span>
              </div>

              {holes.map((hole, index) => {
                  return (
                      <React.Fragment key={index}>
                          <div class="hole-card rounded-lg shadow-lg p-5">
                              <div class="flex justify-between items-start">
                                  <div>
                                      <h3 class="font-semibold text-lg">{hole.pub}</h3>
                                      <p class="text-[#a7f3d0]">{hole.drink}</p>
                                  </div>
                                  <div class="bg-[#081c15] px-3 py-1 rounded-full flex items-center">
                                      <span class="text-sm mr-1">Par</span>
                                      <span class="font-bold">{hole.par}</span>
                                  </div>
                              </div>
                              <div class="mt-2 flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Hole {index +1}</span>
                              </div>
                              <div class="space-y-3 mt-4">
                  
                          
                              </div>                                            
                          </div>
                      </React.Fragment>
                  );
              })}

            </div>
          </div>


          <div id="addHoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden" >
            <form onSubmit={(event) => {addHole(event)}}> 
              <div class="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 class="text-xl font-semibold mb-4">A New Hole</h3>
                  <div class="mb-4">
                      <label for="pubName" class="block mb-2">Pub/Bar Name</label>
                      <input type="text" id="pubName" class="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter pub name" required/>
                  </div>
                  <div class="mb-4">
                      <label for="drink" class="block mb-2">Drink</label>
                      <input type="text" id="drink" class="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter drink" required/>
                  </div>
                  <div class="mb-4">
                      <label for="holePar" class="block mb-2">Par (expected sips)</label>
                      <input type="number" id="holePar" class="score-input w-full px-4 py-2 rounded-lg" min="1" placeholder="0" required/>                  
                  </div>
                  <div class="flex justify-end space-x-3">
                      <input type="submit" id="confirmAddHole" class="btn-primary px-4 py-2 rounded-lg font-medium" value={"Add Hole"}/>
                      <button type="reset" onClick={(event) => {event.preventDefault();showAddHoleModal("addHoleModal", false)}} id="cancelAddHole" class="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
                  </div>
              </div>
            </form>
          </div>

          <div id="startGameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <form onSubmit={async (event) => { await handleCreateGame(event); showAddHoleModal("startGameModal", false)}}> 
              <div class="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 class="text-xl font-semibold mb-4">Start game</h3>
                  <div class="mb-4">
                      <label for="enableTeams" class="block mb-2">Enable teams</label>
                      <Checkbox onChange={(e) => {enableTeams(e.target.checked)}} checked={teamsEnabled} ></Checkbox>
                  </div>
                  <div class="mb-4">
                      <label for="playerName" class="block mb-2">{teamsEnabled ? "Team Name": "Player Name"}</label>
                      <input type="text" id="playerName" class="score-input w-full px-4 py-2 rounded-lg" placeholder={teamsEnabled ? "Enter Team Name": "Enter Player Name"} required/>
                  </div>
                  <div class="flex justify-end space-x-3">
                      <input type="submit" id="confirmStartGame" class="btn-primary px-4 py-2 rounded-lg font-medium" value={"Start and Join Game"}/>
                      <button onClick={(event) => {event.preventDefault(); showAddHoleModal("startGameModal", false)}} id="cancelStartGame" class="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
                  </div>
              </div>
            </form>
          </div>

        </div>

      </main>
    );
}

export default CreateGame