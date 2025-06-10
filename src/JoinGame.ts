import { app } from "./firebase";
import { getDatabase, ref, push, child, query, update , orderByChild, equalTo, get, orderByKey, QueryConstraint, DataSnapshot} from "firebase/database";
import { members, playerInfo, teamInfo } from "./models";
import toast from "react-hot-toast";
import { showModal } from "./utils";
import { v4 } from "uuid";

const db = getDatabase(app);

const teamsExampleData = [`
{
    "members": [
      {
        "id": "-OS91a0Et0o6kbbuLJpD",
        "score": 0,
        "username": "Test Alex Team"
      }
    ],
    "teamName": "Test Team Alex 2",
    "teamScore": 0
  }`,
  ` { 
  "members": [
      {
        "id": "-OS91a0Et0o6kbbuLJpD",
        "score": 0,
        "username": "Test Alex Team"
      }
    ],
    "teamName": "Test Team Alex",
    "teamScore": 0
  }`]

const tmpTeams = [
`{
  "-ORfCFpx3FyoUT08tAoU": {
    "members": [
      {
        "id": "-OS91a0Et0o6kbbuLJpD",
        "score": 0,
        "username": "Test Alex Team"
      }
    ],
    "teamName": "Test Team Alex 2",
    "teamScore": 0
  }
}`,
`{
  "-OS91a0bm7P2vtaMCdgm": {
    "members": [
      {
        "id": "-OS91a0Et0o6kbbuLJpD",
        "score": 0,
        "username": "Test Alex Team"
      }
    ],
    "teamName": "Test Team Alex",
    "teamScore": 0
  }
}`
]


  const DEBUG = false

export const tmpData2 = tmpTeams.map((team) => JSON.parse(team))

export const tmpData =  teamsExampleData.map((teamJSON) => JSON.parse(teamJSON))

export async function createTeam(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();  
  try {
    const teamName: string | undefined = (document.getElementById("teamName") as HTMLInputElement).value;

    const UID = window.localStorage.getItem("UID")
    const GID = window.localStorage.getItem("GID")
    const username = window.localStorage.getItem("username")
    const gameCode = window.localStorage.getItem("game-code")


    if (UID === null || GID === null || username === null || gameCode === null) {
      toast.error("Failed to retrieve usename or game code. Please try again")
      return
    }

    const newTeamKey = push(child(ref(db), 'teams')).key;
    if (newTeamKey === null) {
      throw Error("Failed to create new team key")
    }
    const teamUpdate: Record<string, Omit<teamInfo,"id">> = {}

    const members: members = {}
    members[UID] ={username, "score": 0}
    teamUpdate["/teams/"+newTeamKey] = {teamName, teamScore: 0, members}
    await update(ref(db), teamUpdate)

    const playerObject: Record<string, boolean> = {};
    playerObject[newTeamKey] = true;
    await update(child(ref(db), "/players/"+GID),playerObject);
    window.localStorage.setItem("teamID", newTeamKey);

    showModal("teamsModal", false)
    showModal("createTeamModal", false)

    
    window.location.replace(window.location+"game/"+gameCode);

  } catch {
    toast.error("Failed to create team. Please try again")
  }


}


export async function joinTeam(event: React.MouseEvent<HTMLButtonElement>, selectedTeamKey: string) {
  event.preventDefault();
  const username = window.localStorage.getItem("username")
  const gameCode = window.localStorage.getItem("game-code")
  const UID = window.localStorage.getItem("UID")
  const GID = window.localStorage.getItem("GID")

  if (username === null || gameCode === null || UID === null || GID === null) {
    toast.error("Failed to retrieve usename or game code. Please try again")
    return
  }
  window.localStorage.setItem("teamID", selectedTeamKey)

  const teamRef = query(ref(db,'teams') , orderByKey() , equalTo(selectedTeamKey));
  await get(teamRef).then(async (snapshot) => {
    if (snapshot.exists()){
      try {
      const teamInfo = snapshot.val()[selectedTeamKey] as teamInfo;

      teamInfo.members[UID] = {username, score:0}
      //teamInfo.members.({id: UID, username, score: 0})

      await update(child(ref(db), "/teams/"+selectedTeamKey),teamInfo);

      showModal("teamsModal", false)

      window.location.replace(window.location+"game/"+gameCode);

      } catch {
        toast.error("Failed to join team")
      }

    } else {
      toast.error("Team does not exist")
    }
  })



}

export async function joinGame(event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): Promise<teamInfo[]| undefined> {
        event.preventDefault();
        const username = (document.getElementById("playerName") as HTMLInputElement).value;
        const gameCode = (document.getElementById("gameCode") as HTMLInputElement).value;


        console.log(`Adding ${username} to game ${gameCode}`)

        try {
          const gameref = query(ref(db,'games') , orderByChild('gameCode') , equalTo(gameCode));
          return await get(gameref).then(async (snapshot) => {
            let teamsInfo: teamInfo[] | undefined = undefined
            if (snapshot.exists()) {

              const gameId = Object.keys(snapshot.val())[0]
              const teamsEnabled = snapshot.val()[gameId].teamsEnabled

              let newUserKey: string | null
              if (teamsEnabled) {
                newUserKey = v4()
                const playersRef = query(ref(db, 'players'), orderByKey(), equalTo(gameId))
                const playersData = (await get(playersRef)).val();
                console.log(playersData);
                const teamsKeys = Object.keys(playersData[gameId])

                const promises: Promise<DataSnapshot>[] = []
                for (const teamID of teamsKeys) {
                  const teamsRef = query(ref(db, 'teams'), orderByKey(), equalTo(teamID))
                  promises.push(get(teamsRef))
                }
                const teams = await Promise.all(promises);

                //const teamsInfo: teamInfo[] = teams.map((data) => Object.entries(data.val())[0][1]) as teamInfo[]
                teamsInfo = teams.map((data) => {
                  const teamsData = Object.entries(data.val())[0][1] as Omit<teamInfo, "id">
                  const teamID = Object.entries(data.val())[0][0]
                  return {...teamsData, id: teamID}
                })

                console.log(teamsInfo)

                showModal("teamsModal", true)

                
              } else {

                // create new user object in database
                newUserKey = push(child(ref(db), 'users')).key;
                if (newUserKey === null) {
                  throw Error("Failed to create new user key")
                }
                const userUpdates: Record<string, Omit<playerInfo, "id">> = {}
                userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
                await update(ref(db),userUpdates);

                // create new player object for game
                const playerObject: Record<string, boolean> = {};
                playerObject[newUserKey] = true;
                await update(child(ref(db), "/players/"+gameId),playerObject);

              }

              window.localStorage.setItem("username", username);
              window.localStorage.setItem("UID", newUserKey);
              window.localStorage.setItem("GID", gameId);
              window.localStorage.setItem("game-code",gameCode)

              


              // send user to game page 
              if (!teamsEnabled) window.location.replace(window.location+"game/"+gameCode);
              return teamsInfo
            } else {
              toast.error("Game with that code does not exist");
              console.log("game does not exist");
            }
          });
      } catch { 
        toast.error("Failed to join game. Please try again");
      }
      return
  
}

