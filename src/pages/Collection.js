import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Flex, Image, Grid } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { GET_COLLECTION_STATS, GET_LISTINGS_FOR_NFT_ADDRESS } from '../graphql/Queries';
import ERC721Abi from '../abi/erc721.json';
import { useWallet } from '../hooks/useWallet';
import BuyNow from '../components/Market/BuyNow';

const Collection = () => {
    let { contractAddress } = useParams();
    // Converting contractAddress to lowercase to ensure consistency with the subgraph
    contractAddress = contractAddress.toLowerCase();
    const { library } = useWallet();
    const [collectionName, setCollectionName] = useState('');
    const [totalSupply, setTotalSupply] = useState('');
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
    // useEffect(() => {
    //     if (listingsData && listingsData.listings && library) {
    //         console.log("Processing listings data...");
    //         const fetchListingsMetadata = async () => {
    //             const contract = new ethers.Contract(contractAddress, ERC721Abi, library);
    //             const updatedListings = await Promise.all(
    //                 listingsData.listings.map(async (listing) => {
    //                     try {
    //                         const tokenURI = await contract.tokenURI(listing.tokenId);
    //                         const metadataResponse = await fetch(tokenURI);
    //                         if (!metadataResponse.ok) {
    //                             throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`);
    //                         }
    //                         const metadata = await metadataResponse.json();
    //                         console.log("Fetched Metadata:", metadata);
    //                         return {
    //                             ...listing,
    //                             image: metadata.image,
    //                             name: metadata.name,
    //                         };
    //                     } catch (error) {
    //                         console.error("Error fetching token URI for listing:", listing, error);
    //                         return listing; // Return listing without metadata in case of error
    //                     }
    //                 })
    //             );
    //             console.log("Updated Listings with Metadata:", updatedListings);
    //             setListings(updatedListings);
    //         };

    //         fetchListingsMetadata();
    //     }
    // }, [listingsData, library, contractAddress]);
    useEffect(() => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (listingsData && listingsData.listings && library) {
            console.log("Processing listings data...");
            const fetchListingsMetadata = async () => {
                const contract = new ethers.Contract(contractAddress, ERC721Abi, library);
                const updatedListings = await Promise.all(
                    listingsData.listings
                        .filter(listing => parseInt(listing.expireTimestamp) > currentTimestamp) // Filter out expired listings
                        .map(async (listing) => {
                            try {
                                const tokenURI = await contract.tokenURI(listing.tokenId);
                                const metadataResponse = await fetch(tokenURI);
                                if (!metadataResponse.ok) {
                                    throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`);
                                }
                                const metadata = await metadataResponse.json();
                                console.log("Fetched Metadata:", metadata);
                                return {
                                    ...listing,
                                    image: metadata.image,
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
    }, [listingsData, library, contractAddress]);

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
                        {/* Displaying total supply */}
                        <Text fontSize="lg" color="gray.600">{totalSupply} supply</Text>
                    </Box>
                </Flex>
                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab>Listings</Tab>
                        <Tab>Sort</Tab>
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
                            <Text>sort by price, expiration, or by activities(listed,sold) goes here...</Text>
                            {/* Future implementation for displaying sold items */}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default Collection;
