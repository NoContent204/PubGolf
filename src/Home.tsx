import {Link} from "react-router-dom";
import { createTeam, joinGame, joinTeam, tmpData2 }  from "./JoinGame";
import { useEffect, useState } from "react";
import React from "react";
import { showModal } from "./utils";
import { Button, Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import { teamInfo } from "./models";
import { query, orderByKey, equalTo, onChildChanged, DataSnapshot, onValue, getDatabase, ref } from "firebase/database";
import { app } from "./firebase";
import { getAuth } from "firebase/auth";

const UID = window.localStorage.getItem("UID");
const username = window.localStorage.getItem("username");
const GID = window.localStorage.getItem("GID")
const gameCode = window.localStorage.getItem("game-code")
const db = getDatabase(app);

let currentLeaderBoard: teamInfo[] = []


function testFunction() {
  const teamsKeys = ["-ORfCFpx3FyoUT08tAoU", "-OS91a0bm7P2vtaMCdgm"]
  
  for (const teamID of teamsKeys) {
    // let teamsData = currentLeaderBoard
    // // let teamsData: teamInfo[]= []
    // const teamsRef = query(ref(db, 'teams'), orderByKey(), equalTo(teamID))
    // //promises.push(get(teamsRef))

    // let i =0;
    // let fn = onChildChanged(teamsRef, (teamSnap: DataSnapshot, _) => {
    //     console.log(teamSnap.key);
    //     console.log(teamSnap.val())
    //     i +=1;

    //     if (teamsData.find(team => team.id === teamSnap.key) === undefined) { // team not added to list yet
    //       const teamObj: teamInfo = {id: teamSnap.key, ...teamSnap.val()}
    //       teamsData.push(teamObj)
    //     } else {
    //       teamsData = teamsData.map(team => team.id === teamSnap.key ? {id: teamSnap.key, ...teamSnap.val()}: team)
    //     }
    //     teamsData.sort((a,b) => a.teamScore - b.teamScore)
    //     console.log(teamsData)
    //     currentLeaderBoard = teamsData
        
    //     // if (teamsData.find(team => team.id === teamSnap.key) === undefined) {
    //     //     const idObj = {id:teamSnap.key}
    //     //     const playerObject = {
    //     //         ...idObj,
    //     //         ...teamSnap.val()
    //     //     }
    //     //     teamsData.push(playerObject);
    //     // } else {
    //     //     teamsData = teamsData.map(player => player.id === teamSnap.key ? {...player, username: teamSnap.val().username,score : teamSnap.val().score} : player);
    //     // }
    //     // teamsData.sort(function(a, b){
    //     // return a.score - b.score;
    //     // });
    //     // if (teamsData.length === i){ //basically wait till entire leaderboard loaded  
    //     //     setLeaderboard(teamsData);
    //     // }
        

    // });

  }
}


function Home() {

  const [selectedTeamKey, setSelectedTeam] = useState<string>()  
  const [currentTeams, setCurrentTeams] = useState<teamInfo[]>()
  const [open, setOpen] = useState<boolean[]>([]);



  const handleClick = (teamIndex: number) => {
    const openStates = [...open]
    openStates[teamIndex] = !openStates[teamIndex]
    setOpen(openStates);
  };

  const handleTabClosing = () => {
    const auth = getAuth(app);
    
    auth.currentUser?.delete().then(() => {
      console.log("User deleted");
    }).catch((error: any) => {
      console.error("Could not delete user", error);
    });
  }



  console.log("home page")

  useEffect(() => {
    if (UID && username && GID && gameCode) {
      showModal("resumeGameModal", true)
    }

    window.addEventListener('unload', handleTabClosing)
    //setCurrentTeams(tmpData2)

  },[])

  return (
    <div className='home'>
      <div id="home-content">
        <h2>Welcome to the Pub Golf web app </h2>
        <p>You can either create a new game or join a game created by your host</p>
        <br/>
        <div id="home-buttons">
          <button onClick={() => {showModal("addPlayerModal",true)}} className='btn-secondary px-4 py-2 rounded-lg font-medium'>Join Game</button>
          <Link to="/create"><button className='btn-secondary px-4 py-2 rounded-lg font-medium'>Create Game</button></Link>
        </div>
      </div>

    
    <div id="addPlayerModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <form onSubmit={async (event) => {const x = await joinGame(event); setCurrentTeams(x); showModal("addPlayerModal",false)}}> 
        <div className="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Join a game</h3>
            <div className="mb-4">
                <label htmlFor="playerName" className="block mb-2">Player Name</label>
                <input type="text" id="playerName" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter player name" required/>
            </div>
            <div className="mb-4">
                <label htmlFor="gameCode" className="block mb-2">Game Code</label>
                <input type="text" id="gameCode" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter game code" required/>
            </div>
            <div className="flex justify-end space-x-3">
                <input type="submit" id="confirmAddPlayer" className="btn-primary px-4 py-2 rounded-lg font-medium" value={"Add player"}/>
                <button onClick={(event) => {event.preventDefault(); showModal("addPlayerModal",false)}} id="cancelAddPlayer" className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">Cancel</button>
            </div>
        </div>
      </form>
    </div>

    <div id="resumeGameModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <form onSubmit={(event) => {event.preventDefault();  window.location.replace(window.location+"game/"+gameCode); showModal("resumeGameModal", false)}}> 
        <div className="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Resume Game</h3>
            <div className="mb-4">
                <h4>Do you want to resume game <strong>{gameCode}</strong>. Your username was <strong>{username}</strong></h4>
            </div>
            <div className="flex justify-end space-x-3">
                <input type="submit" id="confirmAddPlayer" className="btn-primary px-4 py-2 rounded-lg font-medium" value={"Yes"}/>
                <button onClick={(event) => {event.preventDefault(); localStorage.clear(); showModal("resumeGameModal", false)}} id="cancelAddPlayer" className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">No</button>
            </div>
        </div>
      </form>
    </div>

    <button onClick={() => testFunction()}>Test</button>


    <div id="teamsModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <form onSubmit={(event) => {event.preventDefault();  window.location.replace(window.location+"game/"+gameCode); showModal("teamsModal", false)}}> 
        <div className="bg-[#2d6a4f] rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Choose a team</h3>
                <List
                  sx={{bgcolor: '#1a4d2e', width: "20em"}}
                >
                  {currentTeams?.map((team, index) => {
                    return (
                      <React.Fragment key={index}>
                        <ListItemButton onClick={() => handleClick(index)}>
                          <ListItemText primary={team.teamName} />
                          <Button  variant="contained" endIcon={<AddIcon />} onClick={(event) => {joinTeam(event, team.id)}}>
                            Join Team
                          </Button>
                          {open[index] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        {Object.values(team.members).map((member, memberIndex) => {
                          return (
                            <React.Fragment key={memberIndex}> 
                              <Collapse in={open[index]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                  <ListItemButton sx={{ pl: 4 }}>
                                    <ListItemText primary={member.username} />
                                  </ListItemButton>
                                </List>
                              </Collapse>
                            </React.Fragment>
                          )
                        })}
                      </React.Fragment>
                    );
                  })}
                  
                </List>
            <div className="flex justify-end space-x-3">
                <button onClick={(event) => {event.preventDefault(); showModal("createTeamModal", true)}} id="createTeam" className="btn-primary px-4 py-2 rounded-lg font-medium">Create new team</button>
                {/* <button onClick={(event) => {event.preventDefault(); localStorage.clear(); showModal("teamsModal", false)}} id="cancelAddPlayer" className="px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 transition">No</button> */}
            </div>
            <div id="createTeamModal" className="mb-4 hidden">
                <label htmlFor="teamName" className="block mb-2">Team Name</label>
                <input type="text" id="teamName" className="score-input w-full px-4 py-2 rounded-lg" placeholder="Enter Team Name" required/>
                 <div className="flex justify-end space-x-3">
                    <button onClick={async (event) => {event.preventDefault();  await createTeam(event);}} id="confirmCreateTeam" className="btn-primary px-4 py-2 rounded-lg font-medium" >Create team and join Game</button>
                 </div>
            </div>
        </div>
      </form>
    </div>

      
    </div>
  );

}

export default Home
