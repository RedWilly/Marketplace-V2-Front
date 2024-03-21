import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json';
import ERC721ABI from '../../abi/erc721.json';
import { useWallet } from '../../hooks/useWallet';

import {
    useToast
} from '@chakra-ui/react';

const AcceptOffer = ({ isOpen, onClose, erc721Address, tokenId, bidder, value, onAccepted }) => {
    const { account, library } = useWallet();
    const [isApproved, setIsApproved] = useState(false);
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const toast = useToast();

    useEffect(() => {
        const fetchOwner = async () => {
            if (!library || !erc721Address || !tokenId) return;
            try {
                const contract = new ethers.Contract(erc721Address, ERC721ABI, library);
                const owner = await contract.ownerOf(tokenId);
                console.log(`Owner of NFT (Token ID: ${tokenId}):`, owner);
            } catch (error) {
                console.error("Error fetching NFT owner:", error);
            }
        };
        fetchOwner();
    }, [library, erc721Address, tokenId]);

    useEffect(() => {
        const checkApproval = async () => {
            if (!account || !library || !erc721Address) return;
            const contract = new ethers.Contract(erc721Address, ERC721ABI, library.getSigner());
            const isApproved = await contract.isApprovedForAll(account, marketplaceAddress);
            setIsApproved(isApproved);
        };
        checkApproval();
    }, [account, library, erc721Address, marketplaceAddress]);

    const handleApprove = async () => {
        if (!erc721Address) {
            console.error("ERC721 Address is undefined");
            return;
        }
        const contract = new ethers.Contract(erc721Address, ERC721ABI, library.getSigner());
        try {
            const tx = await contract.setApprovalForAll(marketplaceAddress, true);
            await tx.wait();
            setIsApproved(true);
            toast({
                title: 'Approval successful',
                description: 'The contract is now approved to transfer your NFT.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Approval failed',
                description: `Error: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAcceptOffer = async () => {
        if (!isApproved) {
            toast({
                title: 'Not approved',
                description: 'Please approve the Marketplace Contract to transfer NFT.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
        try {
            const tx = await marketContract.acceptBidForToken(
                erc721Address,
                tokenId,
                bidder,
                ethers.utils.parseUnits(value.toString(), 'wei')
            );
            await tx.wait();
            onClose(); // Close the modal
            toast({
                title: 'Offer accepted successfully',
                description: 'The NFT has been successfully transferred to the bidder.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            if(onAccepted) {
                onAccepted()
            }
        } catch (error) {
            toast({
                title: 'Accept offer failed',
                description: `Error: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center bg-black-500/80" onClick={onClose}>
            <div className="relative mx-auto p-5 sm:px-0 w-96 shadow-lg rounded-md bg-white dark:bg-black-600 sm:w-[90%]" onClick={e => e.stopPropagation()}>
                <div className="mt-3 text-center">
                    <h3 className="text-xl font-semibold font-Kallisto dark:text-white">Accept Offer</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-black-400 dark:text-white">
                            Are you sure you want to accept this offer?
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-6 gap-3 border-t border-solid border-gray-200 rounded-b">
                    {!isApproved && (
                        <button
                            className='text-[12px] sm:px-6 py-1 sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out'
                            onClick={handleApprove}>
                            Approve
                        </button>
                    )}
                    <button
                        disabled={!isApproved}
                        className='text-[12px] sm:px-6 py-1 sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out'
                        onClick={handleAcceptOffer}>
                        Accept Offer
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AcceptOffer;
