export interface hole {
    id: number,

    par: number,

    drink: string,

    pub: string
}

export interface gameInfo {
    holes: hole[],

    gameCode: string,

    teamsEnabled: boolean
}

export interface playerInfo {
    id: string;

    username: string;

    score: number;
}

export interface teamInfo {

    id: string; 
    
    teamName: string;

    members: members;

    teamScore: number;
}

export interface members {
    [id: string]: Omit<playerInfo, "id">
}