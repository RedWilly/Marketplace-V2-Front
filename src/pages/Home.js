import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          The No Bulls**t NFT Marketplace
        </Text>
        <Text fontSize="xl" textAlign="center">
          An NFT Marketplace for Collectors
        </Text>
        <Text fontSize="md" textAlign="center" mb={4}>
          Search Your Favorite NFT Collections
        </Text>
      </VStack>
    </Box>
  );
};

export default Home;
