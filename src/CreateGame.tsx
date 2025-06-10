import React, { useState } from "react";
import { v4 as uuidv4, v4 } from "uuid";
import { app } from "./firebase";
import { getDatabase, ref, push, child, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Checkbox from '@mui/material/Checkbox';
import { gameInfo, hole, playerInfo, teamInfo, members } from "./models";
import { showModal } from "./utils";

// function toggleBingo(checked){
//   const challengeInputs = document.querySelectorAll('.challengeInput');


//   const bingoSetupTable = document.getElementById("bingoSetUpTable");
//   if (checked) {
//     //Change the text of multiple elements with a loop
//     challengeInputs.forEach(element => {
//       element.required = true;
//     });
//     bingoSetupTable.hidden = false;
//     bingoSetupTable.style.display = "flex";
//     bingoSetupTable.style.flexFlow = "column wrap";

//   } else {
//       // Change the text of multiple elements with a loop
//     challengeInputs.forEach(element => {
//       element.required = false;
//     });
//     bingoSetupTable.hidden = true;
//     bingoSetupTable.style.display = "";

//   }
// }

const db = getDatabase(app);

function CreateGame() {

    const nav = useNavigate();

    const [holes, setRows] = useState<hole[]>([]);
    const [teamsEnabled, enableTeams] = useState(false);

  
    const handleCreateGame = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      //const bingoActive = false//document.getElementById("bingocheckbox").checked;

      const username: string = (document.getElementById("playerName") as HTMLInputElement).value;
      const teamName: string | undefined = (document.getElementById("teamName") as HTMLInputElement)?.value;
      
      const gameinfo: gameInfo = {
        holes: [],
        gameCode: "",
        teamsEnabled: false
      };
      gameinfo.holes = holes;
      gameinfo.gameCode = uuidv4().slice(0,5);
      gameinfo.teamsEnabled = teamsEnabled;

      // if (bingoActive) {
      //   const challenge1 = (document.getElementById("challenge1") as HTMLInputElement).value;
      //   const challenge2 = (document.getElementById("challenge2") as HTMLInputElement).value;
      //   const challenge3 = (document.getElementById("challenge3") as HTMLInputElement).value;
      //   const challenge4 = (document.getElementById("challenge4") as HTMLInputElement).value;
      //   const challenge5 = (document.getElementById("challenge5") as HTMLInputElement).value;
      //   const challenge6 = (document.getElementById("challenge6") as HTMLInputElement).value;
      //   const challenge7 = (document.getElementById("challenge7") as HTMLInputElement).value;
      //   const challenge8 = (document.getElementById("challenge8") as HTMLInputElement).value;
      //   const challenge9 = (document.getElementById("challenge9") as HTMLInputElement).value;
      //   const challenges = {"challenge1":challenge1, "challenge2":challenge2, "challenge3":challenge3, "challenge4":challenge4, "challenge5":challenge5, "challenge6":challenge6,
      //                     "challenge7":challenge7, "challenge8":challenge8, "challenge9":challenge9};
      //   gameinfo["challenges"] = challenges;

      // }
      
  
      try {
      
        //create game object in database
        const newGameKey = push(child(ref(db), 'games')).key;
        if (newGameKey === null) {
          throw Error("Failed to create new game key")
        }
        const gameUpdates: Record<string, gameInfo> = {}
        gameUpdates["/games/"+newGameKey] = gameinfo;
        await update(ref(db),gameUpdates);




        let newTeamKey: string | null
        let newUserKey: string | null
        if (teamsEnabled) {
          // create new team entry
          newUserKey = v4()
          newTeamKey = push(child(ref(db), 'teams')).key;
          if (newTeamKey === null) {
            throw Error("Failed to create new team key")
          }
          const teamUpdate: Record<string, Omit<teamInfo,"id">> = {}

          const members: members = {}
          members[newUserKey] = {username, "score": 0}
          teamUpdate["/teams/"+newTeamKey] = {teamName, teamScore: 0, members: members}
          await update(ref(db), teamUpdate)
          window.localStorage.setItem("teamID", newTeamKey);
        } else {
          // create new user object for the host
          newUserKey = push(child(ref(db), 'users')).key;
          if (newUserKey === null) {
            throw Error("Failed to create new user key")
          }
          const userUpdates: Record<string, Omit<playerInfo, "id">> = {}
          userUpdates["/users/"+newUserKey] = {username, "score": 0};
          await update(ref(db),userUpdates);
        }
    
        // create new player entry for user/team and game
        const playerUpdates: Record<string,Record<string, boolean>>  = {};
        const playerObject: Record<string, boolean> = {};
        playerObject[teamsEnabled ? newTeamKey! : newUserKey] = true;
        playerUpdates["/players/"+newGameKey] = playerObject;
        await update(ref(db),playerUpdates);

        window.localStorage.setItem("username", username);
        window.localStorage.setItem("UID", newUserKey);
        window.localStorage.setItem("GID", newGameKey);
        window.localStorage.setItem("game-code",gameinfo.gameCode)

        nav('/game/'+gameinfo.gameCode);
    } catch (error) {
      let errorMsg = "Failed to create game, please try again."
      if (error instanceof Error){
        errorMsg += ` ${error.message}`
      }
      toast.error(errorMsg) 
    }
  
    }

    function addHole(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      try {
        const pubName = (document.getElementById("pubName") as HTMLInputElement).value;
        const holePar = parseInt((document.getElementById("holePar") as HTMLInputElement).value);
        const drink = (document.getElementById("drink") as HTMLInputElement).value;
                
        const updatedHoles: hole[] = [...holes]
        
        updatedHoles.push({id: Math.random(), pub: pubName, drink, par: holePar})
        
        setRows(updatedHoles)
        
        showModal("addHoleModal", false);
      } catch {
        toast.error("Failed to create hole. Please try again")
      }

    }
  
    return (
      <main className="flex-grow px-6 py-8">
        <div className="container mx-auto">
          <div className="tab-content">
            <div className="flex">
              <h2 className="text-left text-xl font-semibold mb-4">Holes</h2>
              <button className="ms-auto self-start btn-secondary px-4 py-2 rounded-lg font-medium" onClick={() => {showModal("startGameModal", true)}}> Start Game </button>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div onClick={() => {showModal("addHoleModal", true)}} className="hole-card rounded-lg shadow-lg p-5 border-2 border-dashed border-[#74c69d] flex flex-col items-center justify-center cursor-pointer hover:border-[#d8f3dc]">
                    <svg className="w-10 h-10 mb-2 text-[#74c69d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span className="font-medium">Add Hole</span>
              </div>

              {holes.map((hole: hole, index: number) => {
                  return (
                      <React.Fragment key={index}>
                          <div className="hole-card rounded-lg shadow-lg p-5">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="font-semibold text-lg">{hole.pub}</h3>
                                      <p className="text-[#a7f3d0]">{hole.drink}</p>
                                  </div>
                                  <div className="bg-[#081c15] px-3 py-1 rounded-full flex items-center">
                                      <span className="text-sm mr-1">Par</span>
                                      <span className="font-bold">{hole.par}</span>
                                  </div>
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                  <span className="text-sm text-gray-300">Hole {index +1}</span>
                              </div>
                              <div className="space-y-3 mt-4">
                  
                          
                              </div>                                            
                          </div>
                      </React.Fragment>
                  );
              })}

            </div>
          </div>


          <div id="addHoleModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden" >
            <form onSubmit={(event) => {addHole(event)}}> 
              <div className="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold mb-4">A New Hole</h3>
                  <div className="mb-4">
                      <label htmlFor="pubName" className="block mb-2">Pub/Bar Name</label>
                      <input type="text" id="pubName" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter pub name" required/>
                  </div>
                  <div className="mb-4">
                      <label htmlFor="drink" className="block mb-2">Drink</label>
                      <input type="text" id="drink" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter drink" required/>
                  </div>
                  <div className="mb-4">
                      <label htmlFor="holePar" className="block mb-2">Par (expected sips)</label>
                      <input type="number" id="holePar" className="score-input w-full px-4 py-2 rounded-lg" min="1" placeholder="0" required/>                  
                  </div>
                  <div className="flex justify-end space-x-3">
                      <input type="submit" id="confirmAddHole" className="btn-primary px-4 py-2 rounded-lg font-medium" value={"Add Hole"}/>
                      <button type="reset" onClick={(event) => {event.preventDefault();showModal("addHoleModal", false)}} id="cancelAddHole" className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
                  </div>
              </div>
            </form>
          </div>

          <div id="startGameModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <form onSubmit={async (event) => { await handleCreateGame(event); showModal("startGameModal", false)}}> 
              <div className="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold mb-4">Start game</h3>
                  <div className="mb-4">
                      <label htmlFor="enableTeams" className="block mb-2">Enable teams</label>
                      <Checkbox onChange={(e) => {enableTeams(e.target.checked)}} checked={teamsEnabled} ></Checkbox>
                  </div>
                  {teamsEnabled ? <div className="mb-4">
                      <label htmlFor="teamName" className="block mb-2">Team Name</label>
                      <input type="text" id="teamName" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter Team Name" required/>
                  </div> : <></>}
                  <div className="mb-4">
                      <label htmlFor="playerName" className="block mb-2">Player Name</label>
                      <input type="text" id="playerName" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter Player Name" required/>
                  </div>
                  <div className="flex justify-end space-x-3">
                      <input type="submit" id="confirmStartGame" className="btn-primary px-4 py-2 rounded-lg font-medium" value={"Start and Join Game"}/>
                      <button onClick={(event) => {event.preventDefault(); showModal("startGameModal", false)}} id="cancelStartGame" className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
                  </div>
              </div>
            </form>
          </div>

        </div>

      </main>
    );
}

export default CreateGame