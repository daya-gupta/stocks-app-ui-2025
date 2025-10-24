// import { getPosts } from '@/lib/posts'
// import { Post } from '@/ui/post'
import Link from "next/link";

export default function Page() {
//   const posts = await getPosts()
 
  return (
    // <ul>
    //   {posts.map((post) => (
    //     <Post key={post.id} post={post} />
    //   ))}
    // </ul>
    <div>
        <h1>Chart</h1>
        <Link href="/">Home</Link>
    </div>
  )
}