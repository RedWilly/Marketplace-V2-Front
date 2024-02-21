import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json';
import WETHABI from '../../abi/erc20.json';
import { useWallet } from '../../hooks/useWallet';

const wethAddress = process.env.REACT_APP_WETH_ADDRESS;

const MakeOffer = ({ isOpen, onClose, erc721Address, tokenId }) => {
    const [offerAmount, setOfferAmount] = useState('');
    const [isApproved, setIsApproved] = useState(false);
    const { account, library } = useWallet();
    const toast = useToast();

    useEffect(() => {
        const checkApproval = async () => {
            if (!library || !account) return;
            const wethContract = new ethers.Contract(wethAddress, WETHABI, library);
            const allowance = await wethContract.allowance(account, erc721Address);
            setIsApproved(allowance.gt(0));
        };

        checkApproval();
    }, [library, account, erc721Address]);

    const handleApproval = async () => {
        if (!library || !account) return;
        const wethContract = new ethers.Contract(wethAddress, WETHABI, library.getSigner());
        try {
            const tx = await wethContract.approve(erc721Address, ethers.constants.MaxUint256);
            await tx.wait();
            setIsApproved(true);
            toast({
                title: "Approval Successful",
                description: "You can now make offers.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Approval error:', error);
            toast({
                title: "Approval Failed",
                description: "Please try again.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleMakeOffer = async () => {
        if (!library || !account || !isApproved) return;
        const marketContract = new ethers.Contract(erc721Address, MarketABI, library.getSigner());
        const offerValueInWei = ethers.utils.parseUnits(offerAmount, 'ether');

        try {
            const tx = await marketContract.enterBidForToken(erc721Address, tokenId, offerValueInWei, Math.floor(Date.now() / 1000) + (24 * 60 * 60)); // Example: Expires in 24 hours
            await tx.wait();
            onClose();
            toast({
                title: "Offer Made Successfully",
                description: "Your offer has been placed.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Make offer error:', error);
            toast({
                title: "Offer Failed",
                description: "Please try again.",
                status: "error",
                duration: 9000,
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
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Offer Amount in WETH</FormLabel>
                        <Input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="Enter amount" />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    {!isApproved && (
                        <Button colorScheme="blue" mr={3} onClick={handleApproval}>
                            Approve
                        </Button>
                    )}
                    <Button colorScheme="green" mr={3} onClick={handleMakeOffer} isDisabled={!isApproved}>
                        Confirm Offer
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MakeOffer;
