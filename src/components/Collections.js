import React, { useEffect, useState } from 'react';
import CollectionCard from './CollectionCard';
import Dropdown from './Dropdown';
import { ethers } from 'ethers';
import whitelist from '../components/whitelist';
import MarketplaceApi from "../utils/MarketplaceApi"; // Make sure to import MarketplaceApi



function Collections() {
  const [collectionStats, setCollectionStats] = useState({});

  useEffect(() => {
    const fetchCollectionStats = async () => {
      const stats = {};

      for (const name of Object.keys(whitelist)) {
        const { address } = whitelist[name];
        try {
          const checksumAddress = ethers.utils.getAddress(address);
          const collectionStats = await MarketplaceApi.fetchCollectionStats(checksumAddress);
          stats[name] = {
            floorPrice: collectionStats.floorPrice,
            totalVolume: collectionStats.totalVolumeTraded
          };
        } catch (error) {
          console.error(`Failed to fetch stats for collection ${name}:`, error);
          stats[name] = { floorPrice: '0', totalVolume: '0' };
        }
      }

      setCollectionStats(stats);
    };

    fetchCollectionStats();
  }, []);

  return (
    <div className='mt-6'>
      <div className='flex justify-between items-center sm:flex-col sm:gap-2'>
        {/* <span className='w-[350px] sm:w-full z-20'>
          <Dropdown transparent={true} options={[{ id: 'Trending', value: 'New' }, { id: 'Top', value: 'Oldest to new' }]} placeHolder={"Category"} selectedOption={() => { }} />
        </span> */}
        <span className='w-[350px] sm:w-full'>
          <Dropdown transparent={true} options={[{ id: 'Trending', value: 'New to Oldest' }, { id: 'Top', value: 'Oldest to new' }]} selectedOption={() => { }} />
        </span>
      </div>

      <div className='flex justify-start items-start gap-9 flex-wrap mt-9 sm:mt-3 sm:gap-3'>
        {Object.keys(whitelist).map((name, index) => {
          const { image } = whitelist[name];
          const { floorPrice, totalVolume } = collectionStats[name] || {};

          return (
            <CollectionCard
              key={index}
              image={image}
              name={name}
              floor_price={floorPrice} // Now dynamically fetched
              volume={totalVolume} // Now dynamically fetched
            />
          );
        })}
      </div>
    </div>
  );
}

export default Collections;
