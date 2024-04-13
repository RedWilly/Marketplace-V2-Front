import axios from "axios";

// const apiBaseURL = 'https://rooni.site/market/api'; //http://localhost:3002/api
const apiBaseURL = process.env.REACT_APP_API_BASE_URL;

class MarketplaceApi {
    constructor() {
        this.apiBaseURL = apiBaseURL;
    }

    // --FLOORPRICE & TOTAL VOLUME SECTION --
    async fetchCollectionStats(erc721Address) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/collection-stats/${erc721Address}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching collection stats:', error);
            }
            throw new Error('Failed to fetch collection stats from API');
        }
    }

    // --SALES SECTION --
    // retrieves most recently sold NFTs on the marketplace
    async fetchSoldNFTs() {
        try {
            const response = await axios.get(`${this.apiBaseURL}/nfts/sold`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching sold NFTs:', error);
            }
            throw new Error('Failed to fetch sold NFTs from API');
        }
    }

    // retrieves sales for a specific NFT
    async fetchNFTSales(erc721Address, tokenId) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/nfts/${erc721Address}/${tokenId}/sales`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching NFT sales:', error);
            }
            throw new Error('Failed to fetch NFT sales from API');
        }
    }

    // Fetches the last sale for a specific NFT
    async fetchLastSaleForNFT(erc721Address, tokenId) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/nfts/${erc721Address}/${tokenId}/last-sale`);
            if (response.data && response.data.price) {
                return response.data;
            } else {
                console.log('No last sale data found for:', erc721Address, tokenId);
                return null;
            }
        } catch (error) {
            console.error('Error fetching the last sale for NFT:', erc721Address, tokenId, error);
            return null;
        }
    }


    // -- LISTING SECTION ---
    // fetch active listings
    async fetchActiveListings() {
        try {
            const response = await axios.get(`${this.apiBaseURL}/listings/active`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching active listings:', error);
            }
            throw new Error('Failed to fetch active listings from API');
        }
    }

    // fetch active listing for an NFT
    async fetchActiveListingForNFT(erc721Address, tokenId) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/listings/${erc721Address}/${tokenId}/active`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching active listing for NFT:', error);
            }
            throw new Error('Failed to fetch active listing for NFT from API');
        }
    }

    // fetches all active listings for a collection
    async fetchActiveListingsForCollection(erc721Address) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/listings/erc721/${erc721Address}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching active listings for collection:', error);
            }
            throw new Error('Failed to fetch active listings for collection from API');
        }
    }

    // fetch listings by a seller
    async fetchListingsBySeller(sellerAddress) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/listings/seller/${sellerAddress}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching listings for seller:', error);
            }
            throw new Error('Failed to fetch listings for seller from API');
        }
    }

    // -- BIDS SECTION --
    // fetch bids by a bidder
    async fetchBidsByBidder(bidderAddress) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/bids/bidder/${bidderAddress}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching bids by bidder:', error);
            }
            throw new Error('Failed to fetch bids by bidder from API');
        }
    }

    // fetch all active bids
    async fetchActiveBids() {
        try {
            const response = await axios.get(`${this.apiBaseURL}/bids/active`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching active bids:', error);
            }
            throw new Error('Failed to fetch active bids from API');
        }
    }

    // fetches active bids for a specific NFT
    async fetchActiveBidsForNFT(erc721Address, tokenId) {
        try {
            const response = await axios.get(`${this.apiBaseURL}/bids/${erc721Address}/${tokenId}/active`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching active bids for NFT:', error);
            }
            throw new Error('Failed to fetch active bids for NFT from API');
        }
    }
}

export default new MarketplaceApi();