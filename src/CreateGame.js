import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { app } from "./firebase";
import { getDatabase, ref, push, child, update } from "firebase/database";
import { useNavigate } from "react-router-dom";


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

    // const [rows, setRows] = useState([{ id: Math.random(), pub: '', drink: '', par: 0, waterHazard: false, customProperty: ''}]);
    const [rows, setRows] = useState([{ id: Math.random(), pub: '', drink: '', par: 0, customProperty: ''}]);

    
  
    const handleChange = (value, id, property) => {
      var updatedRows = rows;
      var index = updatedRows.indexOf(updatedRows.find(row => row.id === id))
      updatedRows[index][property] = value;
      setRows(updatedRows);
    }
    // const [newRow, setNewRow] = useState({ id: Math.random(), pub: '', drink: '', par: 0, waterHazard: false, customProperty: '' });
    const [newRow, setNewRow] = useState({ id: Math.random(), pub: '', drink: '', par: 0, customProperty: '' });

  
    const handleAddRow = () => {
      setRows((prevRows) => [...prevRows, newRow]);
      // setNewRow({ id: Math.random(), pub: '', drink: '', par: 0, waterHazard: false, customProperty: '' });
      setNewRow({ id: Math.random(), pub: '', drink: '', par: 0, customProperty: '' });

    };
  
    const handleDeleteRow =  (id) => {
      const updatedRows = [...rows]; 
      const delData = updatedRows.filter((tbd) => {
        return id !== tbd.id;
      });
      setRows(delData);
  
    }
  
    const handleCreateGame = async (event) => {
      event.preventDefault();

      const bingoActive = document.getElementById("bingocheckbox").checked;

      const username = document.getElementById("username").value;
      const holes = rows
      
      var gameinfo = {};
      gameinfo["code"] = uuidv4().slice(0,5);
      gameinfo["holes"] = holes;

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

      // create new user object for the host
      const newUserKey = push(child(ref(db), 'users')).key;
      const userUpdates = {}
      userUpdates["/users/"+newUserKey] = {"username": username, "score": 0};
      update(ref(db),userUpdates);

  
      // create new player entry for user and game
      const playerUpdates = {};
      const playerObject = {};
      playerObject[newUserKey] = true;
      playerUpdates["/players/"+newGameKey] = playerObject;
      update(ref(db),playerUpdates);

      window.sessionStorage.setItem("username", username);
      window.sessionStorage.setItem("UID", newUserKey);
      window.sessionStorage.setItem("GID", newGameKey);

      nav('/game/'+gameinfo["code"]);

  
    }
  
    return (
      <div className='createGame'>
        <p>Please enter the info for your game of pub golf</p>
        <form onSubmit={handleCreateGame}>
          <table className='gametable'>
            <thead>
              <tr>
                <th></th>
                <th>Pub</th>
                <th>Drink</th>
                <th>Par</th>
                {/* <th>Water Hazard?</th> */}
                <th>Custom Hole Property <div class="tooltip">
                                            <p id="helpIcon">?</p>
                                            <div class="left">
                                                This is for any requirements of the hole e.g. you can't go to the toilet here or someone else has to feed you your drink
                                            </div>
                                         </div>
                </th>
              </tr>
            </thead>
            <tbody id="gameInfo">
              {rows.map((row) => { 
                return (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td><button id="deleteHole" onClick={() =>  handleDeleteRow(row.id)}>&#x2715;</button></td>
                      <td><input type="text"  className='textInput' maxLength={100} required  onChange={(e) => handleChange(e.target.value, row.id, 'pub')} /></td>
                      <td><input type="text"  className='textInput' maxLength={100} required  onChange={(e) => handleChange(e.target.value, row.id, 'drink')} /></td>
                      <td><input type="number" inputMode="numeric" pattern="[0-9]+" min="1" className='parInput'  required  onChange={(e) => handleChange(e.target.value, row.id, 'par')}/></td>
                      {/* <td><input type="checkbox" className='waterHazard' onChange={(e) => handleChange(e.target.checked, row.id, 'waterHazard')}/></td> */}
                      <td><input type="text" className="textInput" maxLength={100} onChange={(e) => handleChange(e.target.value, row.id, "customProperty")}/></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
 
  
          <div className='btns'>
            <div><br></br></div>

            <button onClick={handleAddRow}>Add Hole</button>

              <div className="createBingo">        
                <p>Tick if you want bingo as part of your pub golf</p>
                <input id="bingocheckbox" type="checkbox" onChange={(e) => toggleBingo(e.target.checked)}></input>    
              </div>

              <div hidden={true} id="bingoSetUpTable">
                <input className="challengeInput" type="text" id="challenge1" placeholder="Challenge 1"></input>
                <input className="challengeInput" type="text" id="challenge2" placeholder="Challenge 2"></input>
                <input className="challengeInput" type="text" id="challenge3" placeholder="Challenge 3"></input>
                <input className="challengeInput" type="text" id="challenge4" placeholder="Challenge 4"></input>
                <input className="challengeInput" type="text" id="challenge5" placeholder="Challenge 5"></input>
                <input className="challengeInput" type="text" id="challenge6" placeholder="Challenge 6"></input>
                <input className="challengeInput" type="text" id="challenge7" placeholder="Challenge 7"></input>
                <input className="challengeInput" type="text" id="challenge8" placeholder="Challenge 8"></input>
                <input className="challengeInput" type="text" id="challenge9" placeholder="Challenge 9"></input>
              </div>

            <div><br></br></div>

            <div className='usernamediv'>  
              <input type="text" placeholder='Username' required  id="username"/>
            </div>
            <div><br></br></div>

            <input className="createBtn" type='submit' disabled={rows.length === 0}  value={"Create Game"}/>
          </div>
        </form>
      </div>
    );
}

export default CreateGame