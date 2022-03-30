import React from 'react';
import {sanityClient, urlFor} from '../../sanity';
import Header from "../../components/Header";

const Post = () => {
    return (
        <main>
            <Header />
        </main>
    );
};

export default Post;

export const getStaticPaths = async () => {
    const query = `
    *[_type == "post"]{
    _id,
        slug {
            current
        }
    }`
};
