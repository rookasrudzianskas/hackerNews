import React from 'react';
import {sanityClient, urlFor} from '../../sanity';
import Header from "../../components/Header";
import {Post} from "../../typings";
import {GetStaticProps} from "next";

interface Props {
    post: Post;
}
const Post = ({post}: Props) => {
    console.log('🚀', post);
    return (
        <main>
            <Header />
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
        revalidate: 60,
    }

};
