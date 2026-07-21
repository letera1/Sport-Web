// ========================
// Base Types
// ========================

export interface Team {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
}

export interface MatchEvent {
  idEvent: string;
  strEvent: string;
  strFilename: string;
  strLeague: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strProgress?: string;
  strThumb?: string;
  dateEvent: string;
  strTime: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strVideo?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  intRound?: string;
  strVenue?: string;
  strCountry?: string;
  strPostponement?: string;
  idLeague?: string;
}

export interface MatchDetails extends MatchEvent {
  strDescriptionEN?: string;
  strTimeline?: string;
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
  strHomeLineupSubstitutes?: string;
  strHomeFormation?: string;
  strAwayLineupGoalkeeper?: string;
  strAwayLineupDefense?: string;
  strAwayLineupMidfield?: string;
  strAwayLineupForward?: string;
  strAwayLineupSubstitutes?: string;
  strAwayFormation?: string;
  intHomeShots?: string;
  intAwayShots?: string;
  strTVStation?: string;
  idVenue?: string;
}

// ========================
// League & Standings
// ========================

export interface LeagueDetails {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate?: string;
  intFormedYear?: string;
  strCountry?: string;
  strDescriptionEN?: string;
  strBadge?: string;
  strLogo?: string;
  strFanart1?: string;
  strFanart2?: string;
  strFanart3?: string;
  strFanart4?: string;
  strBanner?: string;
  strPoster?: string;
  strTrophy?: string;
  strNaming?: string;
  strCurrentSeason?: string;
}

export interface StandingsEntry {
  idStanding?: string;
  intRank: string;
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  idLeague: string;
  strLeague: string;
  strSeason: string;
  strForm?: string;
  strDescription?: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  dateUpdated?: string;
}

// ========================
// Team Details
// ========================

export interface TeamDetails {
  idTeam: string;
  strTeam: string;
  strTeamAlternate?: string;
  strTeamShort?: string;
  intFormedYear?: string;
  strSport?: string;
  strLeague?: string;
  idLeague?: string;
  strStadium?: string;
  strStadiumThumb?: string;
  strStadiumDescription?: string;
  strStadiumLocation?: string;
  intStadiumCapacity?: string;
  strWebsite?: string;
  strFacebook?: string;
  strTwitter?: string;
  strInstagram?: string;
  strYoutube?: string;
  strDescriptionEN?: string;
  strCountry?: string;
  strTeamBadge?: string;
  strTeamJersey?: string;
  strTeamLogo?: string;
  strTeamFanart1?: string;
  strTeamFanart2?: string;
  strTeamFanart3?: string;
  strTeamFanart4?: string;
  strTeamBanner?: string;
  strManager?: string;
  strKeywords?: string;
}

export interface Equipment {
  idEquipment: string;
  strEquipment?: string;
  strSeason?: string;
  strType?: string;
  strEquipment?: string;
}

// ========================
// Player Details
// ========================

export interface PlayerDetails {
  idPlayer: string;
  strPlayer: string;
  strPlayerAlternate?: string;
  strNationality?: string;
  strTeam?: string;
  idTeam?: string;
  strSport?: string;
  dateBorn?: string;
  strNumber?: string;
  strPosition?: string;
  strHeight?: string;
  strWeight?: string;
  strDescriptionEN?: string;
  strGender?: string;
  strSide?: string;
  strCollege?: string;
  strFacebook?: string;
  strWebsite?: string;
  strTwitter?: string;
  strInstagram?: string;
  strYoutube?: string;
  strThumb?: string;
  strCutout?: string;
  strRender?: string;
  strBanner?: string;
  strFanart1?: string;
  strFanart2?: string;
  strFanart3?: string;
  strFanart4?: string;
  strAgent?: string;
  strBirthLocation?: string;
  strEthnicity?: string;
  strStatus?: string;
  strKit?: string;
  strWage?: string;
  strBirthLocation?: string;
  strOutfitter?: string;
  intLoved?: string;
}

export interface PlayerHonour {
  id: string;
  idPlayer: string;
  strPlayer?: string;
  strTeam?: string;
  strHonour: string;
  strSeason: string;
  strSport?: string;
}

export interface PlayerContract {
  id: string;
  idPlayer: string;
  strPlayer?: string;
  strTeam?: string;
  strTeamBadge?: string;
  strSport?: string;
  strYearStart?: string;
  strYearEnd?: string;
  strWage?: string;
}

export interface FormerTeam {
  id: string;
  idPlayer: string;
  strPlayer?: string;
  strFormerTeam: string;
  strTeamBadge?: string;
  strJoined?: string;
  strDeparted?: string;
  strSport?: string;
  strMoveType?: string;
}

export interface PlayerMilestone {
  id: string;
  idPlayer: string;
  strPlayer?: string;
  strMilestone: string;
  strSport?: string;
}

export interface PlayerStats {
  idStat?: string;
  idPlayer?: string;
  strPlayer?: string;
  strTeam?: string;
  strSeason?: string;
  strSport?: string;
  // Soccer-specific
  intGoals?: string;
  intAssists?: string;
  intAppearances?: string;
  intMinutesPlayed?: string;
  intYellowCards?: string;
  intRedCards?: string;
  intCleanSheets?: string;
  intSaves?: string;
  intPenalties?: string;
  intFouls?: string;
  [key: string]: string | undefined;
}

// ========================
// Event Extras
// ========================

export interface EventTimeline {
  idTimeline?: string;
  idEvent?: string;
  strTimeline?: string;
  strTimelineDetail?: string;
  strHome?: string;
  strEvent?: string;
  strPlayer?: string;
  strAssist?: string;
  intTime?: string;
  idAPIfootball?: string;
  strComment?: string;
  strTeam?: string;
}

export interface EventLineup {
  idLineup?: string;
  idEvent?: string;
  strEvent?: string;
  strLineup?: string;
  strPosition?: string;
  strPositionShort?: string;
  strPlayer?: string;
  strSeason?: string;
  strTeam?: string;
  strFormation?: string;
  strHome?: string;
  intSquadNumber?: string;
  strSubstitute?: string;
  strPlayerThumb?: string;
  strPlayerCutout?: string;
  idPlayer?: string;
  idTeam?: string;
}

export interface EventResult {
  idResult?: string;
  idEvent?: string;
  strEvent?: string;
  strResult?: string;
  strPlayer?: string;
  strDetail?: string;
  intMinute?: string;
  strTeam?: string;
  strSeason?: string;
  strSport?: string;
  idPlayer?: string;
}

export interface VideoHighlight {
  idEvent?: string;
  strEvent?: string;
  strVideo?: string;
  strThumb?: string;
  dateEvent?: string;
  strSport?: string;
  strLeague?: string;
  strSeason?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
}

export interface TVSchedule {
  idChannel?: string;
  strChannel?: string;
  strCountry?: string;
  strLogo?: string;
  idEvent?: string;
  strEvent?: string;
  strSport?: string;
  dateEvent?: string;
  strTime?: string;
  strLeague?: string;
  strSeason?: string;
}
