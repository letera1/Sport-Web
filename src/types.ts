export interface Team {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
}

export interface MatchEvent {
  idEvent: string;
  strEvent: string; // "Arsenal vs Liverpool"
  strFilename: string;
  strLeague: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string; // "Match Finished", "NS" (Not Started), or time
  strProgress?: string; // e.g. "63'"
  strThumb?: string; // Background image
  dateEvent: string;
  strTime: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strVideo?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

export interface MatchDetails extends MatchEvent {
  strDescriptionEN?: string;
  strTimeline?: string; // "12' Goal - Player; 45' Yellow Card..."
  strHomeGoalDetails?: string;
  strAwayGoalDetails?: string;
  strHomeYellowCards?: string;
  strAwayYellowCards?: string;
  strHomeRedCards?: string;
  strAwayRedCards?: string;
  strHomeLineupGoalkeeper?: string;
  strHomeLineupDefense?: string;
  strHomeLineupMidfield?: string;
  strHomeLineupForward?: string;
  strAwayLineupGoalkeeper?: string;
  strAwayLineupDefense?: string;
  strAwayLineupMidfield?: string;
  strAwayLineupForward?: string;
}
