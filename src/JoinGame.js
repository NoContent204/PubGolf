import { app } from "./firebase";
import { getDatabase, ref, push, child, query, update , orderByChild, equalTo, get, orderByKey} from "firebase/database";

const db = getDatabase(app);


export async function joinGame(event) {
        event.preventDefault();
        const username = document.getElementById("playerName").value;
        const gamecode = document.getElementById("gameCode").value;

        console.log(`Adding ${username} to game ${gamecode}`)

        const gameref = query(ref(db,'games') , orderByChild('code') , equalTo(gamecode));
        await get(gameref).then(async (snapshot) => {
          if (snapshot.exists()){
            
            const teamsEnabled = snapshot.val()[Object.keys(snapshot.val())[0]].teamsEnabled

            const teamsRef = query(ref(db, 'teams'), orderByKey(), equalTo(Object.keys(snapshot.val())[0]))
            const data = await get(teamsRef);
            const teams = data.val();

            // create new user object in database
            const newUserKey = push(child(ref(db), 'users')).key;
            const userUpdates = {}
            userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
            await update(ref(db),userUpdates);

            // create new player object for game
            const playerObject = {};
            playerObject[newUserKey] = true;
            console.log(Object.keys(snapshot))
            await update(child(ref(db), "/players/"+Object.keys(snapshot.val())[0]),playerObject);

            window.localStorage.setItem("username", username);
            window.localStorage.setItem("UID", newUserKey);
            window.localStorage.setItem("GID", Object.keys(snapshot.val())[0]);
            window.localStorage.setItem("game-code",gamecode)


            // send user to game page 
            window.location.replace(window.location+"game/"+gamecode);
          } else {
            alert("Game with that code does not exist");
            console.log("game does not exist");
          }
        });
  
}

