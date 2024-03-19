import React, { useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

function Card(props) {
    const [state, setState] = useState(true)
  return (
    <div className='rounded-lg border-grey-50 py-8 sm:p-5  px-8 gap-3 bg-white border-[1px] flex dark:bg-transparent flex-col'>
        <div className='flex justify-between items-center cursor-pointer' onClick={()=>setState(s => !s)}>
            <h1 className='text-black-400 font-Kallisto text-[12px] font-semibold dark:text-white uppercase'>{props.title}</h1>
            <IoIosArrowDown className={`text-lg text-black-50 dark:text-grey-100 ${state? 'rotate-180': ''}`}/>
        </div>
      {state && props.children}
    </div>
  )
}

export default Card
