import React from 'react';
import { Box, Flex, Heading, Text, Stack } from '@chakra-ui/react';
import { ReactComponent as LightningIcon } from '../assets/icons/lightning.svg';
import { ReactComponent as HeartIcon } from '../assets/icons/heart.svg';
import { ReactComponent as AggregateIcon } from '../assets/icons/brig.svg';
import backgroundImage from '../assets/IMG/background.png';

const HeroSection = () => {
    return (
        <Box
            bgImage={`url(${backgroundImage})`}
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            color="white"
            height="lg"
        >
            <Flex
                direction="column"
                justify="center"
                align="center"
                height="100%"
                bg="rgba(0, 0, 0, 0.5)" // semi-transparent overlay
                paddingY="8"
            >
                <Heading as="h1" size="2xl" textAlign="center" mb="4">
                    AN NFT MARKETPLACE FOR COLLECTORS
                </Heading>
                <Text fontSize="xl" textAlign="center" mb="8">
                    SEARCH YOUR FAVORITE NFT COLLECTIONS
                </Text>
                <Stack direction="row" spacing="10" align="center" justify="center">
                    <Flex align="center">
                        <LightningIcon style={{ marginRight: '8px' }} />
                        <Text>FULL ROYALTIES HONORED</Text>
                    </Flex>
                    <Flex align="center">
                        <AggregateIcon style={{ marginRight: '8px' }} /> {/* Use your aggregate icon */}
                        <Text>For ALL COLLECTIONS</Text>
                    </Flex>
                    <Flex align="center">
                        <HeartIcon style={{ marginRight: '8px' }} />
                        <Text>NO FEES FROM COLLECTLE</Text>
                    </Flex>
                </Stack>
            </Flex>
        </Box>
    );
};

export default HeroSection;
