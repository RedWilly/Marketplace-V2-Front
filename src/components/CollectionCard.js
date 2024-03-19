import React from 'react';
import { GoCheckCircleFill } from 'react-icons/go';
import { Link } from 'react-router-dom';
import whitelist from '../components/whitelist';


function CollectionCard({ name, floor_price, volume }) {
    const { address, image } = whitelist[name];

    return (
        <Link to={`/collection/${address}`} className='rounded-lg overflow-hidden card w-[31%] sm:w-full flex flex-col bg-white dark:bg-black-500 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all ease-in duration-200 relative'>
            {/* <img src={image} className='w-full h-44 object-cover sm:h-36' alt={name} /> best image size is 800px : 400px */}
            <img src={image} style={{ width: '800px', height: '400px', objectFit: 'cover' }} className='w-full object-cover sm:h-36' alt={name} />
            <div className='px-6 py-4 sm:px-4'>
                <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-lg dark:text-white uppercase sm:text-base'>{name}
                    <GoCheckCircleFill className='text-purple text-base dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                </h1>
                <div className='flex justify-start items-start mt-4 sm:mt-2'>
                    <span className='w-[50%]'>
                        <p className='text-black-50 text-[12px] font-Kallisto font-medium uppercase dark:text-grey-100 sm:text-[10px]'>Floor</p>
                        <p className='text-black-400 text-sm font-Kallisto font-medium uppercase dark:text-white sm:text-[12px]'>$ {floor_price}</p>
                    </span>
                    <span className='w-[50%]'>
                        <p className='text-black-50 text-[12px] font-Kallisto font-medium uppercase dark:text-grey-100 sm:text-[10px]'>Total Volume</p>
                        <p className='text-black-400 text-sm font-Kallisto font-semibold uppercase dark:text-white sm:text-[12px]'>{volume}</p>
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default CollectionCard;
