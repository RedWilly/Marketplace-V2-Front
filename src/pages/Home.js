import React, { useEffect, useState } from 'react';
import { Box, Grid, Image, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import whitelist from '../components/Whitelist';
import Nft from "../util/Nft";
import { useQuery } from '@apollo/client';
import { GET_MOST_RECENT_LISTING, GET_MOST_RECENT_SOLD } from '../graphql/Queries';
import { ethers } from 'ethers';
import BuyNow from '../components/Market/BuyNow';
import HeroSection from '../components/HeroSection';



// Manually import each image
import nuggetsImage from '../assets/IMG/nuggets.png';
import blastRidersImage from '../assets/IMG/blast_riders.png';
import apeImage from '../assets/IMG/ape.png';
import zkOkayDogImage from '../assets/IMG/zkokaydog.png';
import blastKnivesImage from '../assets/IMG/blast_knives.png';

// Map each collection name to its corresponding images
const images = {
  Nuggets: nuggetsImage,
  "Blast Riders": blastRidersImage,
  Ape: apeImage,
  "zkOkayDog": zkOkayDogImage,
  "Blast Knives": blastKnivesImage,
};

const Home = () => {
  const navigate = useNavigate();

  const { data: recentListingsData } = useQuery(GET_MOST_RECENT_LISTING);
  const { data: recentSalesData } = useQuery(GET_MOST_RECENT_SOLD);

  const [recentListings, setRecentListings] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    if (recentListingsData && recentListingsData.listings) {
      const fetchListingsMetadata = async () => {
        const listingsWithMetadata = await Promise.all(recentListingsData.listings.map(async (listing) => {
          const nft = new Nft(168587773, listing.erc721Address, listing.tokenId);
          const metadata = await nft.metadata();
          return {
            ...listing,
            name: metadata.name,
            image: nft.image(),
            //price: ethers.utils.formatEther(listing.price)
            displayPrice: ethers.utils.formatEther(listing.price), // Price for display
            price: listing.price // Original price in wei for transactions
          };
        }));
        setRecentListings(listingsWithMetadata);
      };
      fetchListingsMetadata();
    }
  }, [recentListingsData]);

  useEffect(() => {
    if (recentSalesData && recentSalesData.sales) {
      const fetchSalesMetadata = async () => {
        const salesWithMetadata = await Promise.all(recentSalesData.sales.map(async (sale) => {
          const nft = new Nft(168587773, sale.erc721Address, sale.tokenId);
          const metadata = await nft.metadata();
          return {
            ...sale,
            name: metadata.name,
            image: nft.image(),
            price: ethers.utils.formatEther(sale.price)
          };
        }));
        setRecentSales(salesWithMetadata);
      };
      fetchSalesMetadata();
    }
  }, [recentSalesData]);


  const handleCollectionClick = (address) => {
    navigate(`/collection/${address}`);
  };
  // Function to navigate to NFT detail page
  const navigateToNFTDetail = (erc721Address, tokenId) => {
    navigate(`/collection/${erc721Address}/${tokenId}`);
  };

  return (
    <>
      <HeroSection />
      <Box p={5}>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {Object.entries(whitelist).map(([name, address], index) => {
            const imageSrc = images[name];
            return (
              <Box key={index} p={5} shadow="md" borderWidth="1px" rounded="lg" _hover={{ shadow: "xl" }} cursor="pointer" onClick={() => handleCollectionClick(address)}>
                <Image src={imageSrc} alt={name} boxSize="150px" objectFit="cover" m="auto" />
                <Text mt={2} textAlign="center" fontWeight="bold">{name}</Text>
              </Box>
            );
          })}
        </Grid>
        <Box textAlign="center" mt={5}>
          <Button colorScheme="teal" onClick={() => navigate('/Explorer')}>View All Collections</Button>
        </Box>

        {/* Realtime Activity Section */}
        <Box mt={10}>
          <Heading as="h2" size="lg" textAlign="center" mb={4}>Realtime Activity</Heading>
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>New Listings</Tab>
              <Tab>Latest Sold</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                  {recentListings.map((item, index) => (
                    <Box key={index} p={5} shadow="md" borderWidth="1px" rounded="lg" cursor="pointer" onClick={() => navigateToNFTDetail(item.erc721Address, item.tokenId)}>
                      <Image src={item.image} alt={item.name} boxSize="150px" objectFit="cover" m="auto" />
                      <Text mt={2} textAlign="center" fontWeight="bold">{item.name}</Text>
                      <Text mt={2} textAlign="center">{item.displayPrice} ETH</Text>
                      <div onClick={(e) => e.stopPropagation()}>
                        <BuyNow erc721Address={item.erc721Address} tokenId={item.tokenId} price={item.price} />
                      </div>

                    </Box>
                  ))}
                </Grid>
              </TabPanel>
              <TabPanel>
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                  {recentSales.map((item, index) => (
                    <Box key={index} p={5} shadow="md" borderWidth="1px" rounded="lg" cursor="pointer" onClick={() => navigateToNFTDetail(item.erc721Address, item.tokenId)}>
                      <Image src={item.image} alt={item.name} boxSize="150px" objectFit="cover" m="auto" />
                      <Text mt={2} textAlign="center" fontWeight="bold">{item.name}</Text>
                      <Text mt={2} textAlign="center">{item.price} ETH</Text>
                      <Button colorScheme="teal" onClick={(e) => { e.stopPropagation(); navigateToNFTDetail(item.erc721Address, item.tokenId); }}>View Detail</Button>
                    </Box>
                  ))}
                </Grid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </>
  );
};

export default Home;
