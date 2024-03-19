import React from 'react'
import { GoCheckCircleFill  } from "react-icons/go";
import { Link } from 'react-router-dom';

function NFTCard({ image, name, id, price, last_price, buttonTitle, onClick}) {
    return (
        <div className={`rounded-lg overflow-hidden card w-[285px] sm:w-[48%] flex flex-col bg-white dark:bg-black-500 shadow-md relative`}>
            <Link to={`/nft/${id}`} className='h-[300px] sm:h-[150px] overflow-hidden'>
                <img src={image} className='w-full h-full object-cover transition-all ease-linear saturate-100' onError={(e) => e.target.src='https://marketplace-image.onxrp.com/?uri=ipfs%3A%2F%2FQmdw4DunRd2oHjEkc4EjU94J17KcsAs16Z9BtrJKrM21vk&collection=399215541&width=1000'} />
            </Link>
            <div className='px-6 py-4 sm:px-3 sm:py-22'>
                <h1 className='flex justify-start items-center gap-2 text-black-400 font-Kallisto font-medium text-[13px] dark:text-white uppercase sm:text-[11px]'>{name} #{id}
                    <GoCheckCircleFill  className='text-blue-200 text-base sm:text-sm dark:bg-white rounded-full border-blue-200 dark:border-[1px]' />
                </h1>
                <p className='text-xl font-Kallisto font-bold mt-2 sm:mt-1 dark:text-white sm:text-sm'>$ {price}</p>
                <p className='text-black-50 text-[11px] font-Kallisto font-medium tracking-wider mt-2 sm:mt-1 dark:text-grey-100 sm:tex-[10px]'>Last Sale $ {last_price}</p>
            </div>
            <button onClick={onClick} className='bg-blue-100 w-full py-2 absolute div -bottom-20 cursor-pointer transition-all ease-linear duration-250'>
                <p className='text-sm font-Kallisto font-medium uppercase text-center text-white/75 tracking-wider'>{buttonTitle}</p>
            </button>
        </div>
    )
}

export default NFTCard
