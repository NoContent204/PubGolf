import {useParams} from "react-router-dom";
import { app } from "./firebase";
import React, { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo, update, onChildAdded} from 'firebase/database';

const db = getDatabase(app);

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


function GamePage() {

    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading , setLoading] = useState(true);
    const [scores , setScores] = useState([]);
    const [holes , setHoles] = useState([]);
    const [currentHole , setCurrentHole] = useState(0);
    const [challenges , setChallenges] = useState([])
    const [bingoPoints , setBingoPoints] = useState(0);
    const [completeChallenges , setCompleteChallenges] = useState(["bingosquare","bingosquare","bingosquare","bingosquare","bingosquare","bingosquare","bingosquare","bingosquare","bingosquare"]);

    const {gamecode} = useParams();
    useEffect(() => {
        const getGameData = async () => {
            const gameref = query(ref(db,'games') , orderByChild('code') , equalTo(gamecode));

            // get game data
            const gameData = await get(gameref).then((snapshot) => {
                if (snapshot.exists()) {
                    const gameData = snapshot.val();
                    return gameData
                } else {
                    console.log("Game does not exist");
                }  
            });

            // get leaderboard
            let playersData = [];
            const playersRef = ref(db, 'players/'+Object.keys(gameData)[0]);
            let i =0;
            let handles = [];
            onChildAdded(playersRef, (snapshot) => {
                console.log(snapshot.key);
                let userRef = ref(db, 'users/'+snapshot.key);
                i +=1;
                let fn = onValue(userRef,(userSnap) => {
                    if (playersData.find(player => player.id === snapshot.key) === undefined) {
                        const idObj = {id:snapshot.key}
                        const playerObject = {
                            ...idObj,
                            ...userSnap.val()
                        }
                        playersData.push(playerObject);
                    } else {
                        playersData = playersData.map(player => player.id === snapshot.key ? {...player, username: userSnap.val().username,score : userSnap.val().score} : player);
                    }
                    playersData.sort(function(a, b){
                       return a.score - b.score;
                    });
                    if (playersData.length === i){ //basically wait till entire leaderboard loaded  
                        setLeaderboard(playersData);
                    }
                });
                handles.push(fn);

            });

            const holes = gameData[Object.keys(gameData)[0]]["holes"];
            const challenges = gameData[Object.keys(gameData)[0]]["challenges"];
            if (challenges !== undefined) {
                const challengesArray = Object.values(challenges);
                setChallenges(shuffleArray(challengesArray));
            }
            setScores(holes.map(() => 0));
            setHoles(holes);
            setLoading(false);


            return () => {
                handles.forEach(fn => fn());
    
            }
        }
        getGameData();



    }, [gamecode]);
    
        const submitScore = () => {
            const scoreInput = document.getElementById('scoreInput');
            if (scoreInput.value === null || scoreInput.value === '') {
                alert("Please enter your score for this hole");
            } else {
                try {
                    const scoreInt = parseInt(scoreInput.value);
                    const newScores = [...scores];
                    newScores[currentHole] = scoreInt;
                    setScores(newScores);
                    if (currentHole !== holes.length-1) {
                        setCurrentHole(currentHole + 1);
                    } else {
                        const submitScorebtn = document.getElementById("submitScore");
                        submitScorebtn.disabled = true;
                    }
                    scoreInput.value = '';
                    //update users score on database
                    const userUpdates = {}
                    const UID = window.sessionStorage.getItem("UID");
                    const username = window.sessionStorage.getItem("username");
                    userUpdates["/users/"+UID] = {"username": username, "score": newScores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints  };
                    update(ref(db),userUpdates);
                } catch {

                } 
            }
        }

        const tickSquare = (event) => {
            if (event.target.className === "bingosquare"){
                event.target.className = "bingosquareTicked"
            } else {
                //  event.target.className = "bingosquare"; //can't untick a square (unless I figure out how to make it work with the points e.g. accidently tick 3rd square then untick it (how to reverse the point deduction))
            }
            const newArray = completeChallenges.map((c,i) => {
                if (i === parseInt(event.target.id.replace("C",""))-1) {
                    return event.target.className
                } else {
                    return c;
                }
            });
            setCompleteChallenges(newArray);

            const pointsDeducted = checkforBingo()
            if (pointsDeducted < 0){
                setBingoPoints(bingoPoints + pointsDeducted);
                const userUpdates = {}
                const UID = window.sessionStorage.getItem("UID");
                const username = window.sessionStorage.getItem("username");
                userUpdates["/users/"+UID] = {"username": username, "score": scores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints + pointsDeducted  };
                update(ref(db),userUpdates);
            }
            
        }

        const saveSettings = () => {
            const newUsername = document.getElementById("newUsername").value;
            const username = window.sessionStorage.getItem("username");

            if (newUsername !== username){
                const UID = window.sessionStorage.getItem("UID");
                window.sessionStorage.setItem("username",newUsername);
                const userUpdates = {}
                userUpdates["/users/"+UID] = {"username": newUsername, "score": scores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints};
                update(ref(db),userUpdates);
            }

        }


        if (isLoading){
            return <div className="loader"></div>;
        }
        return (
            <div className='createGame'>
                <Tabs>
                    <TabList>
                        <Tab>Scorecard</Tab>
                        <Tab>Leaderboard</Tab>
                        {challenges.length !== 0 ? <Tab>Bingo</Tab> : <></>}
                        <Tab>Settings</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="centerTables">
                            <table className='gametable'>
                                <thead>
                                    <tr>
                                        <th colSpan="4" >Game Code: {gamecode}</th>
                                    </tr>
                                    <tr>
                                        <th>Pub</th>
                                        <th>Drink</th>
                                        {/* <th>Water Hazard?</th> */}
                                        <th>Par</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody id="gameInfo">
                                {holes.map((hole, index) => { 
                                    return (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td>{hole.pub}</td>
                                            <td>{hole.drink}</td>
                                            {/* <td>{hole.waterHazard ? "Yes" : "No"}</td> */}
                                            <td>{hole.par}</td>
                                            <td>{scores[index]}</td>
                                        </tr>
                                    </React.Fragment>
                                    );
                                })}
                                {challenges.length !== 0 
                                                    ?  <tr> 
                                                            <td/>
                                                            <td/>
                                                            {/* <td/> */}
                                                            <td>Bingo points</td>
                                                            <td>{bingoPoints}</td>
                                                            
                                                        </tr> 
                                                    : <></>
                                } 
                                <tr>
                                    <td/>
                                    <td/>
                                    {/* <td/> */}
                                    <td>Total</td>
                                    <td>{scores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints}</td>
                                </tr>
                                </tbody>
                            </table>
                            <div className="gameMisc">
                                <h4>Current drink: {holes[currentHole]["drink"]}</h4>
                                {holes[currentHole]["customProperty"] !== '' ? <h4 id="customProperty">At this hole: {holes[currentHole]["customProperty"]}</h4> : <></>}
                                <input id="scoreInput" min={1} type="number" inputMode="numeric" pattern="[0-9]+" placeholder="Your score"></input>
                                <br></br><br></br>
                                <input id="submitScore" type="button" value="Submit Score" onClick={submitScore}></input>
                            </div>

                        </div>
                        
                    </TabPanel>

                    <TabPanel>
                        <div className="centerTables">
                            <table className='gametable'>
                                <thead>
                                    <tr>
                                        <th colSpan="3" >Game Code: {gamecode}</th>
                                    </tr>
                                    <tr>
                                        <th>Position</th>
                                        <th>Username</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody id="gameInfo">
                                    { leaderboard.map((player, index) => {

                                        return (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td>{ordinal_suffix_of(index+1)}</td>
                                                    <td>{player["username"]}</td>
                                                    <td>{player["score"]}</td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                        })
                                    }   
                                </tbody>
                            </table>

                        </div>
                        
                    </TabPanel>

                    {challenges.length !== 0 ? <TabPanel>
                        <div className="centerTables">
                            <strong><p>Tick off a box once you have completed the challenge. Compltete 3 challenges and get -1 off your score</p></strong>
                            <table className="bingotable" cellSpacing="0" cellPadding="0">
                                <tbody>
                                    <tr>
                                        <td id="C1" className={completeChallenges[0]} onClick={(e) => tickSquare(e)}>{challenges[0]}</td>
                                        <td id="C2" className={completeChallenges[1]} onClick={(e) => tickSquare(e)}>{challenges[1]}</td>
                                        <td id="C3" className={completeChallenges[2]} onClick={(e) => tickSquare(e)}>{challenges[2]}</td>

                                    </tr>
                                    <tr>
                                        <td id="C4" className={completeChallenges[3]} onClick={(e) => tickSquare(e)}>{challenges[3]}</td>
                                        <td id="C5" className={completeChallenges[4]} onClick={(e) => tickSquare(e)}>{challenges[4]}</td>
                                        <td id="C6" className={completeChallenges[5]} onClick={(e) => tickSquare(e)}>{challenges[5]}</td>
                                    </tr>
                                    <tr>
                                        <td id="C7" className={completeChallenges[6]} onClick={(e) => tickSquare(e)}>{challenges[6]}</td>
                                        <td id="C8" className={completeChallenges[7]} onClick={(e) => tickSquare(e)}>{challenges[7]}</td>
                                        <td id="C9" className={completeChallenges[8]} onClick={(e) => tickSquare(e)}>{challenges[8]}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                        
                    </TabPanel> : <></>}
                    <TabPanel>
                        <div className="createGame">
                            <strong><label for="newUsername">Username</label></strong>
                            <input type="text" defaultValue={window.sessionStorage.getItem("username")} id="newUsername"></input> 
                            
                            <button onClick={saveSettings}>Save Changes</button>

                        </div>
                    </TabPanel>
                </Tabs>
            
            
            </div>
        
        );

}

function checkforBingo(){
    // return -1 if the number of challenges completed is divisble by 3, if they've done 3 then their total bingo points will be -1, 6 then -2, 9 then -3
    const challengeSquares = [];
    challengeSquares.push(document.getElementById("C1").className);
    challengeSquares.push(document.getElementById("C2").className);
    challengeSquares.push(document.getElementById("C3").className);
    challengeSquares.push(document.getElementById("C4").className);
    challengeSquares.push(document.getElementById("C5").className);
    challengeSquares.push(document.getElementById("C6").className);
    challengeSquares.push(document.getElementById("C7").className);
    challengeSquares.push(document.getElementById("C8").className);
    challengeSquares.push(document.getElementById("C9").className);

    let challengesCompleted = 0;
    for (let i=0; i<challengeSquares.length; i++){
        if (challengeSquares[i] === "bingosquareTicked"){
            challengesCompleted +=1;
        }
    }

    if (challengesCompleted % 3 === 0){
        return -1;
    } else{
        return 0;
    }
}

export default GamePage