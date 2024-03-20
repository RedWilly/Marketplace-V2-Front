import React, { useState } from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json';
import { useWallet } from '../../hooks/useWallet';

import {
    useToast
} from '@chakra-ui/react';

const DeListNFTModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const deListNFT = async () => {
        setIsLoading(true);
        return new Promise(async (resolve, reject) => {
            if (!library || !contractAddress || !tokenId) {
                toast({
                    title: 'Error',
                    description: 'Please ensure you have selected a valid NFT to delist.',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
                setIsLoading(false);
                reject('Invalid input data');
                return;
            }

            try {
                const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
                const tx = await marketContract.delistToken(contractAddress, tokenId);
                await tx.wait();

                toast({
                    title: 'NFT Delisted',
                    description: 'The NFT has been successfully delisted.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                onClose(); // Close the modal after successful delisting
                setIsLoading(false);
                resolve();
            } catch (error) {
                console.error('Failed to delist NFT:', error);
                toast({
                    title: 'Delisting Failed',
                    description: 'Failed to delist NFT. Your NFT might have already been bought or expired.',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
                setIsLoading(false);
                reject(error);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full  bg-black-500/80" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4 ">
                <div className="rounded-lg shadow-xl overflow-hidden max-w-sm w-full  bg-white dark:bg-black-600">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold font-Kallisto dark:text-white">Delist NFT</h3>
                        <p className="text-sm text-black-400 dark:text-white">Are you sure you want to delist this NFT?</p>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 flex justify-end items-center gap-3">
                        <button className="text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out" onClick={() => deListNFT().catch(console.error)}>
                            {isLoading ? 'Loading...' : 'Confirm Delist'}
                        </button>
                        <button className="text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeListNFTModal;
