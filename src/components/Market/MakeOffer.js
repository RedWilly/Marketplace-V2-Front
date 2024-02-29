import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    Image,
    Text,
    Box
} from '@chakra-ui/react';
import MarketABI from '../../abi/market.json';
import WETHABI from '../../abi/erc20.json';
import { useWallet } from '../../hooks/useWallet';

// Include nft in the component props
const MakeOffer = ({ isOpen, onClose, erc721Address, tokenId, nft }) => {
    const { account, library } = useWallet();
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const WETHAddress = process.env.REACT_APP_WETH_ADDRESS;
    const [value, setValue] = useState('');
    const [duration, setDuration] = useState('24h');
    const [isApproved, setIsApproved] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const checkAllowance = async () => {
            if (!account || !library) return;
            const signer = library.getSigner(account);
            const WETHContract = new ethers.Contract(WETHAddress, WETHABI, signer);
            const allowance = await WETHContract.allowance(account, marketplaceAddress);
            setIsApproved(allowance.gt(ethers.utils.parseEther(value || '0')));
        };
        checkAllowance();
    }, [account, library, value, WETHAddress, marketplaceAddress]);

    const calculateExpiryTimestamp = () => {
        let secondsToAdd;
        switch (duration) {
            case '24h':
                secondsToAdd = 24 * 60 * 60;
                break;
            case '7d':
                secondsToAdd = 7 * 24 * 60 * 60;
                break;
            case '1m':
                secondsToAdd = 30 * 24 * 60 * 60;
                break;
            case '3m':
                secondsToAdd = 3 * 30 * 24 * 60 * 60;
                break;
            case '6m':
                secondsToAdd = 6 * 30 * 24 * 60 * 60;
                break;
            default:
                secondsToAdd = 24 * 60 * 60; // Default to 24 hours
        }
        return Math.floor(Date.now() / 1000) + secondsToAdd;
    };

    const handleApprove = async () => {
        try {
            const signer = library.getSigner(account);
            const WETHContract = new ethers.Contract(WETHAddress, WETHABI, signer);
            const maxUint256 = ethers.constants.MaxUint256;
            const tx = await WETHContract.approve(marketplaceAddress, maxUint256);
            await tx.wait();
            setIsApproved(true);
            toast({
                title: "Approval successful",
                description: "You can now make an offer.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Approval failed:', error);
            toast({
                title: "Approval failed",
                description: "See console for more details.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSubmitOffer = async () => {
        if (!isApproved) {
            toast({
                title: "Not approved",
                description: "Please approve before making an offer.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const signer = library.getSigner(account);
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, signer);
            const expireTimestamp = calculateExpiryTimestamp();
            const tx = await marketContract.enterBidForToken(
                erc721Address,
                tokenId,
                ethers.utils.parseEther(value),
                expireTimestamp
            );
            await tx.wait();
            onClose(); // Close the modal
            toast({
                title: "Offer submitted successfully",
                description: "Your offer has been placed.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Offer submission failed:', error);
            toast({
                title: "Offer failed",
                description: "See console for more details.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Make an Offer</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {/* Displaying NFT Image and Name */}
                    <Box mb={4} textAlign="center">
                        <Image borderRadius="md" src={nft.image} alt={nft.name} boxSize="100px" objectFit="cover" m="auto" />
                        <Text fontWeight="bold" mt={2}>{nft.name}</Text>
                    </Box>
                    <FormControl>
                        <FormLabel>Amount in WETH</FormLabel>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter amount in WETH" />
                    </FormControl>
                    <FormControl mt={4}>
                        <FormLabel>Duration</FormLabel>
                        <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="1m">1 month</option>
                            <option value="3m">3 months</option>
                            <option value="6m">6 months</option>
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    {!isApproved && <Button colorScheme="blue" mr={3} onClick={handleApprove}>Approve</Button>}
                    <Button colorScheme="green" onClick={handleSubmitOffer}>Confirm Offer</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MakeOffer;
