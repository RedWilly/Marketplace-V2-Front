import { gql } from '@apollo/client';

// Query for getting all listed NFTs
export const GET_ALL_LISTED_NFTS = gql`
  query GetAllListedNFTs {
    listings(where: {status: "Active"}) {
      id
      erc721Address
      tokenId
      seller
      price
      expireTimestamp
      status
    }
  }
`;

//Get all Active Listing for a specific NFT Contract Addresss
export const GET_LISTINGS_FOR_NFT_ADDRESS = gql`
  query GetListingsForNFTAddress($erc721Address: Bytes!) {
    listings(where: {erc721Address: $erc721Address, status: "Active"}) {
      id
      tokenId
      seller
      price
      expireTimestamp
      status
    }
  }
`;

// Query for getting all active listing based on erc721Address and tokenId
export const GET_ACTIVE_LISTING_BY_NFT = gql`
  query GetActiveListingByNFT($erc721Address: Bytes!, $tokenId: BigInt!) {
    listings(where: {erc721Address: $erc721Address, tokenId: $tokenId, status: "Active"}) {
      id
      erc721Address
      tokenId
      seller
      price
      expireTimestamp
      status
    }
  }
`;

// Query for getting all listed NFTs for a specific address
export const GET_LISTED_NFTS_FOR_ADDRESS = gql`
  query GetListedNFTsForAddress($seller: Bytes!) {
    listings(where: {seller: $seller, status: "Active"}) {
      id
      erc721Address
      tokenId
      seller
      price
      expireTimestamp
      status
    }
  }
`;

// Query for getting all bids made by a specific address
export const GET_BIDS_BY_ADDRESS = gql`
  query GetBidsByAddress($bidder: Bytes!) {
    bids(where: {bidder: $bidder}) {
      id
      erc721Address
      tokenId
      bidder
      value
      expireTimestamp
      status
    }
  }
`;

// Query for getting all active bids
export const GET_ALL_ACTIVE_BIDS = gql`
  query GetAllActiveBids {
    bids(where: {status: "Active"}) {
      id
      erc721Address
      tokenId
      bidder
      value
      expireTimestamp
      status
    }
  }
`;

// Query for getting all active bids based on erc721Address and tokenId
export const GET_ACTIVE_BIDS_FOR_NFT = gql`
  query GetActiveBidsForNFT($erc721Address: String!, $tokenId: String!) {
    bids(where: {
      erc721Address: $erc721Address, 
      tokenId: $tokenId, 
      status: "Active"
    }) {
      id
      erc721Address
      tokenId
      bidder
      value
      expireTimestamp
      status
    }
  }
`;

//get all sold for a specific nft
export const GET_ALL_SOLD_FOR_NFT = gql`
  query GetAllSoldForNFT($erc721Address: String!, $tokenId: String!) {
    sales(where: {
      erc721Address: $erc721Address,
      tokenId: $tokenId
    }) {
      id
      buyer
      seller
      price
      timestamp
      tokenId
      erc721Address
      status
    }
  }
`;


// GraphQL query to fetch all sold NFTs, sorted from latest to oldest
export const GET_ALL_SOLD_NFTS_RANKED = gql`
  query GetAllSoldNFTsRanked {
    sales(where: {status: "Sold"}, orderBy: timestamp, orderDirection: desc) {
      id
      erc721Address
      tokenId
      buyer
      seller
      price
      timestamp
    }
  }
`;

//get total volume trade for a collection
export const GET_COLLECTION_STATS = gql`
  query GetCollectionStats($id: ID!) {
    collectionStats(where: {id: $id}) {
      id
      floorPrice
      totalVolumeTraded
      totalVolumeTradedWETH
    }
  }
`;


// Get  the ALL nfts owned by a specific user/wallet
export const GET_ALL_NFTS_OWNED_BY_USER = gql`
  query GetAllNFTsOwnedByUser($owner: Bytes!) {
    erc721S(where: {owner: $owner}) {
      address
      tokenId
      owner
    }
  }
`;

//query to get nft collection name
export const GET_COLLECTION_NAME = gql`
query GetCollectionName($id: ID!) {
  collection(id: $id) {
    id
    name
  }
}
`;


//query to get the newest listing
export const GET_MOST_RECENT_LISTING = gql`
  query GetMostRecentListing {
    listings(orderBy: listedTimestamp, orderDirection: desc) {
      id
      erc721Address
      tokenId
      seller
      price
      expireTimestamp
      listedTimestamp
      status
    }
  }
`;

//query for getting most recently sold
export const GET_MOST_RECENT_SOLD = gql`
  query GetMostRecentSold {
    sales(orderBy: timestamp, orderDirection: desc) {
      id
      erc721Address
      tokenId
      buyer
      seller
      price
      serviceFee
      royaltyFee
      timestamp
      status
      txid
    }
  }
`;