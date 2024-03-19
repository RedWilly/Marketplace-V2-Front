import Nft from "../utils/Nft";

const ExploreNFThelper = async (AllListing) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (AllListing && AllListing.listings) {
        console.log("Processing listings data...");
        const updatedListings = await Promise.all(
            AllListing.listings
                .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp)
                .map(async (listing) => {
                    try {
                        // Fix the typo here from listing.erc721ddress to listing.erc721Address
                        const nft = new Nft(168587773, listing.erc721Address, listing.tokenId); // Fixed typo
                        const metadata = await nft.metadata();
                        console.log("Fetched Metadata: ", metadata);
                        return {
                            ...listing,
                            image: nft.image(),
                            name: metadata.name,
                        };
                    } catch (error) {
                        console.error("Error fetching token URI for listing:", listing, error);
                        return null;
                    }
                })
        );
        console.log("Updated Listings with Metadata:", updatedListings);
        return updatedListings.filter(listing => listing !== null);
    }
    return [];
};

export default ExploreNFThelper;