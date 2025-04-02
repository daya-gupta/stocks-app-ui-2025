// import '../../../envConfig'

export const smaOptions = [
    { label: '10 Day', value: 10 },
    { label: '20 Day', value: 20 },
    { label: '50 Day', value: 50 },
    { label: '100 Day', value: 100 },
    { label: '200 Day', value: 200 },
];

export const intervalOptions = [
    { label: '1 minute', value: '1minute' },
    { label: '30 minute', value: '30minute' },
    { label: '1 day', value: 'day' },
    { label: '1 week', value: 'week' },
];

type GlobalListMap = {
    [key: string]: { name: string; exchange: string }
}

export const GLOBAL_LIST: GlobalListMap = {
    "BSE_INDEX%7CAUTO": {
        name: "BSE Auto",
        exchange: "BSE_INDEX",
    },
    "NSE_INDEX%7CNifty%2050": {
        name: "Nifty 50",
        exchange: "NSE_INDEX",
    },
    "NSE_EQ%7CINE848E01016": {
        "name": "NHPC Ltd",
        "exchange": "NSE_EQ",
    },
    "NSE_EQ%7CINE752E01010": {
        "name": "Power Grid",
        "exchange": "NSE_EQ",
    },
    "NSE_EQ%7CINE251B01027": {
        name: "Zen Technologies",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE613B01010": {
        name: "CDSL",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE138Y01010": {
        name: "KFIN Technologies",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE596I01012": {
        name: "CAMS",
        exchange: "NSE_EQ",
    },
    "BSE_EQ%7CINE015C01016": {
        name: "Tinna Rubber",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE457L01029": {
        name: "PG electroplast",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE481N01025": {
        name: "Home First finance",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE542W01025": {
        name: "KPI Green Energy",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE00VM01036": {
        name: "Manorama Industries",
        exchange: "NSE_EQ",
    },

    "NSE_EQ%7CINE200M01039": {
        name: "Varun Beverages",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE04I401011": {
        name: "KPIT Technologies",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE475E01026": {
        name: "Caplin Point Labs",
        exchange: "NSE_EQ",
    },
    "BSE_EQ%7CINE024F01011": {
        name: "Shilchar Technologies",
        exchange: "BSE_EQ",
    },
    "NSE_EQ%7CINE731H01025": {
        name: "Action Construction",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE07K301024": {
        name: "Zaggle Prepaid",
        exchange: "NSE_EQ",
    },

    "NSE_EQ%7CINE015C01016": {
        name: "Tinna Rubber",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE00F201020": {
        name: "Prudent Corporate Adv",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE439E01022": {
        name: "Skipper",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE01IU01018": {
        name: "Sky Gold",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE953R01016": {
        name: "PNG Jewellery",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE463V01026": {
        name: "Anand Rathi Wealth",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE043W01024": {
        name: "Vijaya Diagnostics",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE152M01016": {
        name: "Triveni Turbine",
        exchange: "NSE_EQ",
    },

    // Tinna Rubber
    // PG electroplast
    // Home First finance
    // KPI Green Energy
    // Manorama Industries
    // CDSL
    // KFin Technologies
    // CAMS
    // KPIT Technologies
    // Balu Forge Industries

    "NSE_EQ%7CINE011E01029": {
        name: "Balu Forge",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE00E101023": {
        name: "Bikaji Foods",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE024L01027": {
        name: "Gravita India",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE918Z01012": {
        name: "Kaynes Tech",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE619B01017": {
        name: "Newgen Software",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE399G01023": {
        name: "Ramkrishana Forging",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE0CLI01024": {
        name: "Rategain Travel",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE631A01022": {
        name: "Shanthi Gears",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE721A01047": {
        name: "Shriram Finance",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE405E01023": {
        name: "Uno Minda",
        exchange: "NSE_EQ",
    },
    "NSE_EQ%7CINE071N01016": {
        name: "Epigral Limited",
        exchange: "NSE_EQ",
    },
};

export const baseUrl = 'http://localhost:3000';

export const instruments = [
    "NSE_EQ%7CINE731H01025", //ACE
    "NSE_EQ%7CINE463V01026", // anand rathi
    "NSE_EQ%7CINE011E01029", // balu forge
    "NSE_EQ%7CINE00E101023", // bikaji
    "NSE_EQ%7CINE475E01026", //caplin-point
    "NSE_EQ%7CINE613B01010", // cdsl
    "NSE_EQ%7CINE596I01012", //cams
    "NSE_EQ%7CINE071N01016", // epigral
    "NSE_EQ%7CINE024L01027", // gravita
    "NSE_EQ%7CINE481N01025", //home first
    "NSE_EQ%7CINE918Z01012", // kaynes
    "NSE_EQ%7CINE138Y01010", // kfin
    "NSE_EQ%7CINE542W01025", // kpi green
    "NSE_EQ%7CINE04I401011", // KPIT
    "NSE_EQ%7CINE00VM01036", // manorama
    "NSE_EQ%7CINE619B01017", // newgen
    "NSE_EQ%7CINE953R01016", //png jewellers
    "NSE_EQ%7CINE457L01029", // pg electroplast
    "NSE_EQ%7CINE399G01023", // rk forging
    "NSE_EQ%7CINE0CLI01024", // rate gain
    "NSE_EQ%7CINE631A01022", // shanthi gears
    "BSE_EQ%7CINE024F01011", //shilchar
    "NSE_EQ%7CINE721A01047", // shriram finance
    "NSE_EQ%7CINE01IU01018", //sky gold
    "BSE_EQ%7CINE015C01016", //Tinna Rubber
    "NSE_EQ%7CINE152M01016", // triveni turbine
    "NSE_EQ%7CINE405E01023", // uno minda
    "NSE_EQ%7CINE200M01039", //VBL
    "NSE_EQ%7CINE07K301024", //Zaggle
    "NSE_EQ%7CINE251B01027", // zen technologies
    "NSE_INDEX%7CNifty%2050",


    // "NSE_EQ%7CINE00F201020", //prudent
    // "NSE_EQ%7CINE439E01022", //skipper
    // "NSE_EQ%7CINE043W01024", //vijaya diagnostics
    // "NSE_INDEX%7CNifty%20Smallcap%20250",
    // "NSE_INDEX%7CINEB000B0Z12",
];

// export const baseUrl = `${process.env.API_URL}:${process.env.PORT}`;
