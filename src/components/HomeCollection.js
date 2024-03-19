import React from 'react'
import { Link } from 'react-router-dom'

function HomeCollection({ collections }) {
  return (
    <div className='flex flex-col w-full'>
      <div className='flex justify-between items-center gap-20 mb-2'>
        <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left w-[65%] sm:w-[55%]'>COLLECTION</p>
        <div className='flex justify-start gap-10 items-center w-[35%] sm:w-[45%] sm:gap-7'>
          <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>FLOOR</p>
          <p className='text-[11px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>VOLUME</p>
        </div>
      </div>

      {collections?.map((c, index) => {
        return <Link to={`/collection/${0}`} key={index} className='flex justify-between py-4 px-2 sm:py-3 hover:bg-grey-100/10 rounded-md'>
          <div className='flex justify-start items-center gap-3 sm:gap-2 w-[65%]  sm:w-[60%]'>
            <p className='text-[10px] uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>{index+1}</p>
            <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src="https://marketplace-image.onxrp.com/?uri=https%3A%2F%2Fnftimg.onxrp.com%2F1708498372104img_3263.gif&width=250&height=250" />
            <p className='text-sm uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>FURY XRPL</p>
          </div>
          <div className='flex justify-start gap-10 items-center w-[30%] sm:w-[35%] sm:gap-8'>
            <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>$ 320</p>
            <p className='text-sm sm:text-[10px] uppercase font-Kallisto font-semibold text-black-400 dark:text-grey-100 text-left'>$ 3410</p>
          </div>
        </Link>
      })}

    </div>
  )
}

export default HomeCollection
