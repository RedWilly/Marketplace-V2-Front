import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Flex, Image, Grid, Spinner } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { GET_COLLECTION_STATS, GET_LISTINGS_FOR_NFT_ADDRESS } from '../graphql/Queries';
import ERC721Abi from '../abi/erc721.json';
import { useWallet } from '../hooks/useWallet';

const Collection = () => {
    let { contractAddress } = useParams();
    // Converting contractAddress to lowercase to ensure consistency with the subgraph
    contractAddress = contractAddress.toLowerCase();
    const { library } = useWallet();
    const [collectionName, setCollectionName] = useState('');
    const [totalSupply, setTotalSupply] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state

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

    // Fetch collection name and total supply from the blockchain
    useEffect(() => {
        if (library && contractAddress) {
            const contract = new ethers.Contract(contractAddress, ERC721Abi, library);
            async function fetchCollectionDetails() {
                try {
                    console.log("Fetching collection details...");
                    const name = await contract.name();
                    console.log("Collection Name:", name);
                    setCollectionName(name);
                    // Assuming totalSupply is a method you want to call
                    const totalSupply = await contract.totalSupply();
                    console.log("Total Supply:", totalSupply.toString());
                    setTotalSupply(totalSupply.toString());
                } catch (error) {
                    console.error("Error fetching collection details:", error);
                }
            }
            fetchCollectionDetails();
        }
    }, [library, contractAddress]);

    // Correcting the listing metadata fetching process
    useEffect(() => {
        // Fetch NFT metadata as before but update individual loading states
        if (listingsData && listingsData.listings && library) {
            setLoading(true); // Set loading to true when starting to fetch
            const fetchListingsMetadata = async () => {
                const contract = new ethers.Contract(contractAddress, ERC721Abi, library);
                const updatedListings = [];
                for (const listing of listingsData.listings) {
                    try {
                        const tokenURI = await contract.tokenURI(listing.tokenId);
                        const metadataResponse = await fetch(tokenURI);
                        if (!metadataResponse.ok) {
                            throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`);
                        }
                        const metadata = await metadataResponse.json();
                        updatedListings.push({
                            ...listing,
                            image: metadata.image,
                            name: metadata.name,
                            loaded: true, // Mark as loaded
                        });
                    } catch (error) {
                        console.error("Error fetching token URI for listing:", listing, error);
                        updatedListings.push({
                            ...listing,
                            loaded: false, // Mark as error in loading
                        });
                    }
                }
                setListings(updatedListings);
                setLoading(false); // Set loading to false when finished
            };

            fetchListingsMetadata();
        }
    }, [listingsData, library, contractAddress]);

    if (loading) {
        return <Spinner size="xl" />;
    }

    return (
        <Box p={5}>
            <VStack spacing={8} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="2xl" fontWeight="bold">{collectionName}</Text>
                    <Box textAlign="right">
                        <Text fontSize="2xl" fontWeight="bold">{ethers.utils.formatEther(collectionStatsData?.collectionStats[0]?.totalVolumeTraded || "0")} ETH</Text>
                        <Text fontSize="lg" color="gray.600">Total Volume</Text>
                        {/* Displaying total supply */}
                        <Text fontSize="lg" color="gray.600">{totalSupply} supply</Text>
                    </Box>
                </Flex>
                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab>Listings</Tab>
                        <Tab>Sold</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Grid templateColumns="repeat(5, 1fr)" gap={6}>
                                {listings.map((listing, index) => (
                                    <Box key={index} p={6} shadow="md" borderWidth="1px">
                                        <Image src={listing.image} alt={listing.name} boxSize="150px" objectFit="cover" />
                                        <Text mt={2}>{listing.name}</Text>
                                        <Text>Price: {ethers.utils.formatEther(listing.price)} ETH</Text>
                                    </Box>
                                ))}
                            </Grid>
                        </TabPanel>
                        <TabPanel>
                            <Text>Sold content goes here...</Text>
                            {/* Future implementation for displaying sold items */}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default Collection;
