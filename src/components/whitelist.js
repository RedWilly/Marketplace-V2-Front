//have added a social link so on the collection page if exist show else dont show any socials

const whitelist = {
    "Nuggets": {
        address: "0xb9eE65be6b413fcB711ced63cCA8EFFB3AE445e7",
        image: require("../assets/IMG/nuggets.png"),
        coverImage: require("../assets/IMG/nugget_cover1.jpg"),
        description: `Nuggets are 10000 of the hottest Fusion of Cackles and Mutants on the  BitTorrent each having it's own unique properties.`,
        website: "https://nuggets.cfd/",
        // twitter: "https://x.com/",
        // telegram: "https://t.me/",
        // discord: "https://discord.com/",
        // youtube: "https://youtube.com/"
    },
    "BitTorrent Web3 Domain": {
        address: "0xA1019535E6b364523949EaF45F4B17521c1cb074",
        image: require("../assets/IMG/trx.png"),
        coverImage: require("../assets/IMG/btt_cover.png"),
        description: `BitTorrent Web3 Domains. Your Perfect Multi-chain Identity.`,
        website: "https://trxdomains.xyz/bttc",
        twitter: "https://twitter.com/TrxDomains"
    },
    "Ohayo": {
        address: "0xA27A2A0F6A60574A6084A9a1A894c173237cED24",
        image: require("../assets/IMG/ohayo.png"),
        coverImage: "../assets/IMG/nuggets_cover.png",
        description: `This is a collection with "Turkis" as Background.`
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
