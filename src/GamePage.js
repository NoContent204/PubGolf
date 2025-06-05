import {useParams} from "react-router-dom";
import { app } from "./firebase";
import React, { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo, update, onChildAdded} from 'firebase/database';
import toast from "react-hot-toast";

const db = getDatabase(app);
const UID = window.localStorage.getItem("UID");

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

    console.log("game page")

    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading , setLoading] = useState(true);
    const [scores , setScores] = useState([]);
    const [holes , setHoles] = useState([]);
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
            const storedScores = window.localStorage.getItem("scores")
            setScores(storedScores ? storedScores.split(','): holes.map(() => 0));
            setHoles(holes);
            setLoading(false);


            return () => {
                handles.forEach(fn => fn());
    
            }
        }
        getGameData();



    });

        const handleScoreChange = (event) => {
            const score = event.target.value
            const hole = event.target.dataset.hole

                try {
                    const scoreInt = parseInt(score);
                    const newScores = [...scores];
                    newScores[hole] = isNaN(scoreInt) || scoreInt< 0 ? 0 : scoreInt;
                    setScores(newScores);
                    window.localStorage.setItem("scores", newScores)
                    console.log(window.localStorage.getItem("scores"))
                    //update users score on database
                    const userUpdates = {}
                    const UID = window.localStorage.getItem("UID");
                    const username = window.localStorage.getItem("username");
                    
                    userUpdates["/users/"+UID] = {"username": username, "score": newScores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints  };
                    update(ref(db),userUpdates);
                } catch {
                    toast.error(`There was an error updating your score. Please try again`)
                } 
        }

        const getScoreLabelClass = (score, par) => {
            const scoreInt = parseInt(score)
            const diff = scoreInt - par
            if (scoreInt === 1) return "text-yellow-300 font-bold"
            if (diff < 0) return "text-green-300"
            if (diff === 0 ) return "text-blue-300" 
            return "text-red-300"
        }

        const getScoreLabelText = (score, par) => {
            const scoreInt = parseInt(score)
            if (isNaN(scoreInt) || scoreInt === 0) return "-"
            const diff = scoreInt - par
            if (scoreInt === 1) return "Hole in one!"
            if (diff < -2) return `${diff}`
            if (diff === -2) return "Eagle"
            if (diff === -1) return "Birdie"
            if (diff === 0 ) return "Par"
            if (diff === 1 ) return "Bogey"
            if (diff === 2 ) return "Double Bogey"
            if (diff > 2) return `+${diff}`

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
                const UID = window.localStorage.getItem("UID");
                const username = window.localStorage.getItem("username");
                userUpdates["/users/"+UID] = {"username": username, "score": scores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints + pointsDeducted  };
                update(ref(db),userUpdates);
            }
            
        }

        const saveSettings = () => {
            const newUsername = document.getElementById("newUsername").value;
            const username = window.localStorage.getItem("username");

            if (newUsername !== username){
                const UID = window.localStorage.getItem("UID");
                window.localStorage.setItem("username",newUsername);
                const userUpdates = {}
                userUpdates["/users/"+UID] = {"username": newUsername, "score": scores.reduce((partialSum, a) => partialSum + a, 0) + bingoPoints};
                update(ref(db),userUpdates);
            }

        }


        if (isLoading){
            return <div className="loader"></div>;
        }
        return (
            <div className='flex justify-center px-6 py-8'>
                
                <Tabs>
                    <p class="ms-auto text-right"><i>Game Code: {gamecode}</i></p>
                    <div class="bg-[#1b4332] py-2 shadow-md">
                    <TabList className={"flex justify-evenly"}>
                        <Tab selectedClassName="active" className={"tab px-4 py-2 rounded-t-lg font-medium"}>Scorecard</Tab>
                        <Tab selectedClassName="active" className={"tab px-4 py-2 rounded-t-lg font-medium"}>Leaderboard</Tab>
                        {challenges.length !== 0 ? <Tab className={"tab px-4 py-2 rounded-t-lg font-medium"}>Bingo</Tab> : <></>}
                        <Tab selectedClassName="active" className={"tab px-4 py-2 rounded-t-lg font-medium"}>Rules</Tab>
                    </TabList>
                    </div>

                    <TabPanel className={"container mx-auto"}>
                        <div class="tab-content" id="scorecard">
                            <h2 class="text-xl font-semibold mb-6 text-left">Scorecard</h2>
                        

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {holes.map((hole, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <div class="hole-card rounded-lg shadow-lg p-5">
                                                <div class="flex justify-between items-start">
                                                    <div>
                                                        <h3 class="font-semibold text-lg">{hole.pub}</h3>
                                                        <p class="text-[#a7f3d0]">{hole.drink}</p>
                                                    </div>
                                                    <div class="bg-[#081c15] px-3 py-1 rounded-full flex items-center">
                                                        <span class="text-sm mr-1">Par</span>
                                                        <span class="font-bold">{hole.par}</span>
                                                    </div>
                                                </div>
                                                <div class="mt-2 flex justify-between items-center">
                                                    <span class="text-sm text-gray-300">Hole {index +1}</span>
                                                </div>
                                                <div class="space-y-3 mt-4">
                                            
                                                    <div class="flex items-center justify-between">
                                                        <div class="flex items-center">
                                                            <input type="number" class="score-input w-16 px-2 py-1 rounded-lg text-center mr-2" placeholder="Sips" min="1" onChange={handleScoreChange} data-hole={index} value={scores[index] ? scores[index]: undefined}/>
                                                            <span class={getScoreLabelClass(scores[index], hole.par)}>{getScoreLabelText(scores[index], hole.par)}</span>
                                                        </div>
                                                    </div>
                                            
                                                </div>                                            
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                
                            </div>
                        </div>
                        
                    </TabPanel>

                    <TabPanel className={"container mx-auto"}>
                        <div class="tab-content" id="leaderboard">
                            <h2 class="text-xl font-semibold mb-6 text-left">Leaderboard</h2>
                            <div class="bg-[#2d6a4f] rounded-lg shadow-lg p-6">
                                <table className='w-full'>
                                    <thead>
                                        <tr class="border-b-2 border-[#74c69d]">
                                            <th class="text-left py-3 px-4">Position</th>
                                            <th class="text-left py-3 px-4">Username</th>
                                            <th class="text-left py-3 px-4">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody id="leaderboardBody">
                                        { leaderboard.map((player, index) => {

                                            return (
                                                <React.Fragment key={index}>
                                                    <tr class={player.id === UID? "bg-[#1b4332]" : ""}>
                                                        <td class="py-3 px-4">{ordinal_suffix_of(index+1)}</td>
                                                        <td class="py-3 px-4">{player["username"]}</td>
                                                        <td class="py-3 px-4">{player["score"]}</td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                            })
                                        }   
                                    </tbody>
                                </table>
                            </div>
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

                        <div id="rules" class="tab-content">
                            <h2 class="text-left text-xl font-semibold mb-6">Pub Golf Rules</h2>
                            <div class="bg-[#2d6a4f] rounded-lg shadow-lg p-6">
                                <div class="space-y-6">
                                    <div>
                                        <h3 class="text-lg font-medium mb-2">How to Play</h3>
                                        <p>Pub Golf is a drinking game where players visit multiple pubs (holes) and consume a specified drink at each location. The goal is to finish each drink in as few sips as possible, similar to golf where the lowest score wins.</p>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-lg font-medium mb-2">Scoring</h3>
                                        <ul class="list-disc pl-5 space-y-2">
                                            <li>Each hole has a "par" - the expected number of sips/gulps to finish the drink</li>
                                            <li>Your score is the number of sips/gulps you take</li>
                                            <li>Finishing in one gulp is a "hole in one"</li>
                                            <li>The player with the lowest total score at the end wins</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 class="text-lg font-medium mb-2">Penalties</h3>
                                        <ul class="list-disc pl-5 space-y-2">
                                            <li>+2 strokes for spilling your drink</li>
                                            <li>+1 stroke for breaking etiquette (e.g., using wrong hand)</li>
                                            <li>+3 strokes for not completing a hole</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="bg-[#1b4332] p-4 rounded-lg">
                                        <h3 class="text-lg font-medium mb-2">Safety First!</h3>
                                        <p>Always drink responsibly and arrange for safe transportation. Consider having designated drivers or using ride-sharing services.</p>
                                    </div>
                                </div>
                            </div>
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