import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json';
import WETHABI from '../../abi/erc20.json';
import { useWallet } from '../../hooks/useWallet';

import {
    useToast
} from '@chakra-ui/react';

const MakeOffer = ({ isOpen, onClose, erc721Address, tokenId, nft, onOfferSubmitted }) => {
    const { account, library } = useWallet();
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const WETHAddress = process.env.REACT_APP_WETH_ADDRESS;
    const [value, setValue] = useState('');
    const [duration, setDuration] = useState('24h');
    const [isApproved, setIsApproved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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


    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const signer = library.getSigner(account);
            const WETHContract = new ethers.Contract(WETHAddress, WETHABI, signer);
            const maxUint256 = ethers.constants.MaxUint256;
            const tx = await WETHContract.approve(marketplaceAddress, maxUint256);
            await tx.wait();
            setIsApproved(true);
            setIsLoading(false);
            toast({
                title: "Approval successful",
                description: "You can now make an offer.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Approval failed:', error);
            setIsLoading(false);
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
        setIsLoading(true);
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
            setIsLoading(false);
            toast({
                title: "Offer submitted successfully",
                description: "Your offer has been placed.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            if (onOfferSubmitted) {
                onOfferSubmitted();
            }
        } catch (error) {
            console.error('Offer submission failed:', error);
            setIsLoading(false);
            toast({
                title: "Offer failed",
                description: "See console for more details.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

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

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full bg-black-500/80" onClick={onClose}></div>
            <div className="fixed top-20 left-1/4 right-1/4 bg-white dark:bg-black-600 rounded-lg shadow-xl p-6 sm:left-5 sm:right-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold font-Kallisto dark:text-white">Make an Offer</h2>
                    <button onClick={onClose} className="text-xl font-semibold dark:text-white">X</button>
                </div>
                <div className="my-4 text-center">
                    <img className="mx-auto rounded-md h-24 w-24 object-cover" src={nft.image} alt={nft.name} />
                    <p className="font-semibold font-Kallisto text-sm mt-2 dark:text-white">{nft.name}</p>
                </div>
                <div className='flex gap-4'>
                    <div className='flex flex-col gap-1 w-[50%]'>
                        <label className="block text-sm text-black-50 font-Kallisto dark:text-grey-100" htmlFor="amount">Amount in WBTT</label>
                        <input className="w-full p-2 mb-3 text-sm bg-transparent border-[1px] border-black-50 rounded-md outline-none text-black-50 font-Kallisto dark:text-grey-100" type="text" id="amount" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter amount in WBTT" />
                    </div>
                    <div className='flex flex-col gap-1 w-[50%]'>
                        <label className="block text-sm text-black-50 font-Kallisto dark:text-grey-100" htmlFor="duration">Duration</label>
                        <select className="w-full p-2 mb-3 bg-transparent outline-none border-[1px] border-black-50 rounded-md block text-sm text-black-50 font-Kallisto dark:text-grey-100" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="1m">1 month</option>
                            <option value="3m">3 months</option>
                            <option value="6m">6 months</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    {!isApproved && (
                        <button
                            onClick={handleApprove}
                            className='text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out'
                        >
                            {isLoading ? 'Loading...' : 'Approve'}
                        </button>
                    )}
                    <button
                        onClick={handleSubmitOffer}
                        className='text-[12px] sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out'
                        disabled={isLoading || !isApproved} // Disable the button if loading or not approved
                    >
                        {isLoading ? 'Loading...' : 'Confirm Offer'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default MakeOffer;

