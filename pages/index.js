// pages/index.js
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { useEffect, useState } from "react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import awsExports from "../src/aws-exports";
import { createPost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  return {
    props: {
      posts: response.data.listPosts.items,
    },
  };
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });

    window.location.href = `/`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

const AuthStateApp = ({ posts = [] }) => {
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  if (!posts) {
    return <div>No posts yet!</div>;
  }

  return authState === AuthState.SignedIn && user ? (
    <div className="App">
      <div>Hello, {user.username}</div>
      <button type="button" onClick={() => Auth.signOut()}>
        Sign out
      </button>

      <h2>{posts.length} posts</h2>

      <form onSubmit={handleCreatePost}>
        <fieldset>
          <legend>Title</legend>
          <input
            defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
            name="title"
          />
        </fieldset>

        <fieldset>
          <legend>Content</legend>
          <textarea
            defaultValue="I built an Amplify app with Next.js!"
            name="content"
          />
        </fieldset>

        <button>Create Post</button>
      </form>

      <div>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.id}-{post.title}-{post.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <AmplifyAuthenticator />
  );
};

export default AuthStateApp;
