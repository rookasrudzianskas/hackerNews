import React from 'react';
import {sanityClient, urlFor} from '../../sanity';
import Header from "../../components/Header";
import {Post} from "../../typings";
import {GetStaticProps} from "next";
import PortableText from 'react-portable-text';

interface Props {
    post: Post;
}
const Post = ({post}: Props) => {
    // console.log('🚀', post);
    // @ts-ignore
    return (
        <main>
            <Header />
            <img src={urlFor(post.mainImage).url()} className="w-full object-cover h-40" alt=""/>

            <article className="max-w-3xl mx-auto p-5">
                <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

                <div className="flex items-center space-x-2">
                    <img src={urlFor(post.author.image).url()!} className="h-10 w-10 rounded-full" alt=""/>
                    <p className="font-extralight text-sm">Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
                </div>

                <div className="mt-10">
                    <PortableText
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        content={post.body}
                        className=""
                        serializers={
                            {
                                h1: (props: any) => (
                                  <h1 className="text-2xl font-bold my-5" {...props} />
                                ),
                                h2: (props: any) => (
                                    <h1 className="text-xl font-bold my-5" {...props} />
                                ),
                                //@ts-ignore
                                li: ({children}) => (
                                    <li className="ml-4 list-disc" >{children}</li>
                                ),
                                link: ({href, children}: any) => (
                                    <a href={href} className="text-blue-500 hover:underline">{children}</a>
                                ),
                            }
                        }
                    />
                </div>


            </article>

            <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

            <form action="" className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
                <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
                <h4 className="text-3xl font-bold">Leave a comment below!</h4>
                <hr className="py-3 mt-2"/>

                <label htmlFor="" className="block mb-5">
                    <span className="text-gray-700 ">Name</span>
                    <input className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500" placeholder="John Appleseed" type="text"/>
                </label>

                <label htmlFor="" className="block mb-5">
                    <span className="text-gray-700 ">Email</span>
                    <input className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500" placeholder="john.appleseed@john.com" type="text"/>
                </label>

                <label htmlFor="" className="block mb-5">
                    <span className="text-gray-700 ">Comment</span>
                    <textarea className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500" placeholder="John Appleseed is a super blockchain hero" rows={8} />
                </label>

            </form>
        </main>
    );
};

export default Post;

// prepares the pages
// this gets all the pages paths
export const getStaticPaths = async () => {
    const query = `
    *[_type == "post"]{
    _id,
        slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }));

    return {
        paths,
        fallback: 'blocking',
    }
};

//this makes the page
// this uses the paths to make the page of it with info fetched from sanity
export const getStaticProps: GetStaticProps = async ({params}) => {
    const query = `
    *[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
                name,
                image
        },

    description,
    mainImage,
    slug,
    body
  }`;

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
       });

    if(!post) {
        return {
            notFound: true
            // will return 404 if the page is not found
        }
    }



    return {
        props: {
            post: post,
        },
        revalidate: 60, // after 60 seconds it will remake the page 🚀
    }

};
