import React from 'react'
import Dropdown from '../components/Dropdown'
import { Link } from 'react-router-dom'

function Statstics() {
    return (
        <div className='py-20 justify-center items-center flex sm:px-5 sm:py-16'>
            <div className='w-[1257px] sm:w-full'>
                <h1 className='font-semibold font-Kallisto text-black-400 uppercase tracking-wider text-[48px] dark:text-white sm:text-2xl'>STATISTICS</h1>

                <div className='flex justify-end items-end'>
                    <span className='w-[150px] sm:w-[50%]'>
                        <Dropdown options={[{ id: 'Total', value: 'Total' }, { id: 'Today', value: 'Today' }, { id: 'l_week', value: 'Last Week' }, { id: 'l_month', value: 'Last Month' }]} selectedOption={() => { }} />
                    </span>
                </div>

                <div className="overflow-x-auto my-5">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[250px]">Collection</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]">Volume</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]">Floor</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px] whitespace-nowrap"># of Sales</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px]">Owners</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px] whitespace-nowrap">Av. sale</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px] whitespace-nowrap">% Listed</th>
                                <th className="text-sm sm:text-[12px] py-2 uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left min-w-[100px] whitespace-nowrap"># Listed</th>
                            </tr>
                        </thead>
                        <tbody>
                        {[1,1,,1,1,1,,1,1,1,,1,1].map((x, i) => (
                            <tr key={i} className='hover:bg-black-50/10 transition-all ease-in duration-200'>
                                <td className='px-5 py-3'>
                                    <Link to={`/collection/${'0xb9eE65be6b413fcB711ced63cCA8EFFB3AE445e7'}`} className='flex items-center gap-5'>
                                        <p className='text-sm uppercase font-Kallisto font-medium text-black-50 dark:text-grey-100 text-left'>1</p>
                                        <img className='w-[60px] h-[60px] sm:w-[40px] sm:h-[40px] rounded-lg object-cover' src={'https://marketplace-image.onxrp.com/?uri=https%3A%2F%2Fnftimg.onxrp.com%2F1686070473103onxrp_avatar-display_v2.jpg&width=250&height=250'} alt={''} />
                                        <p className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{'Punks'}</p>
                                    </Link>
                                </td>
                                <td>
                                    <div className='flex items-center'>
                                        <img src={require('../assets/logo/bttc.png')} className='w-4 mr-1' alt="BTTC Logo" />
                                        <p className='text-sm w-[80px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>5555</p>
                                    </div>
                                </td>
                                <td>
                                    <div className='flex items-center'>
                                        <img src={require('../assets/logo/bttc.png')} className='w-4 mr-1' alt="BTTC Logo" />
                                        <p className='text-sm w-[80px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>5555</p>
                                    </div>
                                </td>
                                <td className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{'2876'}</td>
                                <td className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{'2013'}</td>
                                <td>
                                    <div className='flex items-center'>
                                        <img src={require('../assets/logo/bttc.png')} className='w-4 mr-1' alt="BTTC Logo" />
                                        <p className='text-sm w-[80px] sm:text-[10px] uppercase font-Kallisto font-medium text-black-400 dark:text-grey-100 text-left'>5555</p>
                                    </div>
                                </td>
                                <td className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{'9'}</td>
                                <td className='text-sm uppercase font-Kallisto ml-3 font-medium text-black-400 dark:text-grey-100 text-left sm:text-[12px]'>{'652'}</td>
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
