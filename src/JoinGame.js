import { useNavigate } from "react-router-dom";
import { app } from "./firebase";
import { getDatabase, ref, push, child, query, update , orderByChild, equalTo, get} from "firebase/database";

const db = getDatabase(app);


function JoinGame() {
    const nav = useNavigate();
    const HandleJoinGame = event => {
        event.preventDefault();
        const username = document.getElementById("joinusername").value;
        const gamecode = document.getElementById("gamecode").value;

        const gameref = query(ref(db,'games') , orderByChild('code') , equalTo(gamecode));
        get(gameref).then((snapshot) => {
          if (snapshot.exists()){
            // create new user object in database
            const newUserKey = push(child(ref(db), 'users')).key;
            const userUpdates = {}
            userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
            update(ref(db),userUpdates);

            // create new player object for game
            const playerObject = {};
            playerObject[newUserKey] = true;
            console.log(Object.keys(snapshot)[0])
            update(child(ref(db), "/players/"+Object.keys(snapshot.val())[0]),playerObject);

            window.sessionStorage.setItem("username", username);
            window.sessionStorage.setItem("UID", newUserKey);
            window.sessionStorage.setItem("GID", Object.keys(snapshot.val())[0]);

            // send user to game page 
            nav('/game/'+gamecode);

          } else {
            alert("Game with that code does not exist");
            console.log("game does not exist");
          }
        });
    };
  
    return (
      <div className='joingame'>
        <h2>Join a game</h2>
        <p>Enter the game code provided by the host and a username</p>
        <form onSubmit={HandleJoinGame} id="joingameform">
          <input type="text" required placeholder='Username' maxLength={20} id="joinusername"></input> <br/>
          <input type="text" required placeholder='Game Code' minLength={5} maxLength={5} id="gamecode"></input> <br/>
          <input type="submit" value="Join Game"></input>
        </form>
      </div>
    );
  
}

export default JoinGame