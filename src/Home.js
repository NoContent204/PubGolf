import {Link} from "react-router-dom";

function homeContent() {
  return (
    <div className='home'>
      <div id="home-content">
        <h2>Welcome to the Pub Golf web app </h2>
        <p>You can either create a new game or join a game created by your host</p>
        <br/>
        <div id="home-buttons">
          <Link to="/join"><button className='homebtn'>Join Game</button></Link>
          <Link to="/create"><button className='homebtn'>Create Game</button></Link>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const UID = window.localStorage.getItem("UID");
  const username = window.localStorage.getItem("username");
  const GID = window.localStorage.getItem("GID")
  const gameCode = window.localStorage.getItem("game-code")
  console.log(gameCode)

  if (UID && username && GID && gameCode) {
    let text = `Do you want to resume game ${gameCode}. Your username was ${username}`;
    if (window.confirm(text) === true) {
      window.location.replace(window.location+"game/"+gameCode);
    } else {
      localStorage.clear()
      homeContent()
    }
  } else {
    homeContent()
  }

}

export default Home
