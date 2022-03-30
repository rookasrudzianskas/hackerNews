import React from 'react';
import {sanityClient, urlFor} from '../../sanity';
import Header from "../../components/Header";
import {Post} from "../../typings";
import {GetStaticProps} from "next";

interface Props {
    post: Post;
}
const Post = ({post}: Props) => {
    // console.log('🚀', post);
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
            </article>
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
