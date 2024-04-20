import React, { useEffect, useState } from 'react';
import Dropdown from '../components/Dropdown'
import { Link } from 'react-router-dom'
import MarketplaceApi from '../utils/MarketplaceApi';
import { ethers } from 'ethers';
import whitelist from '../components/whitelist';


function Statstics() {
    const [rawCollections, setRawCollections] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bttToUsdPrice, setBttToUsdPrice] = useState(null);
    const [sortOrder, setSortOrder] = useState('High');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const allStats = await MarketplaceApi.fetchAllCollectionStats();
                const statsWithListings = await Promise.all(allStats.map(async (stat) => {
                    const listings = await MarketplaceApi.fetchActiveListingsForCollection(stat.address);
                    const matchingWhitelistEntry = Object.values(whitelist).find(wl => wl.address.toLowerCase() === stat.address.toLowerCase());
                    return {
                        ...stat,
                        listedCount: listings.length,
                        totalVolumeTraded: stat.totalVolumeTraded,
                        floorPrice: stat.floorPrice,
                        image: matchingWhitelistEntry ? matchingWhitelistEntry.image : require("../assets/IMG/pfp_not_found.png")
                    };
                }));
                setRawCollections(statsWithListings);
            } catch (error) {
                console.error('Failed to fetch collection stats or listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // fetch price
    useEffect(() => {
        const fetchBttPrice = async () => {
            try {
                const price = await MarketplaceApi.fetchCurrentPrice();
                setBttToUsdPrice(price);
            } catch (error) {
                console.error("Failed to fetch BTT price", error);
            }
        };

        fetchBttPrice();
    }, []);

    useEffect(() => {
        // Sort rawCollections based on sortOrder and update collections state
        const sortedCollections = [...rawCollections].sort((a, b) => {
            return sortOrder === 'High' ?
                parseFloat(b.totalVolumeTraded) - parseFloat(a.totalVolumeTraded) :
                parseFloat(a.totalVolumeTraded) - parseFloat(b.totalVolumeTraded);
        });
        setCollections(sortedCollections);
    }, [sortOrder, rawCollections]);

    if (loading) {
        return <div>Loading...</div>;
    }

    //format price
    const formatPriceWithUSD = (bttAmount) => {
        const num = parseFloat(ethers.utils.formatEther(bttAmount));
        const formattedBTT = formatPrice(num);

        const priceInUSD = bttToUsdPrice ? (
            <span style={{ fontSize: 'small', fontWeight: 'normal', color: '#6b7280' /* gray-500 */ }}>
                (${(num * bttToUsdPrice).toFixed(3)})
            </span>
        ) : (
            <span style={{ fontSize: 'small', fontWeight: 'normal', color: '#6b7280' }}>
                (USD not available)
            </span>
        );

        return (
            <span>{formattedBTT} {priceInUSD}</span>
        );
    };


    //fomart M,K,T
    const formatPrice = (value) => {
        const num = Number(value);

        if (num >= 1e9) { // For billions
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) { // For millions
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) { // For thousands
            return (num / 1e3).toFixed(2) + 'K';
        } else { // For numbers less than 1000
            return num.toString();
        }
    };

    return (
        <div className='py-20 justify-center items-center flex sm:px-5 sm:py-16'>
            <div className='w-[1257px] sm:w-full'>
                <h1 className='font-semibold font-Kallisto text-black-400 uppercase tracking-wider text-[48px] dark:text-white sm:text-2xl'>STATISTICS</h1>

                <div className='flex justify-end items-end'>
                    <span className='w-[150px] sm:w-[50%]'>
                        <Dropdown options={[{ id: 'High', value: 'High' }, { id: 'Low', value: 'Low' }]}
                            selectedOption={(option) => setSortOrder(option.value)} />
                    </span>
                </div>

                <div className="overflow-x-auto my-5">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[250px]">Collection</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]">Volume</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]">Floor</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px] whitespace-nowrap"># Listed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((collection, i) => (
                                <tr key={i} className='hover:bg-black-50/10 transition-all ease-in duration-200'>
                                    <td className='px-5 py-3'>
                                        <Link to={`/collection/${collection.address}`} className='flex items-center gap-5'>
                                            <p className='text-sm uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{i + 1}</p>
                                            <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={collection.image} alt={collection.name} />
                                            <p className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.name}</p>
                                        </Link>
                                    </td>
                                    <td>
                                        <div className='flex items-center'>
                                            <img src={require('../assets/logo/bttc.png')} className='w-4 mr-1' alt="BTTC Logo" />
                                            <p className='text-sm w-[80px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>{formatPriceWithUSD(collection.totalVolumeTraded)}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='flex items-center'>
                                            <img src={require('../assets/logo/bttc.png')} className='w-4 mr-1' alt="BTTC Logo" />
                                            <p className='text-sm w-[80px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>{formatPriceWithUSD(collection.floorPrice)}</p>
                                        </div>
                                    </td>
                                    <td className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{collection.listedCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Statstics
