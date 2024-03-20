import React, { useState } from 'react';
import { ethers } from 'ethers';
import ERC721ABI from '../../abi/erc721.json';
import MarketABI from '../../abi/market.json';
import { useWallet } from '../../hooks/useWallet';

import {
    useToast
} from '@chakra-ui/react';

const ListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('24h');
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { account, library } = useWallet();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false); // State to track loading

    const listNFT = async () => {
        if (!price || !duration || !account || !library) {
            toast({
                title: 'Error',
                description: 'Please ensure you have entered a valid price and duration.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true); // Set loading state to true when listing NFT

        const erc721Contract = new ethers.Contract(contractAddress, ERC721ABI, library.getSigner());
        const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
        const priceInWei = ethers.utils.parseEther(price);

        let expiryTimestamp = Date.now() / 1000; // current timestamp in seconds
        switch (duration) {
            case '24h':
                expiryTimestamp += 24 * 60 * 60;
                break;
            case '7d':
                expiryTimestamp += 7 * 24 * 60 * 60;
                break;
            case '1m':
                expiryTimestamp += 30 * 24 * 60 * 60;
                break;
            case '3m':
                expiryTimestamp += 3 * 30 * 24 * 60 * 60;
                break;
            case '6m':
                expiryTimestamp += 6 * 30 * 24 * 60 * 60;
                break;
            default:
                expiryTimestamp += 24 * 60 * 60; // default to 24 hours
        }

        try {
            const isApproved = await erc721Contract.isApprovedForAll(account, marketplaceAddress);
            if (!isApproved) {
                const txApprove = await erc721Contract.setApprovalForAll(marketplaceAddress, true);
                await txApprove.wait();
            }

            const txList = await marketContract.listToken(contractAddress, tokenId, priceInWei, Math.floor(expiryTimestamp));
            await txList.wait();

            toast({
                title: 'Listing Successful',
                description: 'Your NFT has been successfully listed.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error('Failed to list NFT:', error);
            toast({
                title: 'Listing Failed',
                description: 'Failed to list NFT. Please check the console for details.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false); // Set loading state to false after listing completes or fails
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full bg-black-500/80" onClick={onClose}></div>
            <div className="fixed top-20 left-1/4 right-1/4 bg-white rounded-lg shadow-xl p-6 dark:bg-black-600 sm:right-5 sm:left-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="ext-xl font-semibold font-Kallisto dark:text-white">List NFT for Sale</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:text-white">
                        <span className="sr-only">Close</span>X
                    </button>
                </div>
                <div className='flex gap-4'>
                    <div className="mb-4 w-[50%] flex-col flex gap-1">
                        <label htmlFor="price" className="text-sm text-black-50 font-Kallisto dark:text-grey-100">Price in ETH</label>
                        <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 mb-3 text-sm bg-transparent border-[1px] border-black-50 rounded-md outline-none text-black-50 font-Kallisto dark:text-grey-100" placeholder="Enter price in ETH" />
                    </div>
                    <div className="mb-4 w-[50%] flex-col flex gap-1">
                        <label htmlFor="duration" className="text-sm text-black-50 font-Kallisto dark:text-grey-100">Duration</label>
                        <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 mb-3 text-sm bg-transparent border-[1px] border-black-50 rounded-md outline-none text-black-50 font-Kallisto dark:text-grey-100">
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="1m">1 month</option>
                            <option value="3m">3 months</option>
                            <option value="6m">6 months</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={listNFT} className="text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out">
                        {isLoading ? 'Loading...' : 'Complete Listing'}
                    </button>
                    <button onClick={onClose} className="text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out">
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default ListNFTModal;
