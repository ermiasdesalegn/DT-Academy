import { useState, useEffect } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { PageLoader } from '../../components/layouts/PageLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export function PostsPage() {
  const { data: posts, isLoading } = usePosts();

  if (isLoading) return <PageLoader label="Loading feed..." />;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-16">
      <div className="mx-auto max-w-xl px-4 sm:px-0">
        
        {/* Feed Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recent Updates</h1>
        </div>
        
        {/* Feed Container */}
        <div className="space-y-6">
          {posts?.map((post) => (
            <div key={post._id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              
              {/* Post Header (Social Media Style) */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      {post.authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 leading-none">{post.authorName}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Content */}
              {post.kind === 'MEMORY_CHALLENGE' ? (
                <MemoryChallengePost post={post} />
              ) : (
                <div className="px-4 pb-3">
                  {post.title && <h2 className="text-lg font-bold text-slate-900 mb-1">{post.title}</h2>}
                  {post.content && <p className="text-sm text-slate-800 whitespace-pre-wrap">{post.content}</p>}
                  {post.mediaUrls.length > 0 && (
                    <div className="mt-4 grid gap-1 rounded-xl overflow-hidden">
                      {post.mediaUrls.map(url => (
                        <img key={url} src={url} alt="Post media" className="w-full h-auto object-cover max-h-[500px]" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Social Action Bar (Visual Only) */}
              <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between text-slate-500">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-sm font-medium hover:text-blue-600 transition-colors">
                    <Heart size={18} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium hover:text-blue-600 transition-colors">
                    <MessageCircle size={18} />
                    <span>Comment</span>
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-medium hover:text-blue-600 transition-colors">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}

          {posts?.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p>No posts available right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemoryChallengePost({ post }: { post: any }) {
  const [hasGuessed, setHasGuessed] = useState(false);
  const [guess, setGuess] = useState('');

  useEffect(() => {
    if (localStorage.getItem(`guessed_challenge_${post._id}`)) {
      setHasGuessed(true);
    }
  }, [post._id]);

  const handleGuess = () => {
    localStorage.setItem(`guessed_challenge_${post._id}`, 'true');
    setHasGuessed(true);
  };

  return (
    <div>
      <div className="px-4 pb-3 text-sm text-slate-800">
        <span className="font-semibold text-blue-600 mr-2">#MemoryChallenge</span>
        {post.questionText}
      </div>
      
      {!hasGuessed ? (
        <div className="relative">
          <img src={post.pastPhotoUrl} alt="Past" className="w-full h-auto object-cover max-h-[500px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            
            <div className="mt-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              {post.questionType === 'MULTIPLE_CHOICE' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {post.options?.map((opt: string) => (
                    <Button key={opt} variant="secondary" onClick={handleGuess} className="bg-white/90 hover:bg-white text-slate-900 shadow-sm font-semibold h-10">
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 w-full">
                  <Input 
                    placeholder="Type your guess..." 
                    className="bg-white/90 border-0 placeholder:text-slate-500 text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                    value={guess} 
                    onChange={e => setGuess(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleGuess()}
                  />
                  <Button onClick={handleGuess} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">Guess</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700">
          <div className="relative">
            {post.currentPhotoUrl ? (
               <div className="flex">
                 <div className="w-1/2 relative group">
                   <img src={post.pastPhotoUrl} alt="Past" className="w-full h-auto object-cover max-h-[400px]" />
                   <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Then</div>
                 </div>
                 <div className="w-1/2 relative group border-l border-white">
                   <img src={post.currentPhotoUrl} alt="Now" className="w-full h-auto object-cover max-h-[400px]" />
                   <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Now</div>
                 </div>
               </div>
            ) : (
              <img src={post.pastPhotoUrl} alt="Past" className="w-full h-auto object-cover max-h-[500px]" />
            )}
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity">
               <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center transform scale-100 transition-transform">
                 <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Correct Answer</p>
                 <p className="text-2xl font-black text-emerald-600">{post.correctAnswer}</p>
                 {post.studentName && (
                   <p className="mt-1 text-sm text-slate-600 font-medium">{post.studentName}</p>
                 )}
               </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-emerald-50 border-y border-emerald-100 flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
             <div>
               <p className="text-sm font-semibold text-emerald-800">You revealed the memory!</p>
               <p className="text-xs text-emerald-600">Hover over the image to see the answer again.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
