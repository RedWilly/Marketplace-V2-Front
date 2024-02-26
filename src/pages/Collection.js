import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Flex, Image, Grid } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { GET_COLLECTION_STATS, GET_LISTINGS_FOR_NFT_ADDRESS, GET_COLLECTION_NAME } from '../graphql/Queries';
// import ERC721Abi from '../abi/erc721.json';
// import { useWallet } from '../hooks/useWallet';
import BuyNow from '../components/Market/BuyNow';
import Nft from "../util/Nft";

const Collection = () => {
    let { contractAddress } = useParams();
    // Converting contractAddress to lowercase to ensure consistency with the subgraph
    contractAddress = contractAddress.toLowerCase();
    // const { library } = useWallet();
    const [collectionName, setCollectionName] = useState('');
    const [listings, setListings] = useState([]);
    const navigate = useNavigate();


    // Fetch collection stats
    const { data: collectionStatsData } = useQuery(GET_COLLECTION_STATS, {
        variables: { id: contractAddress },
    });

    console.log("Collection Stats Data:", collectionStatsData);

    // Fetch listings for the NFT contract address
    const { data: listingsData } = useQuery(GET_LISTINGS_FOR_NFT_ADDRESS, {
        variables: { erc721Address: contractAddress },
    });
    console.log("Listings Data:", listingsData);

    // Fetch collection name from the GraphQL endpoint
    const { data: collectionNameData } = useQuery(GET_COLLECTION_NAME, {
        variables: { id: contractAddress },
    });

    useEffect(() => {
        if (collectionNameData && collectionNameData.collection) {
            const name = collectionNameData.collection.name;
            if (name) {
                console.log("Collection Name:", name);
                setCollectionName(name);
            }
            console.log("Collection Data:", collectionNameData);
        }
    }, [collectionNameData]);

    useEffect(() => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (listingsData && listingsData.listings) {
            console.log("Processing listings data...");
            const fetchListingsMetadata = async () => {
                const updatedListings = await Promise.all(
                    listingsData.listings
                        .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp) // Filter out expired listings
                        .map(async (listing) => {
                            try {
                                const nft = new Nft(168587773, contractAddress, listing.tokenId)
                                const metadata = await nft.metadata();
                                return {
                                    ...listing,
                                    image: nft.image(),
                                    name: metadata.name,
                                };
                            } catch (error) {
                                console.error("Error fetching token URI for listing:", listing, error);
                                return null; // Return null for listings with failed metadata fetch
                            }
                        })
                );
                console.log("Updated Listings with Metadata:", updatedListings);
                setListings(updatedListings.filter(listing => listing !== null)); // Filter out null values from failed metadata fetches
            };

            fetchListingsMetadata();
        }
    }, [listingsData, contractAddress]);

    //Handle NFT Clicks
    const handleNFTClick = (tokenId) => {
        navigate(`/collection/${contractAddress}/${tokenId}`);
    };

    return (
        <Box p={5}>
            <VStack spacing={8} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="2xl" fontWeight="bold">{collectionName}</Text>
                    <Box textAlign="right">
                        <Text fontSize="2xl" fontWeight="bold">{ethers.utils.formatEther(collectionStatsData?.collectionStats[0]?.totalVolumeTraded || "0")} ETH</Text>
                        <Text fontSize="lg" color="gray.600">Total Volume</Text>
                        {/* Description */}
                    </Box>
                </Flex>
                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab>Listings</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Grid templateColumns="repeat(5, 1fr)" gap={6}>
                                {listings.map((listing, index) => (
                                    <Box key={index} p={6} shadow="md" borderWidth="1px" cursor="pointer" onClick={() => handleNFTClick(listing.tokenId)}>
                                        <Image src={listing.image} alt={listing.name} boxSize="150px" objectFit="cover" />
                                        <Text mt={2}>{listing.name}</Text>
                                        <Text>Price: {ethers.utils.formatEther(listing.price)} ETH</Text>
                                        {/* Wrap the BuyNow component to prevent event propagation */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <BuyNow
                                                erc721Address={contractAddress}
                                                tokenId={listing.tokenId}
                                                price={listing.price}
                                            />
                                        </div>
                                    </Box>
                                ))}
                            </Grid>
                        </TabPanel>
                        <TabPanel>
                            <Text>sort by price (highest to lowest, lowest to highest), ending soon ( base on expireTimestamp listing.expireTimestamp )before here...</Text>
                            {/* Future implementation for displaying sold items */}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default Collection;
