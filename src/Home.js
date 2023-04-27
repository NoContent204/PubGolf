import {Link } from "react-router-dom";

function Home() {
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

export default Home
