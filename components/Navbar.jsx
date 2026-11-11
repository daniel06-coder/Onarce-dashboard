import { ShieldCheck, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <main className='h-18 flex items-center justify-center mb-1'>
      <div className='flex justify-between  items-center w-full p-2 '>
        <div className='flex items-center justify-center space-x-3'>

        <button className='text-md pointer font-semibold flex justify-center items-center gap-1'>
          <ShoppingBag className='text-blue-700 size-6'/>
            Onarce
        </button>


        <div className='border-l h-5 text-slate-400'></div>

        <div className='flex items-center justify-center rounded-full p-2 bg-blue-300/50 gap-2 h-6 w-[8rem]  text-blue-700'>
          <ShieldCheck className='size-4'/>
          <p className='text-[10px]'>Admin Dashboard</p>
        </div>
        </div>

        <div className='flex gap-4 justify-center '>
        <Link href={`#`} className='rounded-full bg-blue-700 p-1 h-7 w-7 flex items-center justify-center '>
           <User className='text-white'/>
        </Link>
        </div>
      </div>
    </main>
  )
}

export default Navbar
