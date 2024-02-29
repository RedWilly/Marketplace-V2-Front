import axios from "axios";

const middlewareBaseURL = 'https://rooni.site'; // Replace with your middleware's base URL this is a running on render free for testing

class Nft {
    constructor(chain, collection, id) {
        this.chain = chain
        this.collection = collection
        this.id = id
    }

    async metadata() {
        // Fetch metadata from your middleware
        const metadataResponse = await axios.get(`${middlewareBaseURL}/metadata/${this.chain}/${this.collection}/${this.id}`);
        if (metadataResponse.status !== 200 || !metadataResponse.data) {
            throw new Error('Failed to fetch metadata from middleware');
        }
        return metadataResponse.data;
    }

    image() {
        return `${middlewareBaseURL}/image/${this.chain}/${this.collection}/${this.id}`
    }

    async owner() {
        const metadataResponse = await axios.get(`${middlewareBaseURL}/owner/${this.chain}/${this.collection}/${this.id}`);
        if (metadataResponse.status !== 200 || !metadataResponse.data) {
            throw new Error('Failed to fetch metadata from middleware');
        }
        return metadataResponse.data.owner;
    }
}

export default Nft