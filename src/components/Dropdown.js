import React, { useEffect, useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";

function Dropdown({options, selectedOption, placeHolder, transparent}) {
    const [selcted, setSelcted] = useState(options? options[0] : {})
    const [dropdown, setDropdowm] = useState(false)

    useEffect(()=>{
      selectedOption(selcted)
    }, [selcted])
  return (
    <div className='relative w-full '>
        <div className={`px-7 py-2 sm:px-4 border-[1px] rounded-md bg-white ${transparent? 'dark:bg-black-600' : 'dark:bg-black-500'} border-grey-50 flex justify-between items-center gap-3 cursor-pointer`} onClick={()=>setDropdowm(s => !s)}>
            <p className='text-[12px] font-normal tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100'>{placeHolder? placeHolder : selcted?.value}</p>
            <IoIosArrowDown className={`text-base text-black-50 dark:text-grey-100 transition-all ease-in duration-100 ${dropdown? 'rotate-180': ''}`}/>
        </div>
        {dropdown && <div className={`absolute top-10 w-full px-7 sm:px-3 py-4 border-[1px] rounded-md bg-white  dark:bg-black-500 border-grey-50 flex flex-col gap-2 z-30`}>
            {options?.map((o, index) => {
              return <p 
                onClick={()=>{
                  setSelcted(o)
                  setDropdowm(false)
                }}
                className='text-[12px] font-normal tracking-wider uppercase font-Kallisto text-black-50 dark:text-grey-100 hover:underline cursor-pointer'>
                {o.value}
              </p>
            })}
        </div>}
    </div>
  )
}

export default Dropdown
