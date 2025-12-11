import axios from 'axios';

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

async function testApi() {
  try {
    console.log("Searching for Premier League...");
    const res = await axios.get(`${API_BASE_URL}/search_all_leagues.php?c=England`);
    const leagues = res.data.countrys || [];
    console.log("Leagues found:", leagues.map((l: any) => `${l.strLeague} (${l.idLeague})`));
    const epl = leagues.find((l: any) => l.strLeague === 'English Premier League');
    console.log("Found EPL:", epl);

    if (epl) {
        const id = epl.idLeague;
        console.log("Fetching next for ID:", id);
        const nextRes = await axios.get(`${API_BASE_URL}/eventsnextleague.php?id=${id}`);
        if (nextRes.data.events?.length > 0) {
            console.log("Sample Next:", nextRes.data.events[0].dateEvent, nextRes.data.events[0].strEvent);
        }
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

testApi();
