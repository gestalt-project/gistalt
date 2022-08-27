import { useSession } from 'next-auth/react';
import { useRouter } from 'next/dist/client/router';
import { Tooltip } from '@mui/material';
import Icon from '@material-tailwind/react/Icon';
import 'rsuite/dist/rsuite.min.css';
import { IconButton } from '../components/Buttons';

export default function Header() {
    const { data: session, status } = useSession(),
        router = useRouter()
    
    return (
        <div>

            <header className='bg-github-gray sticky top-0 z-50 flex items-center px-4 py-0.5 shadow-md '>
                <Tooltip title="Home">
                <div className="p-3">
                <IconButton onClickFunc={() => router.push("/")} icon='home' size='2xl' />
                </div>
                </Tooltip>

                <Tooltip title="Following">
                <div className="p-3">
                <IconButton onClickFunc={() => router.push("/propose")} icon='list' size='2xl' />
                </div>
                </Tooltip>
                
                <Tooltip title="Create">
                <div className="p-3">
                <IconButton onClickFunc={
                    () => 
                    router.push("/create")
                    } icon='library_add' size='2xl' />
                </div>
                </Tooltip>
                
                <h1 className='hidden md:inline-flex ml-2 text-lg text-gray-700 font-bold'>Gistalt</h1>

                <div className='mx-5 md:mx-5 flex flex-grow items-center px-5 py-1 bg-github-gray2 text-gray-700 rounded-lg focus-within:text-light-gray focus-within:shadow-md'>
                    <Icon name='search' size='2xl' color='gray-200' />
                    <input type='text' placeholder='Search' className='flex-grow px-5 text-base bg-transparent outline-none' />
                    
                </div>

                <Tooltip title="Messages">
                <div className="p-3">
                <IconButton onClickFunc={() => router.push("/messages")} icon='message' size='2xl' />
                </div>
                </Tooltip>

                <Tooltip title="Profile">
                <div className="p-3">
                <IconButton onClickFunc={() => router.push("/profile")} icon='person' size='2xl' />
                </div>
                </Tooltip>
                
                <Tooltip title="Sign Out">
                <div className="p-3">
                <img
                    loading='lazy'
                    className='hidden md:inline flex cursor-pointer h-8 w-8 rounded-full ml-2 object-cover'
                    src={session?.user?.image}
                    // src="https://static.wixstatic.com/media/51fb1a_995dc68a3bd046389fc42220e99574c4~mv2.jpg/v1/crop/x_0,y_173,w_3006,h_2909/fill/w_694,h_672,al_c,q_85,usm_0.66_1.00_0.01/Portrait_JPG.webp"
                    alt={session?.user?.email}
                />
                </div>
                </Tooltip>

                <Tooltip title="About">
                <div className="p-3">
                <IconButton onClickFunc={() => router.push("/about")} icon='more_vert' size='2xl' />
                </div>
                </Tooltip>
                
            </header>
        </div>
    );
}