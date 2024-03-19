//have added a social link so on the collection page if exist show else dont show any socials

const whitelist = {
    "Nuggets": {
        address: "0xdcb5bE2582A7B10ECF07B5A56c1bED524B7d90d0",
        image: require("../assets/IMG/nuggets.png"),
        coverImage: require("../assets/IMG/nuggets_cover.png"),
        description: `Nuggets are 10000 of the hottest Fusion of Cackles and Mutants on the Blast each having it's own unique properties.`,
        twitter: "https://x.com/",
        telegram: "https://t.me/",
        discord: "https://discord.com/",
        youtube: "https://youtube.com/"
    },
    "Blast Riders": {
        address: "0x85668115c044e57a1d57e05eb2e2ec9983c0a566",
        image: require("../assets/IMG/blast_riders.png"),
        coverImage: "../assets/IMG/BlastRiders_cover.png",
        description: `Space Pilots in the Blast Space.`
    },
    "Ape": {
        address: "0x6a7a53fa2c37a86be698f5c905aca5f114348dbe",
        image: require("../assets/IMG/ape.png"),
        coverImage: "../assets/IMG/Ape_cover.png",
        description: `This is a token with "Turkis" as Background.`
    },
    "zkOkayDog": {
        address: "0xf1b2fe759e3cccf89e16497d5b3f8a9db6cfba76",
        image: require("../assets/IMG/zkokaydog.png"),
        coverImage: "../assets/IMG/zkOkayDog_cover.png",
        description: `10000 zkOkayDog on zkSync Era`
    },
    "Blast Knives": {
        address: "0xf6c766e43c69a25f4e225a4f7e606f9fdb1d94a0",
        image: require("../assets/IMG/blast_knives.png"),
        coverImage: "../assets/IMG/BlastKnives_cover.png",
        description: `A collection of 3333 hand drawn NFTs, coming back to life in the upcoming BLAST network.`
    },
    "EasyX": {
        address: "0xb8A7c8A971ce18E2B4751b54af3d57562dc4D77B",
        image: require("../assets/IMG/easyx.png"),
        coverImage: "../assets/IMG/BlastKnives_cover.png",
        description: `Minted by Galxe Campaign: EasyX - The Easiest Drop, ever.`
    }
};

export default whitelist;
