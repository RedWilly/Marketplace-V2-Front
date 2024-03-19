import React from 'react';
import CollectionCard from './CollectionCard';
import Dropdown from './Dropdown';
import whitelist from '../components/whitelist'; // Ensure this is correctly imported


function Collections() {
  // Convert whitelist object keys into an array to map over
  const collectionNames = Object.keys(whitelist);

  return (
    <div className='mt-6'>
      <div className='flex justify-between items-center sm:flex-col sm:gap-2'>
        <span className='w-[350px] sm:w-full z-20'>
          <Dropdown transparent={true} options={[{ id: 'Trending', value: 'New' }, { id: 'Top', value: 'Oldest to new' }]} placeHolder={"Category"} selectedOption={() => { }} />
        </span>
        <span className='w-[350px] sm:w-full'>
          <Dropdown transparent={true} options={[{ id: 'Trending', value: 'New to Oldest' }, { id: 'Top', value: 'Oldest to new' }]} selectedOption={() => { }} />
        </span>
      </div>

      <div className='flex justify-start items-start gap-9 flex-wrap mt-9 sm:mt-3 sm:gap-3'>
        {collectionNames.map((name, index) => {
          // Use the name to get the corresponding image
          const { image } = whitelist[name];
          return (
            <CollectionCard
              key={index}
              image={image}
              name={name}
              floor_price={20} // Keeping the floor price constant will change that later on 
              volume={'305K'} // same here
            />
          );
        })}
      </div>
    </div>
  );
}

export default Collections;
