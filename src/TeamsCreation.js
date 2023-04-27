import { app } from "./firebase";
import { getDatabase, ref, push, child, update , onValue, onChildAdded, remove} from "firebase/database";
import { useEffect, useState } from "react";

const db = getDatabase(app);

function createGroup() {

    const teamName = prompt("Enter Team Name");
    if (teamName !== null) {
        const newTeamKey = push(child(ref(db), 'teams')).key;
        const teamUpdates = {}
        teamUpdates["/teams/"+newTeamKey] = {"teamName" : teamName, "players" : []};
        update(ref(db),teamUpdates);
    }

}

function joinTeam(teamKey) {

    const playerName = prompt("Enter your name");
    if (playerName !== null){
        window.sessionStorage.setItem("teamID",teamKey);
        const newPlayerKey = push(child(ref(db), 'teams/'+teamKey+'/players')).key; 
        window.sessionStorage.setItem("playerID",newPlayerKey);
        window.sessionStorage.setItem("playerName",playerName);
        const teamUpdates = {}
        teamUpdates["/teams/"+teamKey+'/players/'+newPlayerKey] = playerName
        update(ref(db),teamUpdates);
    }
}

function switchTeam(newTeamKey){
    const playerKey = window.sessionStorage.getItem("playerID");
    const teamKey = window.sessionStorage.getItem("teamID");
    const playerName = window.sessionStorage.getItem("playerName");
    remove(ref(db,'/teams/'+teamKey+'/players/'+playerKey));

    window.sessionStorage.setItem("teamID",newTeamKey)
    const teamUpdates = {}
    teamUpdates["/teams/"+newTeamKey+'/players/'+playerKey] = playerName
    update(ref(db),teamUpdates);
}

function leaveTeam(teamKey) {
    const playerKey = window.sessionStorage.getItem("playerID");
    remove(ref(db,'/teams/'+teamKey+'/players/'+playerKey));
    window.sessionStorage.removeItem("teamID");
}



function TeamsCreation() {


    const [teamsData , setTeams] = useState({})
    useEffect(() => {
        const teamsref = ref(db,'teams');
        let tmpteamsData = {}
        let handles = [];

        onChildAdded(teamsref, (snapshot) => { // new team added
            console.log(snapshot.val())
            let teamRef = ref(db,'teams/'+snapshot.key)


            let fn = onValue(teamRef, (teamSnap) => {
                if (tmpteamsData[teamSnap.key] === undefined) {
                    const teamObj = {[teamSnap.key] : teamSnap.val()}
                    tmpteamsData = {
                        ...tmpteamsData,
                        ...teamObj
                    }
                } else {
                    let copyOfTeamsData = {...tmpteamsData}
                    copyOfTeamsData[teamSnap.key] = teamSnap.val()
                    tmpteamsData = copyOfTeamsData;
                }

                setTeams(tmpteamsData)
            });
            handles.push(fn);

        })

        return () => {
            //clean up
            handles.forEach(fn => fn())
        }
    },[])
    
    return (
       <div className='createTeams'>  {/* Flex Column*/}


        <h2>Create and join teams for the social</h2>
        {/* <h3 className="teamTitle">Current max per team is 5 (I can change it if needed)</h3> */}

        <div className="addTeam"> {/* Flex row (for add button)*/}
            <button onClick={createGroup}>+ Team</button>
        </div>

    
        <div className="currentTeams"> {/* Flex Column (for list of teams)*/}
            {
                Object.keys(teamsData).map((key) => {
                    return (
                        <div className="teamDiv">
                            <details className="teamDetails">
                                <summary className="teamDesc">
                                    {teamsData[key].teamName}
                                    {teamsData[key].players === undefined ? <span>(0/5)</span> : <span>({Object.values(teamsData[key].players).length}/5)</span>}
                                    {window.sessionStorage.getItem("teamID") === null ? 
                                                                (teamsData[key].players === undefined || Object.values(teamsData[key].players).length < 5 ? // not currently in a team
                                                                <button className="joinTeam" onClick={() => joinTeam(key)}>Join Team</button>  : <i class="icon-lock">&#128274;</i>) 
                                    
                                                                : (teamsData[key].players === undefined || Object.values(teamsData[key].players).length < 5 ? //currently in a team
                                                                 (window.sessionStorage.getItem("teamID") === key ? 
                                                                    (<button className="leaveTeam" onClick={() => leaveTeam(key)}>Leave</button>) : <button className="joinTeam" onClick={() => switchTeam(key)}>Switch To</button> ) 
                                                                 : <i class="icon-lock">&#128274;</i>) 
                                    
                                    }  
                                </summary>
                                <ul className="teamsList">
                                    {teamsData[key].players !== undefined ?  Object.values(teamsData[key].players).length === 1 ? <li className="teamListElement"> {Object.values(teamsData[key].players)[0]} </li> : 
                                    Object.values(teamsData[key].players).map((el) => {
                                        return <li className="teamListElement"> {el} </li>
                                    }) : <></>}
                                </ul>
                            </details>


                        </div>
                    )
                })
            }
        </div>
        

      </div>
    );
  
}

export default TeamsCreation