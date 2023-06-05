import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import * as reactUse from 'react-use';
import useSocket from '../../hooks/useSocket';
import type { Post } from '../types/post';
import { PostCard } from './PostCard';
import { QRCodeDisplayer } from '../components/QRcode';

export const App = () => {
  const placeholder: Post = {
    id: '1',
    api: 'twitter',
    author: {
      name: 'John Doe',
      username: 'johndoe',
      image: 'https://i.pravatar.cc/300',
    },
    content: {
      text: 'Hello World',
      images: [
        'https://placeimg.com/1000/512/nature',
        'https://placeimg.com/1000/512/animals',
        'https://placeimg.com/1000/512/any/sepia',
        'https://placeimg.com/1000/512/nature/sepia',
      ],
    },
    date: new Date(),
    originUrl: 'https://twitter.com/johndoe/status/1',
  };

  const [post, setPost] = useState<Post | string | null>(null);
  const [nextPost, setNextPost] = useState<Post | string | null>(null);
  const [serverIp, setServerIp] = useState('https://ict4s23.irisa.fr/admin');
  let [isShowing, setIsShowing] = useState(true);
  let [, , resetIsShowing] = reactUse.useTimeoutFn(() => setIsShowing(true), 400);
  const socket = useSocket(serverIp, (socket) => {
    socket.on('post', (p) => {
      updatePost(p);
    });
    socket.on('image', (image) => {
      updatePost('data:image/png;base64,' + image);
    });
  });

  function updatePost(p: Post | string) {
    setNextPost(p);
    setIsShowing(false);
    resetIsShowing();
  }

  useEffect(() => {
    if (!post && nextPost) {
      setPost(nextPost);
      setNextPost(null);
    }
  }, [post, nextPost]);

  if (socket == null) {
    return (
      <div className='flex flex-col h-full bg-red-200 p-20 gap-5 text-red-800'>
        <h1 className='font-black text-6xl'>NOT CONNECTED</h1>
        <input
          type='text'
          placeholder='Type here'
          value={serverIp}
          onChange={(e) => setServerIp(e.target.value)}
          className='w-full max-w-xs bg-black/10 p-2 border-b-4 border-b-white/50 text-sm'
        />
      </div>
    );
  }

  return (
    <div className='relative h-full overflow-hidden'>
      <button
        className='absolute bottom-5 left-5 w-fit h-fit opacity-0 hover:opacity-100 transition-all duration-500 text-white'
        onClick={() => setServerIp('')}
      >
        Disconnect
      </button>

      <img
        src={post as string}
        alt=''
        className={`object-cover absolute h-full w-full  -z-10 blur-xl brightness-50 scale-110 duration-500 transition-all ${
          typeof post === 'string' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <img
        src='/abstract.webp'
        alt=''
        className='object-cover absolute h-full w-full brightness-75 -z-20 blur-xl scale-110'
      />
      <div className='h-full px-16 py-14 flex items-center justify-center'>
        {post && (
          <Transition
            appear
            show={isShowing}
            enter='transform transition duration-[500ms] ease-[cubic-bezier(.52,.01,.51,1.01)]'
            enterFrom='opacity-0 -rotate-[40deg] scale-50 translate-x-[40vw] -translate-y-32'
            enterTo='opacity-100 rotate-0 scale-100'
            leave='transform duration-[300ms] transition ease-[cubic-bezier(.52,.01,.51,1.01)]'
            leaveFrom='opacity-100 rotate-0 scale-100 '
            leaveTo='opacity-0 rotate-[-40deg] scale-50 -translate-x-[40vw] translate-y-32'
            afterLeave={() => {
              setPost(nextPost);
              setNextPost(null);
            }}
          >
            {typeof post === 'string' ? (
              <>
                <div
                  className={`flex flex-col bg-white overflow-hidden relative rounded-3xl shadow-2xl`}
                  style={{ height: '90vh', maxWidth: '90vw' }}
                >
                  <img src={post as string} className='h-full w-full' />
                </div>
                <div className='absolute -right-4 -bottom-4 rounded-lg overflow-hidden shadow-lg flex flex-col items-center bg-white text-sm font-medium text-slate-700 '>
                  <div className='pt-2 px-2'>Join the feed!</div>
                  <QRCodeDisplayer />
                </div>
              </>
            ) : (
              <PostCard post={post} className='rounded-3xl shadow-2xl' />
            )}
          </Transition>
        )}
        {/* <button
          onClick={() => {
            setIsShowing(false);
            resetIsShowing();
          }}
          className='absolute bottom-5 right-5 p-3 rounded-md text-white bg-black/20 hover:bg-black/40'
        >
          animate
        </button> */}
      </div>
    </div>
  );
};
