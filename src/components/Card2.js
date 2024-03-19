import React, { useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

function Card2(props) {
    const [state, setState] = useState(true)
  return (
    <div className=''>
        <div className='flex mb-2 justify-between items-center cursor-pointer' onClick={()=>setState(s => !s)}>
            <h1 className='text-black-400 font-Kallisto text-[12px] font-semibold dark:text-white uppercase'>{props.title}</h1>
            <IoIosArrowDown className={`text-lg text-black-50 dark:text-white ${state? 'rotate-180': ''}`}/>
        </div>
      {state && props.children}
    </div>
  )
}

export default Card2
