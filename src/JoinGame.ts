import { app } from "./firebase";
import { getDatabase, ref, push, child, query, update , orderByChild, equalTo, get, orderByKey} from "firebase/database";
import { playerInfo } from "./models";
import toast from "react-hot-toast";

const db = getDatabase(app);


export async function joinGame(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const username = (document.getElementById("playerName") as HTMLInputElement).value;
        const gamecode = (document.getElementById("gameCode") as HTMLInputElement).value;

        console.log(`Adding ${username} to game ${gamecode}`)

        try {
          const gameref = query(ref(db,'games') , orderByChild('gameCode') , equalTo(gamecode));
          await get(gameref).then(async (snapshot) => {
            if (snapshot.exists()) {

              const teamsEnabled = snapshot.val()[Object.keys(snapshot.val())[0]].teamsEnabled

              const teamsRef = query(ref(db, 'teams'), orderByKey(), equalTo(Object.keys(snapshot.val())[0]))
              const data = await get(teamsRef);
              const teams = data.val();

              // create new user object in database
              const newUserKey = push(child(ref(db), 'users')).key;
              if (newUserKey === null) {
                throw Error("Failed to create new user key")
              }
              const userUpdates: Record<string, Omit<playerInfo, "id">> = {}
              userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
              await update(ref(db),userUpdates);

              // create new player object for game
              const playerObject: Record<string, boolean> = {};
              playerObject[newUserKey] = true;
              await update(child(ref(db), "/players/"+Object.keys(snapshot.val())[0]),playerObject);

              window.localStorage.setItem("username", username);
              window.localStorage.setItem("UID", newUserKey);
              window.localStorage.setItem("GID", Object.keys(snapshot.val())[0]);
              window.localStorage.setItem("game-code",gamecode)


              // send user to game page 
              window.location.replace(window.location+"game/"+gamecode);
            } else {
              toast.error("Game with that code does not exist");
              console.log("game does not exist");
            }
          });
      } catch { 
        toast.error("Failed to join game. Please try again");
      }
  
}

