import React from 'react';
import { ethers } from 'ethers';
import MarketABI from '../../abi/market.json'; // Ensure this path is correct
import { useWallet } from '../../hooks/useWallet';

const CancelBidModal = ({ isOpen, onClose, contractAddress, tokenId }) => {
    const marketplaceAddress = process.env.REACT_APP_MARKETPLACE_ADDRESS;
    const { library } = useWallet();

    const showToast = (message) => {
        alert(message);
    };

    const cancelBid = async () => {
        if (!library || !contractAddress || !tokenId) {
            showToast('Please ensure you have selected a valid NFT to cancel the bid for.', 'error');
            return;
        }

        try {
            const marketContract = new ethers.Contract(marketplaceAddress, MarketABI, library.getSigner());
            const tx = await marketContract.withdrawBidForToken(contractAddress, tokenId);
            await tx.wait();

            showToast('Bid cancelled successfully!', 'success');
            onClose(); // Close the modal after successful cancellation
        } catch (error) {
            console.error('Failed to cancel bid:', error);
            showToast('Failed to cancel bid. See console for details.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full bg-black-500/80" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full dark:bg-black-600">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold font-Kallisto dark:text-white">Cancel Bid</h3>
                        <p className="text-sm text-black-400 dark:text-white">Are you sure you want to cancel your bid for this NFT?</p>
                    </div>
                    <div className="bg-gray-50 flex justify-end items-center gap-3">
                        <button className="text-[12px] sm:px-6 py-1 sm:text-[10px] uppercase font-Kallisto text-white px-7 py-2 tracking-wider font-medium hover:bg-grey-100/85 dark:text-white bg-black-500 cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-150 ease-in-out" onClick={cancelBid}>
                            Confirm Cancel Bid
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

export default CancelBidModal;
